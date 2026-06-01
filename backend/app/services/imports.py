from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date
from typing import Any

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.entities import ImportJob, ImportRow, Trade, User
from app.schemas.trades import TradeCreate
from app.services.ownership import get_user_import_job, validate_user_account_id
from app.services.trades import duplicate_key, upsert_trade


def parse_csv_line(line: str) -> list[str]:
    cols: list[str] = []
    current = []
    in_quotes = False
    for char in line:
        if char == '"':
            in_quotes = not in_quotes
        elif char == "," and not in_quotes:
            cols.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    cols.append("".join(current).strip())
    return cols


def normalize_date(raw: str) -> str:
    if "/" in raw:
        mm, dd, yyyy = raw.strip().split("/")
        return f"{yyyy}-{mm.zfill(2)}-{dd.zfill(2)}"
    return raw.strip()


def status_from_pnl(pnl: float) -> str:
    return "win" if pnl > 0 else "loss" if pnl < 0 else "breakeven"


def parse_option_occ(symbol: str) -> dict[str, Any]:
    import re

    match = re.match(r"^([A-Z]+)(\d{2})(\d{2})(\d{2})([CP])(\d+(?:\.\d+)?)$", symbol.replace(".", "").replace("-", ""))
    if not match:
        return {}
    underlying, yy, mm, dd, cp, strike = match.groups()
    return {
        "underlying": underlying,
        "expiry": f"20{yy}-{mm}-{dd}",
        "optionType": "call" if cp == "C" else "put",
        "strike": float(strike),
    }


def parse_fidelity(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines()]
    header_index = next((i for i, line in enumerate(lines) if line.startswith("Run Date,Action,Symbol")), -1)
    if header_index == -1:
        raise AppError("Invalid Fidelity CSV format")
    rows = []
    for line in lines[header_index + 1 :]:
        if not line or line.startswith('"The data'):
            break
        cols = parse_csv_line(line)
        if len(cols) < 11:
            continue
        action = cols[1]
        if "YOU BOUGHT" not in action and "YOU SOLD" not in action:
            continue
        rows.append(
            {
                "date": cols[0],
                "action": action,
                "symbol": cols[2].strip(),
                "description": cols[3],
                "price": float(cols[5] or 0),
                "quantity": abs(float(cols[6] or 0)),
                "commission": abs(float(cols[7] or 0)),
                "fees": abs(float(cols[8] or 0)),
            }
        )
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["symbol"], []).append(row)
    trades: list[dict] = []
    for symbol, group in grouped.items():
        buys = [row for row in group if "YOU BOUGHT" in row["action"]]
        sells = [row for row in group if "YOU SOLD" in row["action"]]
        for index in range(min(len(buys), len(sells))):
            buy, sell = buys[index], sells[index]
            trade_type = "option" if symbol.startswith("-") else "future" if symbol.startswith("/") else "stock"
            multiplier = 100 if trade_type == "option" else 1
            details = parse_option_occ(symbol)
            entry = buy["price"]
            exit_price = sell["price"]
            qty = buy["quantity"]
            pnl = round((exit_price - entry) * qty * multiplier - buy["commission"] - sell["commission"] - buy["fees"] - sell["fees"], 2)
            trades.append(
                {
                    "id": f"{symbol}-{buy['date']}-{index}",
                    "date": normalize_date(buy["date"]),
                    "symbol": symbol.replace("-", ""),
                    "underlying": details.get("underlying") or symbol.replace("-", ""),
                    "type": trade_type,
                    "direction": "long",
                    "optionType": details.get("optionType"),
                    "strike": details.get("strike"),
                    "expiry": details.get("expiry"),
                    "quantity": qty,
                    "entryPrice": entry,
                    "exitPrice": exit_price,
                    "commission": buy["commission"] + sell["commission"],
                    "fees": buy["fees"] + sell["fees"],
                    "pnl": pnl,
                    "status": status_from_pnl(pnl),
                    "tags": [],
                    "journalEntry": "",
                    "imageUrls": [],
                }
            )
    return sorted(trades, key=lambda item: item["date"], reverse=True)


