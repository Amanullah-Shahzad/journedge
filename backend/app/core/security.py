import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from passlib.context import CryptContext

from app.core.config import get_settings


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def new_token() -> str:
    return secrets.token_urlsafe(48)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def token_expiry(minutes: int | None = None) -> datetime:
    settings = get_settings()
    ttl = minutes if minutes is not None else settings.access_token_ttl_minutes
    return datetime.now(UTC) + timedelta(minutes=ttl)
