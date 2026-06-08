def register(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "validator@example.com",
            "password": "StrongPass123",
            "full_name": "Validator",
            "trading_experience": "Intermediate",
            "preferred_market": "Forex",
            "country": "United States",
        },
    )
    assert response.status_code == 200


def assert_validation_error(response):
    assert response.status_code == 422
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["message"] == "Invalid request payload"
    assert isinstance(body["details"], list)


def test_invalid_auth_payload(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "bad@example.com",
            "password": "short",
            "trading_experience": "Intermediate",
            "preferred_market": "Forex",
            "country": "United States",
        },
    )
    assert_validation_error(response)


def test_invalid_account_payload(client):
    register(client)
    response = client.post("/api/accounts", json={"name": "", "broker": "IBKR", "initialBalance": 1000, "currency": "USD"})
    assert_validation_error(response)


def test_invalid_trade_create_payload(client):
    register(client)
    response = client.post(
        "/api/trades",
        json={
            "trades": [
                {
                    "symbol": "MSFT",
                    "underlying": "MSFT",
                    "type": "stock",
                    "direction": "long",
                    "quantity": 1,
                    "entryPrice": 100,
                    "exitPrice": 110,
                    "pnl": 10,
                    "status": "win",
                }
            ]
        },
    )
    assert_validation_error(response)


def test_invalid_trade_update_payload(client):
    register(client)
    response = client.patch("/api/trades", json={"rr": "1:2"})
    assert response.status_code == 422
    assert response.json()["error"] == "validation_error"


def test_invalid_template_payload(client):
    register(client)
    response = client.post("/api/journal/templates", json={"name": "", "content": {}, "scope": "all"})
    assert_validation_error(response)


def test_invalid_export_payload(client):
    register(client)
    response = client.post("/api/exports/dataset", json={"tickers": "AAPL"})
    assert_validation_error(response)
