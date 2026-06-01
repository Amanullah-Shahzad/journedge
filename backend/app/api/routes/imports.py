import logging

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.core.errors import AppError
from app.db.deps import get_current_user, get_db
from app.models.entities import ImportJob
from app.services.audit import audit_and_log
from app.services.ownership import get_user_import_job
from app.services.imports import commit_import, preview_import, rollback_import
from app.services.serializers import serialize_import_job, serialize_import_row


router = APIRouter()
logger = logging.getLogger("journedge.imports")


@router.post("/preview")
@limiter.limit("10/minute")
async def preview(request: Request, file: UploadFile = File(...), account_id: str | None = Form(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    try:
        content = (await file.read()).decode("utf-8")
    except UnicodeDecodeError as exc:
        raise AppError("Import file must be UTF-8 encoded CSV", status_code=400, code="invalid_import_encoding") from exc
    preview_result = preview_import(db, user, file.filename, content, account_id)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="import.preview",
        resource_type="import_job",
        resource_id=preview_result.job.id,
        payload={"filename": file.filename, "validRows": preview_result.job.valid_rows, "duplicateRows": preview_result.job.duplicate_rows},
        message="Import preview created",
    )
    db.commit()
    return {
        "id": preview_result.job.id,
        "source": preview_result.job.source,
        "filename": preview_result.job.filename,
        "totalRows": preview_result.job.total_rows,
        "validRows": preview_result.job.valid_rows,
        "duplicateRows": preview_result.job.duplicate_rows,
        "invalidRows": preview_result.job.invalid_rows,
        "rows": [serialize_import_row(row) for row in preview_result.rows[:25]],
    }


@router.get("")
def history(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[dict]:
    jobs = db.scalars(select(ImportJob).where(ImportJob.user_id == user.id).order_by(ImportJob.created_at.desc())).all()
    return [serialize_import_job(job) for job in jobs]


@router.get("/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    job = get_user_import_job(db, user, job_id)
    return serialize_import_job(job)


@router.post("/{job_id}/commit")
def commit(job_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    job, imported_count = commit_import(db, user, job_id)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="import.commit",
        resource_type="import_job",
        resource_id=job.id,
        payload={"importedCount": imported_count},
        message="Import committed",
    )
    db.commit()
    return {
        "id": job.id,
        "importedCount": imported_count,
        "duplicateCount": job.duplicate_rows,
        "invalidCount": job.invalid_rows,
    }


@router.post("/{job_id}/rollback")
def rollback(job_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    job, count = rollback_import(db, user, job_id)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="import.rollback",
        resource_type="import_job",
        resource_id=job.id,
        payload={"rolledBackCount": count},
        message="Import rolled back",
    )
    db.commit()
    return {"id": job.id, "rolledBackCount": count}
