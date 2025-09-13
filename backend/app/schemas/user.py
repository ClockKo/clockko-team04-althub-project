from datetime import datetime
import uuid

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator


class UserCreate(BaseModel):
    # Frontend sends "name"; we'll map this to a display name from the model
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    # extra='ignore' ensures unexpected ORM attributes like username/full_name are dropped
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, extra='ignore')

    id: str
    name: str  
    email: EmailStr
    created_at: datetime
    is_verified: bool = False
    is_active: bool = True
    otp_verified: bool = False

    @field_validator("id", mode="before")
    @classmethod
    def _id_to_str(cls, v):
        """Convert UUID to string if needed."""
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    @classmethod
    def from_user_model(cls, user_obj):
        """Create UserResponse from User model, mapping full_name/username to name for FE."""
        display_name = getattr(user_obj, "full_name", None) or getattr(user_obj, "username", None) or getattr(user_obj, "email", "")
        return cls(
            id=str(user_obj.id),
            name=display_name,
            email=user_obj.email,
            created_at=user_obj.created_at,
            is_verified=getattr(user_obj, "is_verified", False),
            is_active=getattr(user_obj, "is_active", True),
            otp_verified=getattr(user_obj, "otp_verified", False),
        )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str