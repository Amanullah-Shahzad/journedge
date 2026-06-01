from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class JournalEntryUpdate(BaseModel):
    content: dict


class JournalEntryRead(ORMModel):
    id: str
    trade_id: str
    content: dict
    plain_preview: str | None = None
    updated_at: datetime


class TemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    content: dict
    scope: str = Field(default="all", min_length=1, max_length=64)


class TemplateUpdate(BaseModel):
    id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    content: dict | None = None
    scope: str | None = Field(default=None, min_length=1, max_length=64)


class TemplateRead(ORMModel):
    id: str
    name: str
    content: dict
    scope: str
    created_at: datetime
