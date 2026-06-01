import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.db.deps import get_current_user, get_db
from app.models.entities import User
from app.schemas.auth import UserRead
from app.schemas.common import MessageResponse
from app.schemas.users import PasswordChangeRequest, ProfileUpdateRequest
from app.services.audit import audit_and_log
from app.services.auth import change_password

router = APIRouter()

logger = logging.getLogger("journedge.users")


@router.get("/me")
def profile_me(user=Depends(get_current_user)) -> dict:
    return {"user": UserRead.model_validate(user).model_dump()}


@router.put("/me")
def update_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        email = payload.email.lower().strip()
        existing = db.scalar(select(User).where(User.email == email, User.id != user.id))
        if existing:
            raise AppError("Email already registered", status_code=409, code="email_taken")
        user.email = email
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="profile.update",
        resource_type="user",
        resource_id=user.id,
        payload={"email": user.email, "fullName": user.full_name},
        message="Profile updated",
    )
    db.commit()
    db.refresh(user)
    return {"user": UserRead.model_validate(user).model_dump()}


@router.patch("/me")
def update_profile_legacy(payload: ProfileUpdateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    return update_profile(payload=payload, db=db, user=user)


@router.put("/me/password", response_model=MessageResponse)
def update_password(payload: PasswordChangeRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> MessageResponse:
    change_password(db, user, payload.current_password, payload.new_password)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="auth.password_change",
        resource_type="user",
        resource_id=user.id,
        payload={},
        message="Password changed",
    )
    return MessageResponse(message="Password updated")
