from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.schemas.common import ORMModel


class UserRead(ORMModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    trading_experience: str | None = None
    preferred_market: str | None = None
    country: str | None = None
    role: str
    is_verified: bool
    is_active: bool
    verified_at: datetime | None = None
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserRead
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None
    trading_experience: str = Field(min_length=1)
    preferred_market: str = Field(min_length=1)
    country: str = Field(min_length=1)

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data):
        if not isinstance(data, dict):
            return data
        normalized = dict(data)
        if "fullName" in normalized and "full_name" not in normalized:
            normalized["full_name"] = normalized.pop("fullName")
        if "tradingExperience" in normalized and "trading_experience" not in normalized:
            normalized["trading_experience"] = normalized.pop("tradingExperience")
        if "preferredMarket" in normalized and "preferred_market" not in normalized:
            normalized["preferred_market"] = normalized.pop("preferredMarket")
        return normalized

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Full name is required")
        return value

    @field_validator("trading_experience")
    @classmethod
    def validate_trading_experience(cls, value: str) -> str:
        allowed = {"Beginner", "Intermediate", "Advanced", "Professional"}
        if value not in allowed:
            raise ValueError("Invalid trading experience")
        return value

    @field_validator("preferred_market")
    @classmethod
    def validate_preferred_market(cls, value: str) -> str:
        allowed = {"All markets", "Forex", "Crypto", "Stocks", "Options", "Futures", "Commodities"}
        if value not in allowed:
            raise ValueError("Invalid preferred market")
        return value

    @field_validator("country")
    @classmethod
    def validate_country(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Country is required")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8)


class VerifyEmailRequest(BaseModel):
    token: str
