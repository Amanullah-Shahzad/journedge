from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.deps import get_db, require_admin
from app.models.entities import AuditLog, BackupRecord, ImportJob, User
from app.schemas.admin import CreateBackupRequest
from app.tasks.backups import create_user_backup


router = APIRouter()


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [{"id": user.id, "email": user.email, "role": user.role, "isVerified": user.is_verified, "createdAt": user.created_at.isoformat()} for user in users]


@router.get("/imports")
def list_import_jobs(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    jobs = db.scalars(select(ImportJob).order_by(ImportJob.created_at.desc())).all()
    return [{"id": job.id, "userId": job.user_id, "filename": job.filename, "status": job.status, "createdAt": job.created_at.isoformat()} for job in jobs]


@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    logs = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc())).all()
    return [{"id": log.id, "action": log.action, "resourceType": log.resource_type, "resourceId": log.resource_id, "payload": log.payload, "createdAt": log.created_at.isoformat()} for log in logs]


@router.get("/backups")
def list_backups(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    backups = db.scalars(select(BackupRecord).order_by(BackupRecord.created_at.desc())).all()
    return [{"id": backup.id, "storageKey": backup.storage_key, "status": backup.status, "kind": backup.kind, "details": backup.details, "createdAt": backup.created_at.isoformat()} for backup in backups]


@router.post("/backups")
def create_backup(body: CreateBackupRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> dict:
    backup = BackupRecord(created_by_user_id=admin.id, kind="full-export", status="queued", details={"userId": body.user_id})
    db.add(backup)
    db.commit()
    db.refresh(backup)
    create_user_backup.delay(body.user_id, backup.id)
    return {"id": backup.id, "status": backup.status}
