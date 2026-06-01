from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.entities import Account, ImportJob, Screenshot, User


def get_user_account(db: Session, user: User, account_id: str) -> Account:
    account = db.scalar(select(Account).where(Account.id == account_id, Account.user_id == user.id))
    if not account:
        raise AppError("Account not found", status_code=404, code="account_not_found")
    return account


def validate_user_account_id(db: Session, user: User, account_id: str | None) -> str | None:
    if not account_id:
        return None
    return get_user_account(db, user, account_id).id


def get_user_import_job(db: Session, user: User, job_id: str) -> ImportJob:
    job = db.scalar(select(ImportJob).where(ImportJob.id == job_id, ImportJob.user_id == user.id))
    if not job:
        raise AppError("Import job not found", status_code=404, code="import_not_found")
    return job


def get_user_screenshot(db: Session, user: User, screenshot_id: str) -> Screenshot:
    screenshot = db.scalar(select(Screenshot).where(Screenshot.id == screenshot_id, Screenshot.user_id == user.id))
    if not screenshot:
        raise AppError("Screenshot not found", status_code=404, code="screenshot_not_found")
    return screenshot
