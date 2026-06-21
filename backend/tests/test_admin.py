from app.models.entities import User


def test_admin_access_and_user_management(client_and_db):
    client, db = client_and_db

    client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "StrongPass123",
            "full_name": "Admin User",
            "trading_experience": "Advanced",
            "preferred_market": "Forex",
            "country": "United States",
        },
    )
    admin = db.query(User).filter(User.email == "admin@example.com").one()
    admin.role = "admin"
    db.commit()

    login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "StrongPass123"})
    assert login.status_code == 200

    create_user = client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "password": "StrongPass123",
            "full_name": "Normal User",
            "trading_experience": "Intermediate",
            "preferred_market": "Stocks",
            "country": "United States",
        },
    )
    assert create_user.status_code == 200
    user_id = create_user.json()["user"]["id"]

    client.post("/api/auth/login", json={"email": "admin@example.com", "password": "StrongPass123"})

    users = client.get("/api/admin/users")
    assert users.status_code == 200
    assert users.json()["pagination"]["total"] >= 2

    updated = client.put(f"/api/admin/users/{user_id}", json={"is_active": False, "role": "user"})
    assert updated.status_code == 200
    assert updated.json()["isActive"] is False

    password_reset = client.put(f"/api/admin/users/{user_id}/password", json={"new_password": "BrandNewPass456"})
    assert password_reset.status_code == 200

    reactivated = client.put(f"/api/admin/users/{user_id}", json={"is_active": True})
    assert reactivated.status_code == 200

    relogin = client.post("/api/auth/login", json={"email": "user@example.com", "password": "BrandNewPass456"})
    assert relogin.status_code == 200

    admin_relogin = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "StrongPass123"})
    assert admin_relogin.status_code == 200

    summary = client.get("/api/admin/summary")
    assert summary.status_code == 200
    assert "analytics" in summary.json()


def test_non_admin_cannot_access_admin_routes(client):
    register = client.post(
        "/api/auth/register",
        json={
            "email": "trader@example.com",
            "password": "StrongPass123",
            "full_name": "Trader",
            "trading_experience": "Intermediate",
            "preferred_market": "Crypto",
            "country": "United States",
        },
    )
    assert register.status_code == 200

    response = client.get("/api/admin/users")
    assert response.status_code == 403
