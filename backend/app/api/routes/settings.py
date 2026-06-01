import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_current_user, get_db
from app.models.entities import UserSettings
from app.schemas.users import UserSettingsRead, UserSettingsResponse, UserSettingsUpdateRequest
from app.services.audit import audit_and_log
from app.services.ownership import get_user_account


router = APIRouter()
logger = logging.getLogger("journedge.settings")


def get_or_create_settings(db: Session, user_id: str) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).one_or_none()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=UserSettingsResponse)
def get_settings_route(db: Session = Depends(get_db), user=Depends(get_current_user)) -> UserSettingsResponse:
    settings = get_or_create_settings(db, user.id)
    return UserSettingsResponse(
        settings=UserSettingsRead(
            timezone=settings.timezone,
            default_currency=settings.default_currency,
            default_account_id=settings.default_account_id,
        )
    )


@router.put("", response_model=UserSettingsResponse)
def update_settings_route(payload: UserSettingsUpdateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> UserSettingsResponse:
    settings = get_or_create_settings(db, user.id)
    default_account_id = payload.default_account_id
    if default_account_id:
        default_account_id = get_user_account(db, user, default_account_id).id
    settings.timezone = payload.timezone
    settings.default_currency = payload.default_currency.upper()
    settings.default_account_id = default_account_id
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="settings.update",
        resource_type="user_settings",
        resource_id=settings.id,
        payload={"timezone": settings.timezone, "defaultCurrency": settings.default_currency, "defaultAccountId": settings.default_account_id},
        message="User settings updated",
    )
    db.commit()
    db.refresh(settings)
    return UserSettingsResponse(
        settings=UserSettingsRead(
            timezone=settings.timezone,
            default_currency=settings.default_currency,
            default_account_id=settings.default_account_id,
        )
    )
