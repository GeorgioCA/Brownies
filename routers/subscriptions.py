import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from core.auth_deps import get_current_user
from core.exceptions import NotFoundException, ValidationException
from core.razorpay import (
    create_order, verify_signature, verify_webhook_signature, fetch_payment,
)
from models import User, Subscription, Plan
from schemas import SubscriptionOut, SubscriptionOrderOut, VerifyPaymentRequest, SuccessResponse

router = APIRouter(prefix=f"{settings.API_V1_PREFIX}/subscriptions", tags=["subscriptions"])


async def _activate(user_id: int, plan: Plan | None, payment_id: str, db: AsyncSession):
    duration = plan.duration_days if plan else 30
    plan_name = plan.name if plan else "premium_monthly"
    plan_id_val = plan.id if plan else None

    sub = Subscription(
        user_id=user_id,
        plan_type=plan_name,
        plan_id=plan_id_val,
        payment_id=payment_id,
        starts_at=datetime.now(timezone.utc),
        ends_at=datetime.now(timezone.utc) + timedelta(days=duration),
        is_active=True,
    )
    db.add(sub)

    # Deactivate old subs
    old_result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.id != sub.id,
            Subscription.is_active == True,
        )
    )
    for old in old_result.scalars().all():
        old.is_active = False

    # Set user premium
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.is_premium = True


@router.get("/plans")
async def get_plans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plan).where(Plan.is_active == True).order_by(Plan.sort_order))
    return {
        "plans": [
            {"id": str(p.id), "name": p.name, "price": p.price_paise, "duration_days": p.duration_days}
            for p in result.scalars().all()
        ]
    }


@router.get("/me", response_model=SubscriptionOut)
async def get_my_subscription(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user.id, Subscription.is_active == True
        ).order_by(Subscription.ends_at.desc())
    )
    sub = result.scalars().first()
    if not sub:
        return SubscriptionOut(
            id=0, plan_type="free",
            starts_at=user.created_at or datetime.now(timezone.utc),
            ends_at=datetime(2099, 1, 1, tzinfo=timezone.utc),
            is_active=True,
        )
    return SubscriptionOut.model_validate(sub)


@router.post("/order", response_model=SubscriptionOrderOut)
async def create_subscription_order(
    plan_id: int = Query(..., description="Database plan ID"),
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Plan).where(Plan.id == plan_id, Plan.is_active == True))
    plan = result.scalar_one_or_none()
    if not plan or plan.price_paise == 0:
        raise ValidationException("Invalid plan")

    receipt = f"rcpt_{user.id}_{datetime.now(timezone.utc).timestamp():.0f}"
    order = create_order(plan.price_paise, "INR", receipt)

    return SubscriptionOrderOut(
        order_id=order["id"],
        amount=plan.price_paise,
        currency=order.get("currency", "INR"),
        key_id=settings.RAZORPAY_KEY_ID,
    )


@router.post("/verify")
async def verify_payment(
    req: VerifyPaymentRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Idempotency: check for duplicate payment_id
    dup = await db.execute(
        select(Subscription).where(Subscription.payment_id == req.payment_id)
    )
    if dup.scalar_one_or_none():
        return SuccessResponse(message="Payment already processed")

    # Look up plan
    plan = None
    if req.plan_id:
        plan_result = await db.execute(select(Plan).where(Plan.id == req.plan_id))
        plan = plan_result.scalar_one_or_none()

    # Verify payment signature
    if settings.RAZORPAY_KEY_SECRET:
        if not verify_signature(req.order_id, req.payment_id, req.signature):
            raise ValidationException("Payment signature verification failed")

    # Confirm payment status from Razorpay
    payment = fetch_payment(req.payment_id)
    if payment and payment.get("status") != "captured":
        raise ValidationException(f"Payment not captured (status: {payment.get('status')})")

    await _activate(user.id, plan, req.payment_id, db)
    await db.flush()
    return SuccessResponse(message="Payment verified, premium activated")


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    body_str = body.decode("utf-8")
    signature = request.headers.get("x-razorpay-signature", "")

    if settings.RAZORPAY_WEBHOOK_SECRET:
        if not verify_webhook_signature(body_str, signature):
            from core.exceptions import ForbiddenException
            raise ForbiddenException("Invalid webhook signature")

    event = json.loads(body_str)
    event_type = event.get("event", "")

    if event_type != "payment.captured":
        return {"status": "ignored"}

    payload = event.get("payload", {}).get("payment", {}).get("entity", {})
    payment_id = payload.get("id", "")
    notes = payload.get("notes", {})
    user_id_str = notes.get("user_id", "")
    plan_id_str = notes.get("plan_id", "")

    if not user_id_str or not payment_id:
        return {"status": "skipped", "reason": "missing user_id in notes"}

    user_id = int(user_id_str)

    # Idempotency
    dup = await db.execute(
        select(Subscription).where(Subscription.payment_id == payment_id)
    )
    if dup.scalar_one_or_none():
        return {"status": "duplicate"}

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return {"status": "skipped", "reason": "user not found"}

    plan = None
    if plan_id_str:
        plan_result = await db.execute(select(Plan).where(Plan.id == int(plan_id_str)))
        plan = plan_result.scalar_one_or_none()

    await _activate(user_id, plan, payment_id, db)
    await db.commit()
    return {"status": "ok"}


@router.post("/cancel")
async def cancel_subscription(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user.id, Subscription.is_active == True
        )
    )
    for sub in result.scalars().all():
        sub.is_active = False
    user.is_premium = False
    return SuccessResponse(message="Subscription cancelled")
