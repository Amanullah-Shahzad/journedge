from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "journedge-backend"
    app_env: Literal["development", "test", "staging", "production"] = "development"
    app_debug: bool = Field(False, alias="APP_DEBUG")
    api_prefix: str = "/api"
    frontend_origin: str = "http://localhost:3000"
    frontend_origins: str | None = Field(None, alias="FRONTEND_ORIGINS")

    database_url: str = Field(..., alias="DATABASE_URL")
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_ttl_minutes: int = 60 * 24 * 7

    smtp_from_email: str = Field("noreply@journedge.local", alias="SMTP_FROM_EMAIL")
    smtp_enabled: bool = Field(False, alias="SMTP_ENABLED")

    s3_endpoint_url: str | None = Field(None, alias="S3_ENDPOINT_URL")
    s3_region: str = Field("us-east-1", alias="S3_REGION")
    s3_access_key_id: str | None = Field(None, alias="S3_ACCESS_KEY_ID")
    s3_secret_access_key: str | None = Field(None, alias="S3_SECRET_ACCESS_KEY")
    s3_bucket_name: str | None = Field(None, alias="S3_BUCKET_NAME")
    storage_backend: Literal["local", "s3"] = Field("local", alias="STORAGE_BACKEND")
    local_upload_dir: str = Field("storage/uploads", alias="LOCAL_UPLOAD_DIR")
    max_upload_bytes: int = Field(5 * 1024 * 1024, alias="MAX_UPLOAD_BYTES")
    allowed_upload_mime_types: str = Field("image/png,image/jpeg,image/webp,image/gif", alias="ALLOWED_UPLOAD_MIME_TYPES")
    allowed_upload_extensions: str = Field(".png,.jpg,.jpeg,.webp,.gif", alias="ALLOWED_UPLOAD_EXTENSIONS")

    rate_limit_default: str = Field("100/minute", alias="RATE_LIMIT_DEFAULT")

    @model_validator(mode="after")
    def validate_runtime(self) -> "Settings":
        if len(self.secret_key) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        if self.storage_backend == "s3":
            required = [
                self.s3_bucket_name,
                self.s3_access_key_id,
                self.s3_secret_access_key,
            ]
            if not all(required):
                raise ValueError("S3 storage requires bucket name and credentials")
        if self.max_upload_bytes <= 0:
            raise ValueError("MAX_UPLOAD_BYTES must be greater than zero")
        if not get_allowed_upload_mime_types(self.allowed_upload_mime_types):
            raise ValueError("ALLOWED_UPLOAD_MIME_TYPES must contain at least one MIME type")
        if not get_allowed_upload_extensions(self.allowed_upload_extensions):
            raise ValueError("ALLOWED_UPLOAD_EXTENSIONS must contain at least one extension")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_cors_origins() -> list[str]:
    settings = get_settings()
    if settings.frontend_origins:
        return [origin.strip() for origin in settings.frontend_origins.split(",") if origin.strip()]
    return [settings.frontend_origin]


def get_allowed_upload_mime_types(raw: str | None = None) -> set[str]:
    value = raw if raw is not None else get_settings().allowed_upload_mime_types
    return {item.strip().lower() for item in value.split(",") if item.strip()}


def get_allowed_upload_extensions(raw: str | None = None) -> set[str]:
    value = raw if raw is not None else get_settings().allowed_upload_extensions
    return {item.strip().lower() for item in value.split(",") if item.strip()}
