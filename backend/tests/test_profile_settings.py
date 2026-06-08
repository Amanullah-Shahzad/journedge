def register(client, email: str = "profile@example.com", password: str = "StrongPass123"):
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Profile User",
            "trading_experience": "Intermediate",
            "preferred_market": "Stocks",
            "country": "United States",
        },
    )
    assert response.status_code == 200
    return response


def create_account(client, name: str = "Main"):
    response = client.post("/api/accounts", json={"name": name, "broker": "IBKR", "initialBalance": 10000, "currency": "USD"})
    assert response.status_code == 200
    return response.json()


def test_profile_read_and_update(client):
    register(client)

    profile = client.get("/api/users/me")
    assert profile.status_code == 200
    assert profile.json()["user"]["email"] == "profile@example.com"

    updated = client.put("/api/users/me", json={"full_name": "Updated Name"})
    assert updated.status_code == 200
    assert updated.json()["user"]["full_name"] == "Updated Name"


def test_password_change(client):
    register(client, password="OriginalPass123")

    changed = client.put("/api/users/me/password", json={"current_password": "OriginalPass123", "new_password": "NewSecurePass456"})
    assert changed.status_code == 200
    assert changed.json()["message"] == "Password updated"

    client.post("/api/auth/logout")

    old_login = client.post("/api/auth/login", json={"email": "profile@example.com", "password": "OriginalPass123"})
    assert old_login.status_code == 401

    new_login = client.post("/api/auth/login", json={"email": "profile@example.com", "password": "NewSecurePass456"})
    assert new_login.status_code == 200


def test_settings_read_and_update(client):
    register(client)
    account = create_account(client)

    initial = client.get("/api/settings")
    assert initial.status_code == 200
    assert initial.json()["settings"]["timezone"] == "UTC"
    assert initial.json()["settings"]["default_currency"] == "USD"

    updated = client.put(
        "/api/settings",
        json={"timezone": "America/New_York", "default_currency": "eur", "default_account_id": account["id"]},
    )
    assert updated.status_code == 200
    body = updated.json()["settings"]
    assert body["timezone"] == "America/New_York"
    assert body["default_currency"] == "EUR"
    assert body["default_account_id"] == account["id"]


def test_settings_reject_foreign_account(client):
    register(client, email="owner@example.com")
    account = create_account(client, "Owner Account")
    assert account["id"]
    client.post("/api/auth/logout")

    register(client, email="other@example.com")
    response = client.put(
        "/api/settings",
        json={"timezone": "UTC", "default_currency": "USD", "default_account_id": account["id"]},
    )
    assert response.status_code == 404
