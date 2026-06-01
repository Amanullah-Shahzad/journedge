import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.db.deps import get_current_user, get_db
from app.models.entities import Account
from app.schemas.accounts import AccountCreate, AccountUpdate
from app.schemas.common import IdPayload
from app.services.audit import audit_and_log
from app.services.ownership import get_user_account
from app.services.serializers import serialize_account


router = APIRouter()
logger = logging.getLogger("journedge.accounts")


@router.get("")
def list_accounts(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[dict]:
    accounts = db.scalars(select(Account).where(Account.user_id == user.id).order_by(Account.created_at.asc())).all()
    return [serialize_account(account) for account in accounts]


@router.post("")
def create_account(payload: AccountCreate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    existing = db.scalar(select(Account).where(Account.user_id == user.id, Account.name == payload.name))
    if existing:
        raise AppError("Account name already exists", status_code=409, code="account_name_taken")
    account = Account(
        user_id=user.id,
        name=payload.name,
        broker=payload.broker,
        initial_balance=payload.initialBalance,
        currency=payload.currency,
    )
    db.add(account)
    db.flush()
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="account.create",
        resource_type="account",
        resource_id=account.id,
        payload={"name": account.name, "broker": account.broker},
        message="Account created",
    )
    db.commit()
    db.refresh(account)
    return serialize_account(account)


@router.patch("")
def update_account(payload: AccountUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    if not payload.id:
        raise AppError("Account id is required", status_code=422, code="validation_error")
    account = get_user_account(db, user, payload.id)
    if payload.name is not None:
        existing = db.scalar(select(Account).where(Account.user_id == user.id, Account.name == payload.name, Account.id != account.id))
        if existing:
            raise AppError("Account name already exists", status_code=409, code="account_name_taken")
        account.name = payload.name
    if payload.broker is not None:
        account.broker = payload.broker
    if payload.initialBalance is not None:
        account.initial_balance = payload.initialBalance
    if payload.currency is not None:
        account.currency = payload.currency
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="account.update",
        resource_type="account",
        resource_id=account.id,
        payload={"name": account.name, "broker": account.broker},
        message="Account updated",
    )
    db.commit()
    db.refresh(account)
    return serialize_account(account)


@router.delete("")
def delete_account(body: IdPayload, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    account = get_user_account(db, user, body.id)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="account.delete",
        resource_type="account",
        resource_id=account.id,
        payload={"name": account.name},
        message="Account deleted",
    )
    db.delete(account)
    db.commit()
    return {"success": True}
