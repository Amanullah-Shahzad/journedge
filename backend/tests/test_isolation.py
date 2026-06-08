CSV = """Date,Symbol,Underlying,Type,Direction,Option Type,Strike,Expiry,Quantity,Entry Price,Exit Price,Commission,Fees,P&L,Status,Entry Time,Exit Time,R:R,Tags,Journal,Account ID
2026-05-30,AAPL,AAPL,stock,long,,,,1,100,110,0,0,10,win,,,,momentum,Test journal,
"""


def register(client, email: str):
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "StrongPass123",
            "full_name": email,
            "trading_experience": "Intermediate",
            "preferred_market": "Crypto",
            "country": "United States",
        },
    )
    assert response.status_code == 200


def create_account(client, name: str = "Main") -> dict:
    response = client.post("/api/accounts", json={"name": name, "broker": "Fidelity", "initialBalance": 1000, "currency": "USD"})
    assert response.status_code == 200
    return response.json()


def create_trade(client, account_id: str) -> dict:
    response = client.post(
        "/api/trades",
        json={
            "trades": [
                {
                    "date": "2026-05-30",
                    "symbol": "AAPL",
                    "underlying": "AAPL",
                    "type": "stock",
                    "direction": "long",
                    "quantity": 1,
                    "entryPrice": 100,
                    "exitPrice": 110,
                    "commission": 0,
                    "fees": 0,
                    "pnl": 10,
                    "status": "win",
                    "tags": [],
                    "journalEntry": "",
                    "imageUrls": [],
                    "accountId": account_id,
                }
            ],
            "accountId": account_id,
        },
    )
    assert response.status_code == 200
    trades = client.get("/api/trades")
    assert trades.status_code == 200
    return trades.json()[0]


def test_user_resources_are_isolated(client):
    register(client, "user-one@example.com")
    account = create_account(client)
    trade = create_trade(client, account["id"])

    journal = client.patch("/api/journal/trades/" + trade["id"], json={"content": {"type": "doc", "content": []}})
    assert journal.status_code == 200

    screenshot = client.post(
        "/api/screenshots/upload",
        files={"file": ("trade.png", b"fake-image", "image/png")},
        data={"trade_id": trade["id"]},
    )
    assert screenshot.status_code == 200
    screenshot_id = screenshot.json()["id"]

    preview = client.post("/api/imports/preview", files={"file": ("trades.csv", CSV, "text/csv")})
    assert preview.status_code == 200
    import_job_id = preview.json()["id"]

    client.post("/api/auth/logout")

    register(client, "user-two@example.com")

    accounts = client.get("/api/accounts")
    assert accounts.status_code == 200
    assert accounts.json() == []

    assert client.patch("/api/accounts", json={"id": account["id"], "name": "Other"}).status_code == 404
    assert client.request("DELETE", "/api/accounts", json={"id": account["id"]}).status_code == 404
    assert client.get(f"/api/trades?accountId={account['id']}").status_code == 404
    assert client.post("/api/trades", json={"trades": [], "accountId": account["id"]}).status_code == 404
    assert client.patch("/api/trades", json={"id": trade["id"], "rr": "1:1"}).status_code == 404
    assert client.request("DELETE", "/api/trades", json={"id": trade["id"]}).status_code == 404
    assert client.get(f"/api/journal/trades/{trade['id']}").status_code == 404
    assert client.patch(f"/api/journal/trades/{trade['id']}", json={"content": {"type": "doc"}}).status_code == 404
    assert client.get(f"/api/screenshots/{screenshot_id}/content").status_code == 404
    assert client.delete(f"/api/screenshots/{screenshot_id}").status_code == 404
    assert client.get(f"/api/imports/{import_job_id}").status_code == 404
    assert client.post(f"/api/imports/{import_job_id}/commit").status_code == 404
    assert client.post(f"/api/imports/{import_job_id}/rollback").status_code == 404
    assert client.post("/api/imports/preview", files={"file": ("trades.csv", CSV, "text/csv")}, data={"account_id": account["id"]}).status_code == 404
    assert client.post("/api/exports/dataset", json={"accountId": account["id"]}).status_code == 404
    assert client.get(f"/api/analytics/summary?accountId={account['id']}").status_code == 404
    assert client.get(f"/api/calendar/month?year=2026&month=5&accountId={account['id']}").status_code == 404
