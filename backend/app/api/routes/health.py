from sqlalchemy import text
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import redis

from app.core.config import get_settings
from app.core.storage import get_storage
from app.db.deps import get_db


router = APIRouter()


@router.get("/health/live")
def live() -> dict:
    return {"status": "ok"}


@router.get("/health/ready")
def ready(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ready"}


@router.get("/health/app")
def app_health() -> dict:
    settings = get_settings()
    return {"status": "ok", "environment": settings.app_env, "app": settings.app_name}


@router.get("/health/database")
def database_health(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@router.get("/health/redis")
def redis_health() -> JSONResponse:
    try:
        redis.from_url(get_settings().redis_url).ping()
        return JSONResponse(status_code=200, content={"status": "ok"})
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"error": "dependency_unavailable", "message": "Redis unavailable", "details": [{"service": "redis", "error": str(exc)}]},
        )


@router.get("/health/storage")
def storage_health() -> JSONResponse:
    try:
        details = get_storage().healthcheck()
        return JSONResponse(status_code=200, content=details)
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"error": "dependency_unavailable", "message": "Storage unavailable", "details": [{"service": "storage", "error": str(exc)}]},
        )
