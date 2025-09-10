from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, Union
import uuid

class UserCreate(BaseModel):
    name: str  # Frontend sends "name" - we'll map this to both username and full_name
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    # phone_number: Optional[str] = None
    created_at: datetime
    is_verified: bool = False
    is_active: bool = True
    otp_verified: bool = False
    
    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        """Convert UUID to string if needed"""
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

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