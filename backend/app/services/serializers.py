from __future__ import annotations

import json

from app.models.entities import Account, ImportJob, ImportRow, JournalTemplate, Tag, Trade


def serialize_account(account: Account) -> dict:
    return {
        "id": account.id,
        "name": account.name,
        "broker": account.broker,
        "initialBalance": account.initial_balance,
        "currency": account.currency,
        "createdAt": account.created_at.isoformat(),
    }


def serialize_trade(trade: Trade) -> dict:
    journal = trade.journal_entry.content if trade.journal_entry else None
    return {
        "id": trade.id,
        "date": trade.date.isoformat(),
        "symbol": trade.symbol,
        "symbolSource": trade.symbol_source,
        "underlying": trade.underlying,
        "type": trade.type,
        "direction": trade.direction,
        "tradingStyle": trade.trading_style,
        "optionType": trade.option_type,
        "strike": trade.strike,
        "expiry": trade.expiry.isoformat() if trade.expiry else None,
        "positionType": trade.position_type,
        "quantity": trade.quantity,
        "entryPrice": trade.entry_price,
        "exitPrice": trade.exit_price,
        "stopLoss": trade.stop_loss,
        "takeProfit": trade.take_profit,
        "commission": trade.commission,
        "fees": trade.fees,
        "pnl": trade.pnl,
        "status": trade.status,
        "emotion": trade.emotion,
        "entryTime": trade.entry_time,
        "exitTime": trade.exit_time,
        "rr": trade.rr,
        "mae": trade.mae,
        "mfe": trade.mfe,
        "tags": [tag.name for tag in trade.tags],
        "journalEntry": json.dumps(journal) if journal else "",
        "link": trade.link,
        "imageUrls": [f"/api/screenshots/{shot.id}/content" for shot in trade.screenshots],
        "accountId": trade.account_id,
        "createdAt": trade.created_at.isoformat(),
    }


def serialize_tag(tag: Tag) -> dict:
    return {"id": tag.id, "name": tag.name}


def serialize_template(template: JournalTemplate) -> dict:
    return {
        "id": template.id,
        "name": template.name,
        "content": json.dumps(template.content),
        "scope": template.scope,
        "createdAt": template.created_at.isoformat(),
    }


def serialize_import_row(row: ImportRow) -> dict:
    return {
        "id": row.id,
        "rowIndex": row.row_index,
        "normalizedTrade": row.normalized_trade,
        "validationErrors": row.validation_errors,
        "isDuplicate": row.is_duplicate,
        "duplicateTradeId": row.duplicate_trade_id,
        "status": row.status,
    }


def serialize_import_job(job: ImportJob) -> dict:
    return {
        "id": job.id,
        "source": job.source,
        "filename": job.filename,
        "status": job.status,
        "totalRows": job.total_rows,
        "validRows": job.valid_rows,
        "duplicateRows": job.duplicate_rows,
        "invalidRows": job.invalid_rows,
        "createdAt": job.created_at.isoformat(),
    }
