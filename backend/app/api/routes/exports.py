import logging
from datetime import date

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.rate_limit import limiter
from app.db.deps import get_current_user, get_db
from app.models.entities import Trade
from app.schemas.exports import ExportDatasetRequest
from app.services.audit import audit_and_log
from app.services.ownership import validate_user_account_id
from app.services.serializers import serialize_trade


router = APIRouter()
logger = logging.getLogger("journedge.exports")


@router.post("/dataset")
@limiter.limit("20/minute")
def export_dataset(request: Request, filters: ExportDatasetRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    account_id = validate_user_account_id(db, user, filters.accountId)
    stmt = (
        select(Trade)
        .where(Trade.user_id == user.id)
        .options(selectinload(Trade.tags), selectinload(Trade.journal_entry), selectinload(Trade.screenshots))
        .order_by(Trade.date.desc())
    )
    if account_id:
        stmt = stmt.where(Trade.account_id == account_id)
    if filters.startDate:
        stmt = stmt.where(Trade.date >= date.fromisoformat(filters.startDate))
    if filters.endDate:
        stmt = stmt.where(Trade.date <= date.fromisoformat(filters.endDate))
    trades = [serialize_trade(trade) for trade in db.scalars(stmt).all()]
    if filters.tickers:
        trades = [trade for trade in trades if trade["underlying"] in filters.tickers]
    if filters.statuses:
        trades = [trade for trade in trades if trade["status"] in filters.statuses]
    if filters.tags:
        trades = [trade for trade in trades if any(tag in trade["tags"] for tag in filters.tags)]
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="export.generate",
        resource_type="export",
        payload={"tradeCount": len(trades), "accountId": account_id},
        message="Export dataset generated",
    )
    db.commit()
    return {"trades": trades}
