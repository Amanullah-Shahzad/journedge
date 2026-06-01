def test_health_endpoints(client):
    live = client.get("/api/health/live")
    assert live.status_code == 200
    assert live.json()["status"] == "ok"

    ready = client.get("/api/health/ready")
    assert ready.status_code == 200
    assert ready.json()["status"] == "ready"


def test_component_health_endpoints(client, monkeypatch):
    class FakeRedis:
        def ping(self):
            return True

    monkeypatch.setattr("app.api.routes.health.redis.from_url", lambda _url: FakeRedis())

    app_health = client.get("/api/health/app")
    assert app_health.status_code == 200
    assert app_health.json()["status"] == "ok"

    database_health = client.get("/api/health/database")
    assert database_health.status_code == 200
    assert database_health.json()["status"] == "ok"

    redis_health = client.get("/api/health/redis")
    assert redis_health.status_code == 200
    assert redis_health.json()["status"] == "ok"

    storage_health = client.get("/api/health/storage")
    assert storage_health.status_code == 200
    assert storage_health.json()["status"] == "ok"
