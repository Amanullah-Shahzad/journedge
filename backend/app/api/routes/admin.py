from __future__ import annotations

import logging
from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import AppError
from app.core.security import hash_password
from app.db.deps import get_db, require_admin
from app.models.entities import AuditLog, BackupRecord, ImportJob, JournalEntry, Screenshot, Trade, User
from app.schemas.admin import (
    AdminAssetFilters,
    AdminImportFilters,
    AdminTradeFilters,
    AdminUserPasswordUpdateRequest,
    AdminUserUpdateRequest,
    CreateBackupRequest,
)
from app.services.analytics import summarize_analytics
from app.services.audit import audit_and_log
from app.services.serializers import serialize_trade
from app.tasks.backups import create_user_backup


router = APIRouter()
logger = logging.getLogger("journedge.admin")


def paginate(total: int, page: int, page_size: int) -> dict:
    total_pages = ceil(total / page_size) if total else 0
    return {"page": page, "pageSize": page_size, "total": total, "totalPages": total_pages}


@router.get("/summary")
def admin_summary(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    trades = db.scalars(
        select(Trade).options(selectinload(Trade.tags), selectinload(Trade.journal_entry), selectinload(Trade.screenshots))
    ).all()
    imports_count = db.scalar(select(func.count()).select_from(ImportJob)) or 0
    screenshots_count = db.scalar(select(func.count()).select_from(Screenshot)) or 0
    active_users = sum(1 for user in users if user.is_active)
    country_counts: dict[str, int] = {}
    for user in users:
        country = (user.country or "").strip()
        if not country:
            continue
        country_counts[country] = country_counts.get(country, 0) + 1
    country_breakdown = [
        {"country": country, "count": count}
        for country, count in sorted(country_counts.items(), key=lambda item: (-item[1], item[0].lower()))
    ]
    analytics = summarize_analytics(trades, 0.0)
    trades_per_day = analytics.get("daily", [])
    return {
        "users": {
            "total": len(users),
            "active": active_users,
            "admins": sum(1 for user in users if user.role == "admin"),
            "byCountry": country_breakdown,
        },
        "trades": {"total": len(trades), "tradesPerDay": trades_per_day},
        "imports": {"total": imports_count},
        "screenshots": {"total": screenshots_count},
        "analytics": analytics,
    }


@router.get("/users")
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)
    if q:
        like = f"%{q.lower()}%"
        condition = or_(func.lower(User.email).like(like), func.lower(func.coalesce(User.full_name, "")).like(like))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    if status == "active":
        stmt = stmt.where(User.is_active.is_(True))
        count_stmt = count_stmt.where(User.is_active.is_(True))
    elif status == "inactive":
        stmt = stmt.where(User.is_active.is_(False))
        count_stmt = count_stmt.where(User.is_active.is_(False))
    total = db.scalar(count_stmt) or 0
    users = db.scalars(
        stmt.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    ).all()
    items = [
        {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "isVerified": user.is_verified,
            "isActive": user.is_active,
            "country": user.country,
            "preferredMarket": user.preferred_market,
            "tradingExperience": user.trading_experience,
            "createdAt": user.created_at.isoformat(),
        }
        for user in users
    ]
    return {"items": items, "pagination": paginate(total, page, page_size)}


