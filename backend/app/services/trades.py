from __future__ import annotations

import hashlib
import json
from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import AppError
from app.models.entities import JournalEntry, Screenshot, Tag, Trade, User
from app.services.ownership import validate_user_account_id


def parse_iso_date(value: str | date) -> date:
    if isinstance(value, date):
        return value
    if "/" in value:
        month, day_value, year = value.split("/")
        return date.fromisoformat(f"{year}-{month.zfill(2)}-{day_value.zfill(2)}")
    return date.fromisoformat(value)


def normalize_journal_content(value: dict | str | None) -> dict:
    if value is None or value == "":
        return {}
    if isinstance(value, dict):
        return value
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else {"type": "doc", "content": []}
    except json.JSONDecodeError:
        return {
            "type": "doc",
            "content": [{"type": "paragraph", "content": [{"type": "text", "text": value}]}],
        }


def journal_preview(content: dict) -> str:
    pieces: list[str] = []
    for node in content.get("content", []):
        for child in node.get("content", []):
            if child.get("type") == "text":
                pieces.append(child.get("text", ""))
    return " ".join(piece.strip() for piece in pieces if piece).strip()


def duplicate_key(payload: dict[str, Any], account_id: str | None) -> str:
    raw = {
        "accountId": account_id,
        "date": payload["date"],
        "symbol": payload["symbol"],
        "underlying": payload["underlying"],
        "type": payload["type"],
        "direction": payload["direction"],
        "optionType": payload.get("optionType"),
        "strike": round(float(payload.get("strike") or 0), 4),
        "expiry": payload.get("expiry"),
        "quantity": round(float(payload["quantity"]), 4),
        "entryPrice": round(float(payload["entryPrice"]), 4),
        "exitPrice": round(float(payload["exitPrice"]), 4),
        "commission": round(float(payload.get("commission") or 0), 4),
        "fees": round(float(payload.get("fees") or 0), 4),
        "pnl": round(float(payload["pnl"]), 4),
    }
    return hashlib.sha256(json.dumps(raw, sort_keys=True).encode("utf-8")).hexdigest()


def resolve_tags(db: Session, user: User, tag_names: list[str]) -> list[Tag]:
    resolved: list[Tag] = []
    for name in sorted({n.strip() for n in tag_names if n and n.strip()}):
        tag = db.scalar(select(Tag).where(Tag.user_id == user.id, Tag.name == name))
        if not tag:
            tag = Tag(user_id=user.id, name=name)
            db.add(tag)
            db.flush()
        resolved.append(tag)
    return resolved


def upsert_trade(
    db: Session,
    user: User,
    payload: dict[str, Any],
    *,
    account_id: str | None = None,
    import_job_id: str | None = None,
    existing: Trade | None = None,
) -> Trade:
    data = existing or Trade(user_id=user.id, duplicate_key="")
    resolved_account_id = payload.get("accountId") if payload.get("accountId") is not None else account_id
    data.account_id = validate_user_account_id(db, user, resolved_account_id)
    data.import_job_id = import_job_id
    data.date = parse_iso_date(payload["date"])
    data.symbol = payload["symbol"]
    data.underlying = payload["underlying"]
    data.type = payload["type"]
    data.direction = payload["direction"]
    data.option_type = payload.get("optionType")
    data.strike = payload.get("strike")
    data.expiry = parse_iso_date(payload["expiry"]) if payload.get("expiry") else None
    data.quantity = float(payload["quantity"])
    data.entry_price = float(payload["entryPrice"])
    data.exit_price = float(payload["exitPrice"])
    data.commission = float(payload.get("commission") or 0)
    data.fees = float(payload.get("fees") or 0)
    data.pnl = float(payload["pnl"])
    data.status = payload["status"]
    data.entry_time = payload.get("entryTime")
    data.exit_time = payload.get("exitTime")
    data.rr = payload.get("rr")
    data.mae = payload.get("mae")
    data.mfe = payload.get("mfe")
    data.link = payload.get("link")
    data.duplicate_key = duplicate_key(payload, data.account_id)
    data.tags = resolve_tags(db, user, payload.get("tags") or [])

    content = normalize_journal_content(payload.get("journalEntry"))
    if content:
        if not data.journal_entry:
            data.journal_entry = JournalEntry(user_id=user.id, content=content, plain_preview=journal_preview(content))
        else:
            data.journal_entry.content = content
            data.journal_entry.plain_preview = journal_preview(content)
    elif data.journal_entry:
        data.journal_entry.content = {}
        data.journal_entry.plain_preview = None

    image_urls = payload.get("imageUrls") or []
    if image_urls:
        known = {shot.public_url: shot for shot in data.screenshots}
        data.screenshots = [known[url] if url in known else Screenshot(user_id=user.id, public_url=url, storage_key=url, content_type="image/remote", size_bytes=0) for url in image_urls]

    db.add(data)
    db.flush()
    return data


def get_user_trade(db: Session, user: User, trade_id: str) -> Trade:
    trade = db.scalar(
        select(Trade)
        .where(Trade.id == trade_id, Trade.user_id == user.id)
        .options(
            selectinload(Trade.tags),
            selectinload(Trade.screenshots),
            selectinload(Trade.journal_entry),
        )
    )
    if not trade:
        raise AppError("Trade not found", status_code=404, code="trade_not_found")
    return trade
