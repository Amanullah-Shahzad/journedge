from fastapi import APIRouter

from app.api.routes import (
    accounts,
    admin,
    analytics,
    auth,
    calendar,
    compat,
    exports,
    health,
    imports,
    journal,
    screenshots,
    settings,
    tags,
    trades,
    users,
)


api_router = APIRouter()
api_router.include_router(compat.router, tags=["compat"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(trades.router, prefix="/trades", tags=["trades"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])
api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(screenshots.router, prefix="/screenshots", tags=["screenshots"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
