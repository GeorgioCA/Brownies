from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from pathlib import Path
from pydantic import BaseModel, EmailStr

from core.config import settings
from core.database import init_db, engine, async_session
from routers import auth, profile, discovery, matches, notifications, reports, family, verification, preferences, subscriptions, admin
from websocket.handler import router as ws_router


async def load_runtime_settings():
    from sqlalchemy import select, text
    async with engine.connect() as conn:
        try:
            result = await conn.execute(text("SELECT key, value FROM app_settings"))
            for key, val in result:
                if key == "daily_likes_free":
                    settings.DAILY_LIKES_FREE = int(val)
                elif key == "daily_super_likes_free":
                    settings.DAILY_SUPER_LIKES_FREE = int(val)
                elif key == "max_photos_per_user":
                    settings.MAX_PHOTOS_PER_USER = int(val)
                elif key == "max_photo_size_mb":
                    settings.MAX_PHOTO_SIZE_MB = int(val)
                elif key == "max_voice_duration_seconds":
                    settings.MAX_VOICE_DURATION_SECONDS = int(val)
                elif key == "family_share_expire_days":
                    settings.FAMILY_SHARE_EXPIRE_DAYS = int(val)
        except Exception:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await load_runtime_settings()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(discovery.router)
app.include_router(matches.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(family.router)
app.include_router(verification.router)
app.include_router(preferences.router)
app.include_router(subscriptions.router)
app.include_router(admin.router)
app.include_router(ws_router, prefix=settings.API_V1_PREFIX)

# Static file serving for uploads
import os
upload_dir = settings.UPLOAD_DIR
upload_dir.mkdir(parents=True, exist_ok=True)
(upload_dir / "photos").mkdir(parents=True, exist_ok=True)
(upload_dir / "voice").mkdir(parents=True, exist_ok=True)
(upload_dir / "verification").mkdir(parents=True, exist_ok=True)
app.mount("/api/v1/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Admin dashboard static files
static_dir = Path("static")
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/admin", StaticFiles(directory="static/admin", html=True), name="admin")


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


class SubscribeRequest(BaseModel):
    name: str
    email: str


@app.post("/api/subscribe")
async def subscribe(req: SubscribeRequest):
    from sqlalchemy import select
    from models import WaitlistSubscriber
    from core.mail import notify_new_subscriber

    async with async_session() as db:
        # Check if already subscribed
        result = await db.execute(
            select(WaitlistSubscriber).where(WaitlistSubscriber.email == req.email)
        )
        if result.scalar_one_or_none():
            return {"success": True, "message": "You're already on the list!"}

        db.add(WaitlistSubscriber(name=req.name, email=req.email))
        await db.commit()

    notify_new_subscriber(req.name, req.email)

    return {"success": True, "message": "You're on the list!"}


# Landing page
landing_path = Path("static/landing/index.html")
if landing_path.exists():
    @app.get("/", response_class=HTMLResponse)
    async def landing():
        return landing_path.read_text(encoding="utf-8")
