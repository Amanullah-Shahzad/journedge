from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)


class TagRead(ORMModel):
    id: str
    name: str
    created_at: datetime | None = None
