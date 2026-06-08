from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import hash_password, new_token, token_expiry, token_hash, verify_password
from app.models.entities import AuthSession, EmailVerificationToken, PasswordResetToken, User, as_utc


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower().strip()))


def register_user(
    db: Session,
    email: str,
    password: str,
    full_name: str | None = None,
    trading_experience: str | None = None,
    preferred_market: str | None = None,
    country: str | None = None,
) -> tuple[User, str]:
    if get_user_by_email(db, email):
        raise AppError("Email already registered", status_code=409, code="email_taken")
    user = User(
        email=email.lower().strip(),
        password_hash=hash_password(password),
        full_name=full_name,
        trading_experience=trading_experience,
        preferred_market=preferred_market,
        country=country,
    )
    db.add(user)
    db.flush()

    verify_token = new_token()
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash(verify_token),
            expires_at=token_expiry(60 * 24),
        )
    )
    db.commit()
    db.refresh(user)
    return user, verify_token


def create_session(db: Session, user: User, ip_address: str | None, user_agent: str | None) -> str:
    token = new_token()
    db.add(
        AuthSession(
            user_id=user.id,
            token_hash=token_hash(token),
            expires_at=token_expiry(),
            ip_address=ip_address,
            user_agent=user_agent,
        )
    )
    db.commit()
    return token


def login_user(db: Session, email: str, password: str, ip_address: str | None, user_agent: str | None) -> tuple[User, str]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise AppError("Invalid credentials", status_code=401, code="invalid_credentials")
    if not user.is_active:
        raise AppError("User is inactive", status_code=403, code="inactive_user")
    token = create_session(db, user, ip_address, user_agent)
    return user, token


def logout_user(db: Session, token: str) -> None:
    session = db.scalar(select(AuthSession).where(AuthSession.token_hash == token_hash(token)))
    if session and session.revoked_at is None:
        session.revoked_at = datetime.now(UTC)
        db.commit()


def create_reset_token(db: Session, user: User) -> str:
    token = new_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash(token),
            expires_at=token_expiry(60),
        )
    )
    db.commit()
    return token


def reset_password(db: Session, token: str, password: str) -> None:
    record = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash(token)))
    if not record or record.used_at is not None or as_utc(record.expires_at) <= datetime.now(UTC):
        raise AppError("Reset token is invalid or expired", status_code=400, code="invalid_reset_token")
    user = db.get(User, record.user_id)
    user.password_hash = hash_password(password)
    record.used_at = datetime.now(UTC)
    db.commit()


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise AppError("Current password is incorrect", status_code=400, code="invalid_current_password")
    user.password_hash = hash_password(new_password)
    db.commit()


def verify_email(db: Session, token: str) -> User:
    record = db.scalar(select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash(token)))
    if not record or record.used_at is not None or as_utc(record.expires_at) <= datetime.now(UTC):
        raise AppError("Verification token is invalid or expired", status_code=400, code="invalid_verify_token")
    user = db.get(User, record.user_id)
    user.is_verified = True
    user.verified_at = datetime.now(UTC)
    record.used_at = datetime.now(UTC)
    db.commit()
    db.refresh(user)
    return user
