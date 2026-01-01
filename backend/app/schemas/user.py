"""
User Pydantic schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from app.models.user import UserRole
from app.schemas.common import Timestamps, UUIDEntity


class UserCreate(BaseModel):
    """Schema for user registration"""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.TEAM_MEMBER
    hrmsx_user_id: Optional[str] = Field(None, max_length=100)

    @field_validator("hrmsx_user_id")
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v



class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str = Field(..., min_length=1)


class UserUpdate(BaseModel):
    """Schema for updating user profile"""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = Field(None)
    role: Optional[UserRole] = None
    hrmsx_user_id: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("hrmsx_user_id")
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v



class UserResponse(UUIDEntity, Timestamps):
    """Schema for user response (excludes password)"""

    email: str
    full_name: str
    role: UserRole
    hrmsx_user_id: Optional[str]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for authentication token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
