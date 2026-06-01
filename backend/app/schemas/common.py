from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str


class SuccessResponse(BaseModel):
    success: bool = True
    message: str | None = None


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: list[dict] | None = None
    request_id: str | None = Field(default=None, alias="requestId")


class IdPayload(BaseModel):
    id: str = Field(min_length=1)


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int = 1
    page_size: int = 50


class AuditLogRead(ORMModel):
    id: str
    user_id: str | None
    action: str
    resource_type: str
    resource_id: str | None
    payload: dict
    created_at: datetime
