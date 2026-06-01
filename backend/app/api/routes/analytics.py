from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.deps import get_current_user, get_db
from app.models.entities import Account, Trade
from app.services.analytics import summarize_analytics
from app.services.ownership import validate_user_account_id


router = APIRouter()


@router.get("/summary")
def analytics_summary(accountId: str | None = Query(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    validated_account_id = validate_user_account_id(db, user, accountId)
    stmt = (
        select(Trade)
        .where(Trade.user_id == user.id)
        .options(selectinload(Trade.tags), selectinload(Trade.journal_entry), selectinload(Trade.screenshots))
    )
    if validated_account_id:
        stmt = stmt.where(Trade.account_id == validated_account_id)
    trades = db.scalars(stmt).all()
    initial_balance = 0.0
    if validated_account_id:
        account = db.scalar(select(Account).where(Account.id == validated_account_id, Account.user_id == user.id))
        initial_balance = account.initial_balance if account else 0.0
    return summarize_analytics(trades, initial_balance)
