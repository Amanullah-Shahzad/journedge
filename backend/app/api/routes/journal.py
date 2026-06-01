import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.db.deps import get_current_user, get_db
from app.models.entities import JournalTemplate
from app.schemas.common import IdPayload
from app.schemas.journal import JournalEntryUpdate, TemplateCreate, TemplateUpdate
from app.services.audit import audit_and_log
from app.services.serializers import serialize_template
from app.services.trades import get_user_trade, journal_preview, normalize_journal_content


router = APIRouter()
logger = logging.getLogger("journedge.journal")


@router.get("/trades/{trade_id}")
def get_journal(trade_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    trade = get_user_trade(db, user, trade_id)
    return {"content": trade.journal_entry.content if trade.journal_entry else {}, "plainPreview": trade.journal_entry.plain_preview if trade.journal_entry else ""}


@router.patch("/trades/{trade_id}")
def update_journal(trade_id: str, payload: JournalEntryUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    trade = get_user_trade(db, user, trade_id)
    content = payload.content
    if not trade.journal_entry:
        from app.models.entities import JournalEntry

        trade.journal_entry = JournalEntry(user_id=user.id, content=content, plain_preview=journal_preview(content))
    else:
        trade.journal_entry.content = content
        trade.journal_entry.plain_preview = journal_preview(content)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="journal.save",
        resource_type="trade",
        resource_id=trade.id,
        payload={"plainPreview": trade.journal_entry.plain_preview},
        message="Journal saved",
    )
    db.commit()
    return {"success": True}


@router.get("/templates")
def list_templates(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[dict]:
    templates = db.scalars(select(JournalTemplate).where(JournalTemplate.user_id == user.id).order_by(JournalTemplate.created_at.desc())).all()
    return [serialize_template(template) for template in templates]


@router.post("/templates")
def create_template(payload: TemplateCreate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    content = payload.content
    template = JournalTemplate(user_id=user.id, name=payload.name, content=content or {}, scope=payload.scope)
    db.add(template)
    db.flush()
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="template.create",
        resource_type="journal_template",
        resource_id=template.id,
        payload={"name": template.name, "scope": template.scope},
        message="Journal template created",
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
        payload={"name": template.name, "scope": template.scope},
        message="Journal template updated",
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
        payload={"name": template.name},
        message="Journal template deleted",
    )
    db.delete(template)
    db.commit()
    return {"success": True}
