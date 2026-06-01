from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.entities import Account, JournalEntry, Tag, Trade, User


def main() -> None:
    db = SessionLocal()
    try:
        email = "demo@journedge.local"
        user = db.query(User).filter(User.email == email).one_or_none()
        if not user:
            user = User(
                email=email,
                password_hash=hash_password("DemoPass123!"),
                full_name="Demo Trader",
                is_verified=True,
            )
            db.add(user)
            db.flush()

        account = db.query(Account).filter(Account.user_id == user.id, Account.name == "Demo Account").one_or_none()
        if not account:
            account = Account(
                user_id=user.id,
                name="Demo Account",
                broker="Tastytrade",
                initial_balance=25000,
                currency="USD",
            )
            db.add(account)
            db.flush()

        momentum = db.query(Tag).filter(Tag.user_id == user.id, Tag.name == "momentum").one_or_none()
        if not momentum:
            momentum = Tag(user_id=user.id, name="momentum")
            db.add(momentum)
            db.flush()

        existing_trade = db.query(Trade).filter(Trade.user_id == user.id, Trade.symbol == "AAPL").one_or_none()
        if not existing_trade:
            trade = Trade(
                user_id=user.id,
                account_id=account.id,
                duplicate_key="seed-aapl-2026-05-30",
                date=date(2026, 5, 30),
                symbol="AAPL",
                underlying="AAPL",
                type="stock",
                direction="long",
                quantity=10,
                entry_price=195.0,
                exit_price=201.5,
                commission=1.0,
                fees=0.2,
                pnl=63.8,
                status="win",
                rr="1:2.3",
            )
            trade.tags = [momentum]
            trade.journal_entry = JournalEntry(
                user_id=user.id,
                content={
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": "Seeded demo journal entry for local development."}],
                        }
                    ],
                },
                plain_preview="Seeded demo journal entry for local development.",
            )
            db.add(trade)

        db.commit()
        print(
            json.dumps(
                {
                    "email": email,
                    "password": "DemoPass123!",
                    "account": "Demo Account",
                }
            )
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
