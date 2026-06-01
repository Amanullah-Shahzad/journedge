from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.deps import get_current_user, get_db
from app.models.entities import Trade
from app.services.ownership import validate_user_account_id
from app.services.serializers import serialize_trade


router = APIRouter()


@router.get("/month")
def month_view(
    year: int,
    month: int,
    accountId: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
) -> dict:
    validated_account_id = validate_user_account_id(db, user, accountId)
    start = date(year, month, 1)
    end = date(year + (1 if month == 12 else 0), 1 if month == 12 else month + 1, 1)
    stmt = select(Trade).where(Trade.user_id == user.id, Trade.date >= start, Trade.date < end)
    if validated_account_id:
        stmt = stmt.where(Trade.account_id == validated_account_id)
    trades = db.scalars(stmt).all()
    grouped = defaultdict(lambda: {"pnl": 0.0, "count": 0})
    for trade in trades:
        key = trade.date.isoformat()
        grouped[key]["pnl"] += trade.pnl
        grouped[key]["count"] += 1
    return {"days": [{"date": key, "pnl": round(values["pnl"], 2), "count": values["count"]} for key, values in sorted(grouped.items())]}


@router.get("/day")
def day_view(value: str = Query(alias="date"), accountId: str | None = Query(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    validated_account_id = validate_user_account_id(db, user, accountId)
    stmt = (
        select(Trade)
        .where(Trade.user_id == user.id, Trade.date == date.fromisoformat(value))
        .options(selectinload(Trade.tags), selectinload(Trade.screenshots), selectinload(Trade.journal_entry))
    )
    if validated_account_id:
        stmt = stmt.where(Trade.account_id == validated_account_id)
    trades = db.scalars(stmt).all()
    return {"date": value, "trades": [serialize_trade(trade) for trade in trades]}
