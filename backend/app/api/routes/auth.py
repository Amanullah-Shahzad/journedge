import logging

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.core.config import get_settings
from app.db.deps import get_current_user, get_db
from app.services.audit import audit_and_log, log_event
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserRead,
    VerifyEmailRequest,
)
from app.services.auth import create_reset_token, get_user_by_email, login_user, logout_user, register_user, reset_password, verify_email


router = APIRouter()
logger = logging.getLogger("journedge.auth")


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        "journedge_session",
        token,
        httponly=True,
        samesite="lax",
        path="/",
        secure=get_settings().app_env == "production",
    )


@router.post("/register", response_model=AuthResponse)
@limiter.limit("10/minute")
def register(payload: RegisterRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user, _verify_token = register_user(db, payload.email, payload.password, payload.full_name)
    token = login_user(db, payload.email, payload.password, request.client.host if request.client else None, request.headers.get("user-agent"))[1]
    set_session_cookie(response, token)
    log_event(
        logger,
        "User registered",
        user_id=user.id,
        action="auth.register",
        resource_type="user",
        resource_id=user.id,
        details={"email": user.email},
    )
    return AuthResponse(user=UserRead.model_validate(user), access_token=token)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user, token = login_user(db, payload.email, payload.password, request.client.host if request.client else None, request.headers.get("user-agent"))
    set_session_cookie(response, token)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="auth.login",
        resource_type="user",
        resource_id=user.id,
        payload={"ipAddress": request.client.host if request.client else None},
        message="User login",
    )
    return AuthResponse(user=UserRead.model_validate(user), access_token=token)


@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)) -> dict:
    token = request.cookies.get("journedge_session")
    if token:
        logout_user(db, token)
    response.delete_cookie("journedge_session", path="/")
    return {"message": "Logged out"}


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)) -> dict:
    user = get_user_by_email(db, payload.email)
    token = create_reset_token(db, user) if user else None
    log_event(
        logger,
        "Password reset requested",
        user_id=user.id if user else None,
        action="auth.forgot_password",
        resource_type="user",
        resource_id=user.id if user else None,
        details={"email": payload.email, "ipAddress": request.client.host if request.client else None},
    )
    return {"message": "If that email exists, a reset link has been generated", "token": token}


@router.post("/reset-password")
def reset_password_endpoint(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    reset_password(db, payload.token, payload.password)
    log_event(
        logger,
        "Password reset completed",
        action="auth.reset_password",
        resource_type="password_reset",
        details={},
    )
    return {"message": "Password updated"}


@router.post("/verify-email")
def verify_email_endpoint(payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> dict:
    user = verify_email(db, payload.token)
    log_event(
        logger,
        "Email verified",
        user_id=user.id,
        action="auth.verify_email",
        resource_type="user",
        resource_id=user.id,
        details={"email": user.email},
    )
    return {"message": "Email verified", "user": UserRead.model_validate(user).model_dump()}


@router.get("/me", response_model=UserRead)
def me(user=Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(user)
