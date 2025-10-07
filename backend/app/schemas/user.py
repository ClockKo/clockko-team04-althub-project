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
    phone_number: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    is_verified: bool = False
    is_active: bool = True
    otp_verified: bool = False
    # onboarding_completed: bool = False  # Temporarily commented out due to missing DB column

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
            phone_number=getattr(user_obj, "phone_number", None),
            avatar_url=getattr(user_obj, "avatar_url", None),
            created_at=user_obj.created_at,
            is_verified=getattr(user_obj, "is_verified", False),
            is_active=getattr(user_obj, "is_active", True),
            otp_verified=getattr(user_obj, "otp_verified", False),
            # onboarding_completed=getattr(user_obj, "onboarding_completed", False),  # Temporarily commented out
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


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information."""
    name: str | None = None
    phone_number: str | None = None
    avatar_url: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "phone_number": "+1234567890",
                "avatar_url": "/avatars/avatar-1.png"
            }
        }


class PasswordVerifyRequest(BaseModel):
    """Schema for verifying current password."""
    password: str


class EmailCheckRequest(BaseModel):
    """Schema for checking email availability."""
    email: EmailStr


class EmailChangeRequest(BaseModel):
    """Schema for sending email change verification."""
    new_email: EmailStr


class EmailChangeVerifyRequest(BaseModel):
    """Schema for verifying email change with OTP."""
    new_email: EmailStr
    verification_code: str


class PasswordChangeRequest(BaseModel):
    """Schema for changing password."""
    current_password: str
    new_password: str
