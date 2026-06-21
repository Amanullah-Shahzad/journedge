from __future__ import annotations

from pydantic import BaseModel, Field


class AdminPagination(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    q: str | None = None


class AdminUserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    role: str | None = Field(default=None, pattern="^(user|admin)$")
    is_active: bool | None = None
    is_verified: bool | None = None


class AdminUserPasswordUpdateRequest(BaseModel):
    new_password: str = Field(min_length=8, max_length=255)


class CreateBackupRequest(BaseModel):
    user_id: str = Field(alias="userId", min_length=1)


class AdminTradeFilters(AdminPagination):
    user_id: str | None = None


class AdminImportFilters(AdminPagination):
    status: str | None = None


class AdminAssetFilters(AdminPagination):
    user_id: str | None = None
