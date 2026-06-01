import logging

from fastapi import APIRouter, Depends, Query
import json
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.db.deps import get_current_user, get_db
from app.models.entities import Trade
from app.core.errors import AppError
from app.schemas.common import IdPayload
from app.schemas.trades import TradeBulkCreate, TradeCreate, TradeUpdate
from app.services.audit import audit_and_log
from app.services.ownership import validate_user_account_id
from app.services.serializers import serialize_trade
from app.services.trades import get_user_trade, upsert_trade


router = APIRouter()
logger = logging.getLogger("journedge.trades")


def trade_query(db: Session, user_id: str, account_id: str | None = None):
    stmt = (
        select(Trade)
        .where(Trade.user_id == user_id)
        .options(selectinload(Trade.tags), selectinload(Trade.screenshots), selectinload(Trade.journal_entry))
        .order_by(Trade.date.desc())
    )
    if account_id:
        stmt = stmt.where(Trade.account_id == account_id)
    return db.scalars(stmt).all()


@router.get("")
def list_trades(accountId: str | None = Query(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[dict]:
    validate_user_account_id(db, user, accountId)
    trades = trade_query(db, user.id, accountId)
    return [serialize_trade(trade) for trade in trades]


@router.post("")
def create_trades(payload: dict, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    body = TradeBulkCreate.model_validate(payload)
    resolved_account_id = validate_user_account_id(db, user, body.account_id)
    for trade_payload in body.trades:
        trade = upsert_trade(db, user, trade_payload.model_dump(by_alias=True), account_id=resolved_account_id)
        audit_and_log(
            db,
            event_logger=logger,
            user_id=user.id,
            action="trade.create",
            resource_type="trade",
            resource_id=trade.id,
            payload={"symbol": trade.symbol, "accountId": trade.account_id},
            message="Trade created",
        )
    db.commit()
    return {"success": True}


@router.patch("")
def update_trade(body: dict, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    if isinstance(body.get("tags"), str):
        body["tags"] = json.loads(body["tags"])
    if isinstance(body.get("imageUrls"), str):
        body["imageUrls"] = json.loads(body["imageUrls"])
    payload = TradeUpdate.model_validate(body)
    if not payload.id:
        raise AppError("Trade id is required", status_code=422, code="validation_error")
    trade = get_user_trade(db, user, payload.id)
    update_data = {key: value for key, value in payload.model_dump(by_alias=True).items() if value is not None}
    merged = serialize_trade(trade)
    merged.update(update_data)
    trade = upsert_trade(db, user, merged, existing=trade)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="trade.update",
        resource_type="trade",
        resource_id=trade.id,
        payload={"symbol": trade.symbol, "fields": sorted(update_data.keys())},
        message="Trade updated",
    )
    db.commit()
    db.refresh(trade)
    return serialize_trade(trade)


@router.delete("")
def delete_trade(body: IdPayload, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    trade = get_user_trade(db, user, body.id)
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="trade.delete",
        resource_type="trade",
        resource_id=trade.id,
        payload={"symbol": trade.symbol},
        message="Trade deleted",
    )
    db.delete(trade)
    db.commit()
    return {"success": True}


@router.delete("/clear")
def clear_trades(db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    deleted = db.execute(delete(Trade).where(Trade.user_id == user.id))
    audit_and_log(
        db,
        event_logger=logger,
        user_id=user.id,
        action="trade.clear",
        resource_type="trade",
        payload={"deletedCount": deleted.rowcount or 0},
        message="All trades cleared",
    )
    db.commit()
    return {"success": True}
