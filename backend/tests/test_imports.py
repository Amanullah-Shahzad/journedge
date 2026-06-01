CSV = """Date,Symbol,Underlying,Type,Direction,Option Type,Strike,Expiry,Quantity,Entry Price,Exit Price,Commission,Fees,P&L,Status,Entry Time,Exit Time,R:R,Tags,Journal,Account ID
2026-05-30,AAPL,AAPL,stock,long,,,,1,100,110,0,0,10,win,,,,momentum,Test journal,
"""


def register(client):
    response = client.post("/api/auth/register", json={"email": "importer@example.com", "password": "StrongPass123", "full_name": "Importer"})
    assert response.status_code == 200


def test_duplicate_safe_import_pipeline(client):
    register(client)
    preview = client.post("/api/imports/preview", files={"file": ("trades.csv", CSV, "text/csv")})
    assert preview.status_code == 200
    job_id = preview.json()["id"]

    commit = client.post(f"/api/imports/{job_id}/commit")
    assert commit.status_code == 200
    assert commit.json()["importedCount"] == 1

    preview_again = client.post("/api/imports/preview", files={"file": ("trades.csv", CSV, "text/csv")})
    assert preview_again.status_code == 200
    assert preview_again.json()["duplicateRows"] >= 1
    second_job_id = preview_again.json()["id"]

    second_commit = client.post(f"/api/imports/{second_job_id}/commit")
    assert second_commit.status_code == 200
    assert second_commit.json()["importedCount"] == 0

    history = client.get("/api/imports")
    assert history.status_code == 200
    assert len(history.json()) >= 2

    rollback = client.post(f"/api/imports/{job_id}/rollback")
    assert rollback.status_code == 200
    assert rollback.json()["rolledBackCount"] == 1

    trades = client.get("/api/trades")
    assert trades.status_code == 200
    assert trades.json() == []

    preview_after_rollback = client.post("/api/imports/preview", files={"file": ("trades.csv", CSV, "text/csv")})
    assert preview_after_rollback.status_code == 200
    assert preview_after_rollback.json()["duplicateRows"] == 0