@router.put("/users/{user_id}")
def update_user(user_id: str, payload: AdminUserUpdateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise AppError("User not found", status_code=404, code="not_found")
    data = payload.model_dump(exclude_none=True)
    if "full_name" in data:
        user.full_name = data["full_name"]
    if "role" in data:
        user.role = data["role"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    if "is_verified" in data:
        user.is_verified = data["is_verified"]
    audit_and_log(
        db,
        event_logger=logger,
        user_id=admin.id,
        action="admin.user.update",
        resource_type="user",
        resource_id=user.id,
        payload={"fields": sorted(data.keys())},
        message="Admin updated user",
    )
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "isVerified": user.is_verified,
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat(),
    }


@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise AppError("User not found", status_code=404, code="not_found")
    audit_and_log(
        db,
        event_logger=logger,
        user_id=admin.id,
        action="admin.user.delete",
        resource_type="user",
        resource_id=user.id,
        payload={"email": user.email},
        message="Admin deleted user",
    )
    db.delete(user)
    db.commit()
    return {"success": True}


@router.put("/users/{user_id}/password")
def update_user_password(
    user_id: str,
    payload: AdminUserPasswordUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise AppError("User not found", status_code=404, code="not_found")
    user.password_hash = hash_password(payload.new_password)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=admin.id,
        action="admin.user.password_update",
        resource_type="user",
        resource_id=user.id,
        payload={"email": user.email},
        message="Admin updated user password",
    )
    db.commit()
    return {"success": True, "message": "Password updated"}


@router.get("/trades")
def list_trades(filters: AdminTradeFilters = Depends(), db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    stmt = (
        select(Trade)
        .options(selectinload(Trade.tags), selectinload(Trade.screenshots), selectinload(Trade.journal_entry), selectinload(Trade.user))
    )
    count_stmt = select(func.count()).select_from(Trade)
    if filters.user_id:
        stmt = stmt.where(Trade.user_id == filters.user_id)
        count_stmt = count_stmt.where(Trade.user_id == filters.user_id)
    if filters.q:
        like = f"%{filters.q.lower()}%"
        condition = or_(func.lower(Trade.symbol).like(like), func.lower(Trade.underlying).like(like))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    total = db.scalar(count_stmt) or 0
    trades = db.scalars(
        stmt.order_by(Trade.created_at.desc()).offset((filters.page - 1) * filters.page_size).limit(filters.page_size)
    ).all()
    items = []
    for trade in trades:
        item = serialize_trade(trade)
        item["userId"] = trade.user_id
        item["userEmail"] = trade.user.email if trade.user else ""
        item["journalPreview"] = trade.journal_entry.plain_preview if trade.journal_entry else ""
        items.append(item)
    return {"items": items, "pagination": paginate(total, filters.page, filters.page_size)}


@router.get("/imports")
def list_import_jobs(filters: AdminImportFilters = Depends(), db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    stmt = select(ImportJob, User.email).join(User, User.id == ImportJob.user_id)
    count_stmt = select(func.count()).select_from(ImportJob)
    if filters.q:
        like = f"%{filters.q.lower()}%"
        condition = or_(func.lower(ImportJob.filename).like(like), func.lower(ImportJob.source).like(like), func.lower(User.email).like(like))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.join(User, User.id == ImportJob.user_id).where(condition)
    if filters.status:
        stmt = stmt.where(ImportJob.status == filters.status)
        count_stmt = count_stmt.where(ImportJob.status == filters.status)
    total = db.scalar(count_stmt) or 0
    rows = db.execute(
        stmt.order_by(ImportJob.created_at.desc()).offset((filters.page - 1) * filters.page_size).limit(filters.page_size)
    ).all()
    items = [
        {
            "id": job.id,
            "userId": job.user_id,
            "userEmail": email,
            "accountId": job.account_id,
            "source": job.source,
            "filename": job.filename,
            "status": job.status,
            "totalRows": job.total_rows,
            "validRows": job.valid_rows,
            "duplicateRows": job.duplicate_rows,
            "invalidRows": job.invalid_rows,
            "createdAt": job.created_at.isoformat(),
        }
        for job, email in rows
    ]
    return {"items": items, "pagination": paginate(total, filters.page, filters.page_size)}


@router.get("/assets")
def list_assets(filters: AdminAssetFilters = Depends(), db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    stmt = select(Screenshot, User.email).join(User, User.id == Screenshot.user_id)
    count_stmt = select(func.count()).select_from(Screenshot)
    if filters.user_id:
        stmt = stmt.where(Screenshot.user_id == filters.user_id)
        count_stmt = count_stmt.where(Screenshot.user_id == filters.user_id)
    if filters.q:
        like = f"%{filters.q.lower()}%"
        condition = or_(func.lower(Screenshot.storage_key).like(like), func.lower(User.email).like(like))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.join(User, User.id == Screenshot.user_id).where(condition)
    total = db.scalar(count_stmt) or 0
    rows = db.execute(
        stmt.order_by(Screenshot.created_at.desc()).offset((filters.page - 1) * filters.page_size).limit(filters.page_size)
    ).all()
    items = [
        {
            "id": asset.id,
            "userId": asset.user_id,
            "userEmail": email,
            "tradeId": asset.trade_id,
            "storageKey": asset.storage_key,
            "url": f"/api/screenshots/{asset.id}/content",
            "contentType": asset.content_type,
            "sizeBytes": asset.size_bytes,
            "createdAt": asset.created_at.isoformat(),
        }
        for asset, email in rows
    ]
    return {"items": items, "pagination": paginate(total, filters.page, filters.page_size)}


@router.get("/analytics")
def platform_analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    trades = db.scalars(
        select(Trade).options(selectinload(Trade.tags), selectinload(Trade.journal_entry), selectinload(Trade.screenshots))
    ).all()
    users = db.scalars(select(User)).all()
    analytics = summarize_analytics(trades, 0.0)
    return {
        **analytics,
        "active_users": sum(1 for user in users if user.is_active),
        "total_users": len(users),
    }


@router.get("/reports/export")
def export_dataset(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    trades = db.scalars(
        select(Trade).options(selectinload(Trade.tags), selectinload(Trade.screenshots), selectinload(Trade.journal_entry))
    ).all()
    jobs = db.scalars(select(ImportJob).order_by(ImportJob.created_at.desc())).all()
    journals = db.scalars(select(JournalEntry).order_by(JournalEntry.updated_at.desc())).all()
    screenshots = db.scalars(select(Screenshot).order_by(Screenshot.created_at.desc())).all()
    return {
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "fullName": user.full_name,
                "role": user.role,
                "isActive": user.is_active,
                "isVerified": user.is_verified,
                "createdAt": user.created_at.isoformat(),
            }
            for user in users
        ],
        "trades": [serialize_trade(trade) | {"userId": trade.user_id} for trade in trades],
        "imports": [
            {
                "id": job.id,
                "userId": job.user_id,
                "filename": job.filename,
                "source": job.source,
                "status": job.status,
                "createdAt": job.created_at.isoformat(),
            }
            for job in jobs
        ],
        "journals": [
            {
                "id": journal.id,
                "userId": journal.user_id,
                "tradeId": journal.trade_id,
                "plainPreview": journal.plain_preview,
                "content": journal.content,
                "updatedAt": journal.updated_at.isoformat(),
            }
            for journal in journals
        ],
        "screenshots": [
            {
                "id": shot.id,
                "userId": shot.user_id,
                "tradeId": shot.trade_id,
                "storageKey": shot.storage_key,
                "contentType": shot.content_type,
                "sizeBytes": shot.size_bytes,
                "createdAt": shot.created_at.isoformat(),
            }
            for shot in screenshots
        ],
    }


@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    logs = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200)).all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "resourceType": log.resource_type,
            "resourceId": log.resource_id,
            "payload": log.payload,
            "createdAt": log.created_at.isoformat(),
        }
        for log in logs
    ]


@router.get("/backups")
def list_backups(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    backups = db.scalars(select(BackupRecord).order_by(BackupRecord.created_at.desc())).all()
    return [
        {
            "id": backup.id,
            "storageKey": backup.storage_key,
            "status": backup.status,
            "kind": backup.kind,
            "details": backup.details,
            "createdAt": backup.created_at.isoformat(),
        }
        for backup in backups
    ]


@router.post("/backups")
def create_backup(body: CreateBackupRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> dict:
    backup = BackupRecord(created_by_user_id=admin.id, kind="full-export", status="queued", details={"userId": body.user_id})
    db.add(backup)
    db.commit()
    db.refresh(backup)
    create_user_backup.delay(body.user_id, backup.id)
    return {"id": backup.id, "status": backup.status}