def parse_tdameritrade(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    header_index = next((i for i, line in enumerate(lines) if line.replace('"', "").startswith("DATE,TRANSACTION ID,DESCRIPTION,QUANTITY,SYMBOL,PRICE,COMMISSION")), -1)
    if header_index == -1:
        raise AppError("Invalid TD Ameritrade CSV format")
    rows: list[dict] = []
    for line in lines[header_index + 1 :]:
        if line.replace('"', "").startswith("***"):
            break
        cols = parse_csv_line(line)
        if len(cols) < 8:
            continue
        description = cols[2]
        symbol = cols[4].strip()
        price = abs(float(cols[5] or 0))
        quantity = abs(float(cols[3] or 0))
        amount = float(cols[7] or 0)
        if not symbol or not cols[0] or price == 0 or quantity == 0:
            continue
        desc = description.upper()
        if not any(token in desc for token in ("BOT", "SLD", "BUY", "SELL", "BOUGHT", "SOLD")):
            continue
        rows.append(
            {
                "date": cols[0],
                "symbol": symbol,
                "price": price,
                "quantity": quantity,
                "commission": abs(float(cols[6] or 0)),
                "isBuy": amount < 0,
            }
        )
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["symbol"], []).append(row)
    trades: list[dict] = []
    for symbol, group in grouped.items():
        buys = [row for row in group if row["isBuy"]]
        sells = [row for row in group if not row["isBuy"]]
        details = parse_option_occ(symbol)
        trade_type = "option" if symbol.startswith(".") or details else "future" if symbol.startswith("/") else "stock"
        underlying = details.get("underlying") or symbol.replace(".", "").replace("/", "")
        multiplier = 100 if trade_type == "option" else 1
        for index in range(min(len(buys), len(sells))):
            buy, sell = buys[index], sells[index]
            qty = min(buy["quantity"], sell["quantity"])
            pnl = round((sell["price"] - buy["price"]) * qty * multiplier - buy["commission"] - sell["commission"], 2)
            trades.append(
                {
                    "id": f"tda-{symbol}-{index}",
                    "date": normalize_date(sell["date"]),
                    "symbol": symbol.replace(".", ""),
                    "underlying": underlying,
                    "type": trade_type,
                    "direction": "long",
                    "optionType": details.get("optionType"),
                    "strike": details.get("strike"),
                    "expiry": details.get("expiry"),
                    "quantity": qty,
                    "entryPrice": buy["price"],
                    "exitPrice": sell["price"],
                    "commission": buy["commission"] + sell["commission"],
                    "fees": 0,
                    "pnl": pnl,
                    "status": status_from_pnl(pnl),
                    "tags": [],
                    "journalEntry": "",
                    "imageUrls": [],
                }
            )
    return sorted(trades, key=lambda item: item["date"], reverse=True)


def parse_tastytrade(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    header = parse_csv_line(lines[0])
    columns = {name.replace('"', "").strip(): index for index, name in enumerate(header)}
    rows: list[dict] = []
    for line in lines[1:]:
        cols = parse_csv_line(line)
        if (cols[columns.get("Type", -1)] if columns.get("Type") is not None else "") != "Trade":
            continue
        action = (cols[columns["Action"]] if "Action" in columns else "").upper()
        rows.append(
            {
                "date": normalize_date(cols[columns["Date"]]),
                "symbol": cols[columns["Symbol"]],
                "underlying": cols[columns.get("Underlying Symbol", columns["Symbol"])],
                "instrumentType": cols[columns["Instrument Type"]].lower(),
                "quantity": abs(float(cols[columns["Quantity"]] or 0)),
                "avgPrice": abs(float(cols[columns.get("Average Price", 0)] or 0)),
                "commissions": abs(float(cols[columns.get("Commissions", 0)] or 0)),
                "fees": abs(float(cols[columns.get("Fees", 0)] or 0)),
                "multiplier": float(cols[columns.get("Multiplier", 0)] or 1),
                "expiry": normalize_date(cols[columns.get("Expiration Date", 0)] or "") if "Expiration Date" in columns else "",
                "strike": float(cols[columns["Strike Price"]]) if "Strike Price" in columns and cols[columns["Strike Price"]] else None,
                "callOrPut": (cols[columns["Call or Put"]] if "Call or Put" in columns else "").upper(),
                "isOpening": "OPEN" in action,
                "isBuy": "BUY" in action,
            }
        )
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["symbol"], []).append(row)
    trades: list[dict] = []
    for symbol, group in grouped.items():
        def process(opens: list[dict], closes: list[dict], direction: str) -> None:
            for index in range(min(len(opens), len(closes))):
                open_row, close_row = opens[index], closes[index]
                is_option = "option" in open_row["instrumentType"]
                is_future = "future" in open_row["instrumentType"]
                trade_type = "option" if is_option else "future" if is_future else "stock"
                quantity = min(open_row["quantity"], close_row["quantity"])
                gross = (
                    (close_row["avgPrice"] - open_row["avgPrice"]) if direction == "long" else (open_row["avgPrice"] - close_row["avgPrice"])
                ) * quantity * open_row["multiplier"]
                pnl = round(gross - open_row["commissions"] - close_row["commissions"] - open_row["fees"] - close_row["fees"], 2)
                trades.append(
                    {
                        "id": f"tasty-{symbol}-{direction}-{index}",
                        "date": open_row["date"],
                        "symbol": symbol,
                        "underlying": open_row["underlying"] or symbol,
                        "type": trade_type,
                        "direction": direction,
                        "optionType": "call" if open_row["callOrPut"] == "CALL" else "put" if open_row["callOrPut"] == "PUT" else None,
                        "strike": open_row["strike"],
                        "expiry": open_row["expiry"] or None,
                        "quantity": quantity,
                        "entryPrice": open_row["avgPrice"],
                        "exitPrice": close_row["avgPrice"],
                        "commission": open_row["commissions"] + close_row["commissions"],
                        "fees": open_row["fees"] + close_row["fees"],
                        "pnl": pnl,
                        "status": status_from_pnl(pnl),
                        "tags": [],
                        "journalEntry": "",
                        "imageUrls": [],
                    }
                )
        process([row for row in group if row["isBuy"] and row["isOpening"]], [row for row in group if not row["isBuy"] and not row["isOpening"]], "long")
        process([row for row in group if not row["isBuy"] and row["isOpening"]], [row for row in group if row["isBuy"] and not row["isOpening"]], "short")
    return sorted(trades, key=lambda item: item["date"], reverse=True)


