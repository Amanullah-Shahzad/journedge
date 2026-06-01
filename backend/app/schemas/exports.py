from pydantic import BaseModel, Field


class ExportDatasetRequest(BaseModel):
    accountId: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    tickers: list[str] = Field(default_factory=list)
    statuses: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
