from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.db.deps import get_current_user, get_db
from app.models.entities import Tag
from app.schemas.common import IdPayload
from app.schemas.tags import TagCreate
from app.services.serializers import serialize_tag


router = APIRouter()


@router.get("")
def list_tags(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[dict]:
    tags = db.scalars(select(Tag).where(Tag.user_id == user.id).order_by(Tag.name.asc())).all()
    return [serialize_tag(tag) for tag in tags]


@router.post("")
def create_tag(payload: TagCreate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    tag = db.scalar(select(Tag).where(Tag.user_id == user.id, Tag.name == payload.name.strip()))
    if not tag:
        tag = Tag(user_id=user.id, name=payload.name.strip())
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return serialize_tag(tag)


@router.delete("")
def delete_tag(body: IdPayload, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    tag = db.scalar(select(Tag).where(Tag.id == body.id, Tag.user_id == user.id))
    if not tag:
        raise AppError("Tag not found", status_code=404, code="tag_not_found")
    db.delete(tag)
    db.commit()
    return {"success": True}
