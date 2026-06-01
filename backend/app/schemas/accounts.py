from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    broker: str = Field(min_length=1, max_length=64)
    initialBalance: float
    currency: str = "USD"


class AccountUpdate(BaseModel):
    id: str | None = None
    name: str | None = None
    broker: str | None = None
    initialBalance: float | None = None
    currency: str | None = None


class AccountRead(ORMModel):
    id: str
    name: str
    broker: str
    initialBalance: float
    currency: str
    createdAt: datetime