def parse_ibkr(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    header_line = next((line for line in lines if line.startswith("Trades,Header,")), None)
    if not header_line:
        raise AppError("Invalid IBKR CSV format")
    headers = parse_csv_line(header_line)
    columns = {name.strip(): index for index, name in enumerate(headers[3:], start=3)}
    rows: list[dict] = []
    for line in lines:
        if not line.startswith("Trades,Data,Order,"):
            continue
        cols = parse_csv_line(line)
        get = lambda name: cols[columns[name]] if name in columns and columns[name] < len(cols) else ""
        quantity_raw = float(get("Quantity") or 0)
        price = abs(float(get("T. Price") or 0))
        symbol = get("Symbol")
        if not quantity_raw or not price or not symbol:
            continue
        rows.append(
            {
                "assetCategory": get("Asset Category").lower(),
                "symbol": symbol.strip(),
                "date": get("Date/Time").split(",")[0].replace('"', "").strip(),
                "quantity": quantity_raw,
                "price": price,
                "commission": abs(float(get("Comm/Fee") or 0)),
                "realizedPnl": float(get("Realized P/L") or 0),
                "isBuy": quantity_raw > 0,
            }
        )
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["symbol"], []).append(row)
    trades: list[dict] = []
    for symbol, group in grouped.items():
        buys = [row for row in group if row["isBuy"]]
        sells = [row for row in group if not row["isBuy"]]
        details = parse_option_occ(symbol.replace(" ", ""))
        is_option = "option" in group[0]["assetCategory"]
        is_future = "future" in group[0]["assetCategory"]
        trade_type = "option" if is_option else "future" if is_future else "stock"
        multiplier = 100 if trade_type == "option" else 1
        for index in range(min(len(buys), len(sells))):
            buy, sell = buys[index], sells[index]
            quantity = min(abs(buy["quantity"]), abs(sell["quantity"]))
            calc_pnl = (sell["price"] - buy["price"]) * quantity * multiplier - buy["commission"] - sell["commission"]
            pnl = round(sell["realizedPnl"] if sell["realizedPnl"] else calc_pnl, 2)
            trades.append(
                {
                    "id": f"ibkr-{symbol}-{index}",
                    "date": sell["date"] or buy["date"],
                    "symbol": symbol.strip(),
                    "underlying": details.get("underlying") or symbol.strip().split(" ")[0],
                    "type": trade_type,
                    "direction": "long",
                    "optionType": details.get("optionType"),
                    "strike": details.get("strike"),
                    "expiry": details.get("expiry"),
                    "quantity": quantity,
                    "entryPrice": buy["price"],
                    "exitPrice": sell["price"],
                    "commission": buy["commission"] + sell["commission"],
                    "fees": 0,
                    "pnl": pnl,
                    "status": status_from_pnl(pnl),
                    "tags": [],
                    "journalEntry": "",
                    "imageUrls": [],
                }
            )
    return sorted(trades, key=lambda item: item["date"], reverse=True)


