from pydantic import BaseModel, EmailStr, Field

from app.schemas.auth import UserRead


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class UserSettingsRead(BaseModel):
    timezone: str
    default_currency: str
    default_account_id: str | None = None


class UserSettingsUpdateRequest(BaseModel):
    timezone: str = Field(min_length=1, max_length=64)
    default_currency: str = Field(min_length=3, max_length=8)
    default_account_id: str | None = None


class ProfileResponse(BaseModel):
    user: UserRead


class UserSettingsResponse(BaseModel):
    settings: UserSettingsRead
