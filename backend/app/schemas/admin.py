from pydantic import BaseModel, Field


class CreateBackupRequest(BaseModel):
    user_id: str = Field(alias="userId", min_length=1)