def parse_journedge(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    trades: list[dict] = []
    for index, line in enumerate(lines[1:]):
        cols = parse_csv_line(line)
        if len(cols) < 14:
            continue
        pnl = float(cols[13] or 0)
        trades.append(
            {
                "id": f"journedge-{index}",
                "date": normalize_date(cols[0]),
                "symbol": cols[1],
                "underlying": cols[2],
                "type": cols[3] if cols[3] in {"option", "stock", "future"} else "option",
                "direction": cols[4] if cols[4] in {"long", "short"} else "long",
                "optionType": cols[5] or None,
                "strike": float(cols[6]) if cols[6] else None,
                "expiry": cols[7] or None,
                "quantity": float(cols[8] or 0),
                "entryPrice": float(cols[9] or 0),
                "exitPrice": float(cols[10] or 0),
                "commission": float(cols[11] or 0),
                "fees": float(cols[12] or 0),
                "pnl": pnl,
                "status": cols[14] or status_from_pnl(pnl),
                "entryTime": cols[15] or None,
                "exitTime": cols[16] or None,
                "rr": cols[17] or None,
                "tags": cols[18].split("|") if len(cols) > 18 and cols[18] else [],
                "journalEntry": cols[19] or "",
                "accountId": cols[20] or None if len(cols) > 20 else None,
                "imageUrls": [],
            }
        )
    return sorted(trades, key=lambda item: item["date"], reverse=True)


def detect_and_parse(text: str) -> tuple[str, list[dict]]:
    first_line = text.splitlines()[0].replace('"', "").strip() if text.splitlines() else ""
    if first_line == "Date,Symbol,Underlying,Type,Direction,Option Type,Strike,Expiry,Quantity,Entry Price,Exit Price,Commission,Fees,P&L,Status,Entry Time,Exit Time,R:R,Tags,Journal,Account ID":
        return "Journedge", parse_journedge(text)
    if "Instrument Type" in first_line and "Action" in first_line and "Underlying Symbol" in first_line:
        return "tastytrade", parse_tastytrade(text)
    if first_line.startswith("DATE,TRANSACTION ID,DESCRIPTION,QUANTITY,SYMBOL,PRICE,COMMISSION"):
        return "tdameritrade", parse_tdameritrade(text)
    if "Trades,Header," in text and "Trades,Data," in text:
        return "ibkr", parse_ibkr(text)
    return "fidelity", parse_fidelity(text)


@dataclass
class ImportPreview:
    job: ImportJob
    rows: list[ImportRow]


def preview_import(db: Session, user: User, filename: str, text: str, account_id: str | None) -> ImportPreview:
    validated_account_id = validate_user_account_id(db, user, account_id)
    source, parsed = detect_and_parse(text)
    job = ImportJob(user_id=user.id, account_id=validated_account_id, source=source, filename=filename)
    db.add(job)
    db.flush()

    preview_rows: list[ImportRow] = []
    valid_rows = duplicate_rows = invalid_rows = 0
    for index, trade in enumerate(parsed, start=1):
        errors: list[str] = []
        try:
            TradeCreate(**trade)
        except ValidationError as exc:
            errors = [err["msg"] for err in exc.errors()]
        dup_key = duplicate_key(trade, trade.get("accountId") or validated_account_id)
        existing = db.scalar(select(Trade).where(Trade.user_id == user.id, Trade.duplicate_key == dup_key))
        is_duplicate = existing is not None
        if errors:
            invalid_rows += 1
        elif is_duplicate:
            duplicate_rows += 1
        else:
            valid_rows += 1
        row = ImportRow(
            job_id=job.id,
            row_index=index,
            raw_data=trade,
            normalized_trade=trade,
            validation_errors=errors,
            is_duplicate=is_duplicate,
            duplicate_trade_id=existing.id if existing else None,
            status="invalid" if errors else "duplicate" if is_duplicate else "preview",
        )
        db.add(row)
        preview_rows.append(row)
    job.total_rows = len(parsed)
    job.valid_rows = valid_rows
    job.duplicate_rows = duplicate_rows
    job.invalid_rows = invalid_rows
    job.summary = {"source": source}
    db.commit()
    db.refresh(job)
    for row in preview_rows:
        db.refresh(row)
    return ImportPreview(job=job, rows=preview_rows)


def commit_import(db: Session, user: User, job_id: str) -> tuple[ImportJob, int]:
    job = get_user_import_job(db, user, job_id)
    imported_count = 0
    rows = db.scalars(select(ImportRow).where(ImportRow.job_id == job.id)).all()
    for row in rows:
        if row.status in {"invalid", "duplicate", "committed"} or not row.normalized_trade:
            continue
        trade = upsert_trade(
            db,
            user,
            row.normalized_trade,
            account_id=job.account_id,
            import_job_id=job.id,
        )
        row.status = "committed"
        row.duplicate_trade_id = trade.id
        imported_count += 1
    job.status = "committed"
    from datetime import datetime, UTC

    job.committed_at = datetime.now(UTC)
    db.commit()
    db.refresh(job)
    return job, imported_count


def rollback_import(db: Session, user: User, job_id: str) -> tuple[ImportJob, int]:
    job = get_user_import_job(db, user, job_id)
    trades = db.scalars(select(Trade).where(Trade.user_id == user.id, Trade.import_job_id == job.id)).all()
    count = len(trades)
    for trade in trades:
        db.delete(trade)
    from datetime import datetime, UTC

    job.status = "rolled_back"
    job.rolled_back_at = datetime.now(UTC)
    db.commit()
    db.refresh(job)
    return job, count
