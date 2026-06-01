import json
import logging

from sqlalchemy import select

from app.core.storage import get_storage
from app.db.session import SessionLocal
from app.models.entities import Account, BackupRecord, JournalTemplate, Tag, Trade
from app.services.audit import log_event
from app.workers.celery_app import celery_app


logger = logging.getLogger("journedge.jobs.backups")


@celery_app.task(name="backups.create_user_backup")
def create_user_backup(user_id: str, backup_id: str) -> dict:
    db = SessionLocal()
    backup = None
    try:
        backup = db.get(BackupRecord, backup_id)
        log_event(
            logger,
            "Backup job started",
            user_id=user_id,
            action="backup.create",
            resource_type="backup",
            resource_id=backup_id,
            details={},
        )
        trades = db.scalars(select(Trade).where(Trade.user_id == user_id)).all()
        accounts = db.scalars(select(Account).where(Account.user_id == user_id)).all()
        templates = db.scalars(select(JournalTemplate).where(JournalTemplate.user_id == user_id)).all()
        tags = db.scalars(select(Tag).where(Tag.user_id == user_id)).all()

        payload = {
            "accounts": [a.name for a in accounts],
            "trades": len(trades),
            "templates": len(templates),
            "tags": [t.name for t in tags],
        }
        stored = get_storage().save(
            json.dumps(payload).encode("utf-8"),
            f"backup-{user_id}.json",
            "application/json",
            owner_id=user_id,
            category="backups",
        )
        if backup:
            backup.storage_key = stored["key"]
            backup.status = "complete"
            backup.details = payload
            db.commit()
        log_event(
            logger,
            "Backup job completed",
            user_id=user_id,
            action="backup.create",
            resource_type="backup",
            resource_id=backup_id,
            details={"storageKey": stored["key"]},
        )
        return stored
    except Exception:
        if backup:
            backup.status = "failed"
            db.commit()
        logger.exception(
            "Backup job failed",
            extra={"user_id": user_id, "action": "backup.create", "resource_type": "backup", "resource_id": backup_id, "details": {}},
        )
        raise
    finally:
        db.close()
