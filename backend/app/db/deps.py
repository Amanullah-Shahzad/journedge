from collections.abc import Generator

from fastapi import Cookie, Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import token_hash
from app.db.session import SessionLocal
from app.models.entities import AuthSession, User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
    journedge_session: str | None = Cookie(default=None),
) -> User:
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif journedge_session:
        token = journedge_session
    if not token:
        raise AppError("Authentication required", status_code=401, code="unauthorized")

    session = db.scalar(
        select(AuthSession).where(
            AuthSession.token_hash == token_hash(token),
            AuthSession.revoked_at.is_(None),
        )
    )
    if not session or session.is_expired:
        raise AppError("Session expired", status_code=401, code="session_expired")
    user = session.user
    if not user or not user.is_active:
        raise AppError("User is inactive", status_code=403, code="inactive_user")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise AppError("Admin access required", status_code=403, code="forbidden")
    return user
