def test_register_login_and_me(client):
    register = client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "StrongPass123", "full_name": "Alice"},
    )
    assert register.status_code == 200
    body = register.json()
    assert body["user"]["email"] == "alice@example.com"

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"
    assert "created_at" in me.json()

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    after_logout = client.get("/api/auth/me")
    assert after_logout.status_code == 401

    login = client.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass123"})
    assert login.status_code == 200


def test_versioned_me_endpoint(client):
    register = client.post(
        "/api/auth/register",
        json={"email": "versioned@example.com", "password": "StrongPass123", "full_name": "Versioned"},
    )
    assert register.status_code == 200
    me = client.get("/api/v1/users/me")
    assert me.status_code == 200
    assert me.json()["user"]["email"] == "versioned@example.com"
