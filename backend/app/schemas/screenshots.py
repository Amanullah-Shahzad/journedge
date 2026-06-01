from datetime import datetime

from pydantic import BaseModel


class ScreenshotRead(BaseModel):
    id: str
    trade_id: str | None = None
    public_url: str
    content_type: str
    size_bytes: int
    created_at: datetime
