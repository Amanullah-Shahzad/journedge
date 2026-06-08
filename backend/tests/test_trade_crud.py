def register(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "trader@example.com",
            "password": "StrongPass123",
            "full_name": "Trader",
            "trading_experience": "Intermediate",
            "preferred_market": "Stocks",
            "country": "United States",
        },
    )
    assert response.status_code == 200


def test_account_and_trade_crud(client):
    register(client)
    account = client.post("/api/accounts", json={"name": "Main", "broker": "IBKR", "initialBalance": 10000, "currency": "USD"})
    assert account.status_code == 200
    account_id = account.json()["id"]

    create = client.post(
        "/api/trades",
        json={
            "trades": [
                {
                    "date": "2026-05-31",
                    "symbol": "MSFT",
                    "underlying": "MSFT",
                    "type": "stock",
                    "direction": "long",
                    "quantity": 5,
                    "entryPrice": 420,
                    "exitPrice": 425,
                    "commission": 1,
                    "fees": 0.5,
                    "pnl": 23.5,
                    "status": "win",
                    "tags": ["swing"],
                    "journalEntry": "",
                    "imageUrls": [],
                    "accountId": account_id,
                }
            ],
            "accountId": account_id,
        },
    )
    assert create.status_code == 200

    trades = client.get("/api/trades")
    assert trades.status_code == 200
    assert len(trades.json()) == 1
    trade_id = trades.json()[0]["id"]

    update = client.patch("/api/trades", json={"id": trade_id, "rr": "1:2"})
    assert update.status_code == 200
    assert update.json()["rr"] == "1:2"

    delete = client.request("DELETE", "/api/trades", json={"id": trade_id})
    assert delete.status_code == 200
    assert client.get("/api/trades").json() == []
