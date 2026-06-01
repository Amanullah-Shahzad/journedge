from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class TradeBase(BaseModel):
    date: str
    symbol: str
    underlying: str
    type: str
    direction: str
    option_type: str | None = Field(default=None, alias="optionType")
    strike: float | None = None
    expiry: str | None = None
    quantity: float
    entry_price: float = Field(alias="entryPrice")
    exit_price: float = Field(alias="exitPrice")
    commission: float = 0
    fees: float = 0
    pnl: float
    status: str
    entry_time: str | None = Field(default=None, alias="entryTime")
    exit_time: str | None = Field(default=None, alias="exitTime")
    rr: str | None = None
    mae: float | None = None
    mfe: float | None = None
    tags: list[str] = Field(default_factory=list)
    journal_entry: dict | str | None = Field(default=None, alias="journalEntry")
    link: str | None = None
    image_urls: list[str] = Field(default_factory=list, alias="imageUrls")
    account_id: str | None = Field(default=None, alias="accountId")


class TradeCreate(TradeBase):
    id: str | None = None


class TradeBulkCreate(BaseModel):
    trades: list[TradeCreate]
    account_id: str | None = Field(default=None, alias="accountId")


class TradeUpdate(BaseModel):
    id: str | None = None
    symbol: str | None = None
    underlying: str | None = None
    date: str | None = None
    quantity: float | None = None
    entry_price: float | None = Field(default=None, alias="entryPrice")
    exit_price: float | None = Field(default=None, alias="exitPrice")
    commission: float | None = None
    fees: float | None = None
    pnl: float | None = None
    status: str | None = None
    type: str | None = None
    direction: str | None = None
    option_type: str | None = Field(default=None, alias="optionType")
    strike: float | None = None
    expiry: str | None = None
    entry_time: str | None = Field(default=None, alias="entryTime")
    exit_time: str | None = Field(default=None, alias="exitTime")
    rr: str | None = None
    mae: float | None = None
    mfe: float | None = None
    tags: list[str] | None = None
    journal_entry: dict | str | None = Field(default=None, alias="journalEntry")
    link: str | None = None
    image_urls: list[str] | None = Field(default=None, alias="imageUrls")
    account_id: str | None = Field(default=None, alias="accountId")


class TradeRead(ORMModel):
    id: str
    date: str
    symbol: str
    underlying: str
    type: str
    direction: str
    option_type: str | None = Field(default=None, alias="optionType")
    strike: float | None = None
    expiry: str | None = None
    quantity: float
    entry_price: float = Field(alias="entryPrice")
    exit_price: float = Field(alias="exitPrice")
    commission: float
    fees: float
    pnl: float
    status: str
    entry_time: str | None = Field(default=None, alias="entryTime")
    exit_time: str | None = Field(default=None, alias="exitTime")
    rr: str | None = None
    mae: float | None = None
    mfe: float | None = None
    tags: list[str]
    journal_entry: str | None = Field(default=None, alias="journalEntry")
    link: str | None = None
    image_urls: list[str] = Field(default_factory=list, alias="imageUrls")
    account_id: str | None = Field(default=None, alias="accountId")
    created_at: datetime | None = Field(default=None, alias="createdAt")
