from datetime import datetime

from pydantic import BaseModel


class ImportPreviewResponse(BaseModel):
    id: str
    source: str
    filename: str
    total_rows: int
    valid_rows: int
    duplicate_rows: int
    invalid_rows: int
    rows: list[dict]


class ImportCommitResponse(BaseModel):
    id: str
    imported_count: int
    duplicate_count: int
    invalid_count: int


class ImportHistoryItem(BaseModel):
    id: str
    filename: str
    source: str
    status: str
    total_rows: int
    valid_rows: int
    duplicate_rows: int
    invalid_rows: int
    created_at: datetime


class ImportRollbackResponse(BaseModel):
    id: str
    rolled_back_count: int
