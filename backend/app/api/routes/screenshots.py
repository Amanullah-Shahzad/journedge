import mimetypes
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.config import get_allowed_upload_extensions, get_allowed_upload_mime_types, get_settings
from app.core.errors import AppError
from app.core.rate_limit import limiter
from app.core.storage import get_storage
from app.db.deps import get_current_user, get_db
from app.services.audit import audit_and_log
from app.services.ownership import get_user_screenshot
from app.services.trades import get_user_trade


router = APIRouter()
logger = logging.getLogger("journedge.screenshots")


@router.post("/upload")
@limiter.limit("20/minute")
async def upload_screenshot(request: Request, file: UploadFile = File(...), trade_id: str | None = Form(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    settings = get_settings()
    content_type = (file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream").lower()
    extension = Path(file.filename or "").suffix.lower()
    if content_type not in get_allowed_upload_mime_types() or extension not in get_allowed_upload_extensions():
        raise AppError("Only image uploads are allowed", status_code=400, code="invalid_file_type")
    if trade_id:
        get_user_trade(db, user, trade_id)
    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise AppError("File exceeds upload limit", status_code=400, code="file_too_large")
    storage = get_storage()
    stored = storage.save(content, file.filename or "upload", content_type, owner_id=user.id, category="screenshots")
    try:
        from app.models.entities import Screenshot

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
            payload={"tradeId": trade_id, "contentType": content_type, "sizeBytes": len(content)},
            message="Screenshot uploaded",
        )
        db.commit()
        db.refresh(shot)
        return {"id": shot.id, "url": shot.public_url}
    except Exception:
        storage.delete(stored["key"])
        raise


@router.get("/{screenshot_id}/content")
def get_screenshot_content(screenshot_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> Response:
    shot = get_user_screenshot(db, user, screenshot_id)
    content = get_storage().read_bytes(shot.storage_key)
    return Response(content=content, media_type=shot.content_type, headers={"Cache-Control": "private, no-store"})


@router.delete("/{screenshot_id}")
def delete_screenshot(screenshot_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    shot = get_user_screenshot(db, user, screenshot_id)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="screenshot.delete",
        resource_type="screenshot",
        resource_id=shot.id,
        payload={"tradeId": shot.trade_id},
        message="Screenshot deleted",
    )
    get_storage().delete(shot.storage_key)
    db.delete(shot)
    db.commit()
    return {"success": True}
