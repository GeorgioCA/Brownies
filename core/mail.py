import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from core.config import settings


def send_email(to: str, subject: str, body_html: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"[mail] SMTP not configured — would send to {to}: {subject}")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[mail] Failed to send to {to}: {e}")
        return False


def notify_new_subscriber(name: str, email: str) -> bool:
    subject = f"New Brownies sign-up: {name}"
    body = f"""
    <h2>New Waitlist Sign-up</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <hr>
    <p style="color:#888;font-size:12px">Brownies Landing Page</p>
    """
    return send_email(settings.NOTIFY_EMAIL, subject, body)
