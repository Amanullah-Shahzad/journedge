import asyncio
import json
import logging
from collections.abc import AsyncGenerator
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_allowed_upload_extensions, get_allowed_upload_mime_types, get_settings
from app.db.deps import get_current_user, get_db
from app.models.entities import JournalTemplate, Screenshot
from app.schemas.common import IdPayload
from app.schemas.journal import TemplateCreate, TemplateUpdate
from app.services.audit import audit_and_log
from app.services.ownership import get_user_screenshot
from app.services.serializers import serialize_template
from app.core.errors import AppError
from app.core.rate_limit import limiter
from app.core.storage import get_storage
from app.services.trades import get_user_trade


router = APIRouter()
logger = logging.getLogger("journedge.compat")


@router.get("/templates")
def list_templates(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[dict]:
    templates = db.scalars(select(JournalTemplate).where(JournalTemplate.user_id == user.id).order_by(JournalTemplate.created_at.desc())).all()
    return [serialize_template(template) for template in templates]


@router.post("/templates")
def create_template(body: TemplateCreate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    template = JournalTemplate(user_id=user.id, name=body.name, content=body.content or {}, scope=body.scope)
    db.add(template)
    db.flush()
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="template.create",
        resource_type="journal_template",
        resource_id=template.id,
        payload={"name": template.name, "scope": template.scope, "legacy": True},
        message="Legacy journal template created",
    )
    db.commit()
    db.refresh(template)
    return serialize_template(template)


@router.patch("/templates")
def update_template(body: TemplateUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    if not body.id:
        raise AppError("Template id is required", status_code=422, code="validation_error")
    template = db.scalar(select(JournalTemplate).where(JournalTemplate.id == body.id, JournalTemplate.user_id == user.id))
    if not template:
        raise AppError("Template not found", status_code=404, code="template_not_found")
    if body.name is not None:
        template.name = body.name
    if body.scope is not None:
        template.scope = body.scope
    if body.content is not None:
        template.content = body.content
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="template.update",
        resource_type="journal_template",
        resource_id=template.id,
        payload={"name": template.name, "scope": template.scope, "legacy": True},
        message="Legacy journal template updated",
    )
    db.commit()
    db.refresh(template)
    return serialize_template(template)


@router.delete("/templates")
def delete_template(body: IdPayload, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    template = db.scalar(select(JournalTemplate).where(JournalTemplate.id == body.id, JournalTemplate.user_id == user.id))
    if not template:
        raise AppError("Template not found", status_code=404, code="template_not_found")
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="template.delete",
        resource_type="journal_template",
        resource_id=template.id,
        payload={"name": template.name, "legacy": True},
        message="Legacy journal template deleted",
    )
    db.delete(template)
    db.commit()
    return {"success": True}


@router.post("/upload")
@limiter.limit("20/minute")
async def legacy_upload(request: Request, file: UploadFile = File(...), trade_id: str | None = Form(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    settings = get_settings()
    content_type = (file.content_type or "").lower()
    extension = Path(file.filename or "").suffix.lower()
    if content_type not in get_allowed_upload_mime_types() or extension not in get_allowed_upload_extensions():
        raise AppError("Only image uploads are allowed", status_code=400, code="invalid_file_type")
    if trade_id:
        get_user_trade(db, user, trade_id)
    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise AppError("File exceeds upload limit", status_code=400, code="file_too_large")
    stored = get_storage().save(content, file.filename or "upload", content_type, owner_id=user.id, category="screenshots")
    try:
        shot = Screenshot(
            user_id=user.id,
            trade_id=trade_id,
            storage_key=stored["key"],
            public_url="",
            content_type=content_type,
            size_bytes=len(content),
        )
        db.add(shot)
        db.flush()
        shot.public_url = f"/api/screenshots/{shot.id}/content"
        audit_and_log(
            db,
            event_logger=logger,
            user_id=user.id,
            action="screenshot.upload",
            resource_type="screenshot",
            resource_id=shot.id,
            payload={"tradeId": trade_id, "legacy": True},
            message="Legacy screenshot uploaded",
        )
        db.commit()
        db.refresh(shot)
        return {"url": shot.public_url}
    except Exception:
        get_storage().delete(stored["key"])
        raise


@router.get("/update")
async def update_stream() -> StreamingResponse:
    async def events() -> AsyncGenerator[str, None]:
        sequence = [
            {"step": "preflight", "status": "complete", "message": "Managed SaaS deployment detected"},
            {"step": "backup", "status": "complete", "message": "Backups are handled centrally"},
            {"step": "install", "status": "complete", "message": "Client is already on managed infrastructure"},
            {"step": "complete", "status": "complete", "message": "No manual restart required"},
        ]
        for item in sequence:
            yield f"data: {json.dumps(item)}\n\n"
            await asyncio.sleep(0.05)

    return StreamingResponse(events(), media_type="text/event-stream")


@router.post("/update/restart")
def update_restart() -> dict:
    return {"success": True, "message": "Managed deployment does not require local restart"}
