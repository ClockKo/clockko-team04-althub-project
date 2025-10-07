"""
Two-Factor Authentication Pydantic Schemas

Request and response models for 2FA API endpoints
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class TwoFactorSetupRequest(BaseModel):
    """Request to initiate 2FA setup"""
    password: str = Field(..., min_length=1, description="Current user password for verification")


class TwoFactorSetupResponse(BaseModel):
    """Response containing 2FA setup information"""
    secret: str = Field(..., description="Manual entry secret key")
    qr_code: str = Field(..., description="Base64 encoded QR code image")
    backup_codes: List[str] = Field(..., description="Backup codes for account recovery")


class TwoFactorVerifyRequest(BaseModel):
    """Request to verify and enable 2FA"""
    totp_code: str = Field(..., min_length=6, max_length=6, description="6-digit TOTP code")


class TwoFactorDisableRequest(BaseModel):
    """Request to disable 2FA"""
    password: str = Field(..., min_length=1, description="Current user password")
    totp_code: Optional[str] = Field(None, min_length=6, max_length=6, description="6-digit TOTP code or backup code")


class TwoFactorStatusResponse(BaseModel):
    """Response showing current 2FA status"""
    enabled: bool = Field(..., description="Whether 2FA is enabled")
    backup_codes_remaining: Optional[int] = Field(None, description="Number of unused backup codes")


class TwoFactorLoginRequest(BaseModel):
    """Request for 2FA verification during login"""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")
    totp_code: str = Field(..., min_length=6, max_length=8, description="6-digit TOTP code or 8-digit backup code")


class BackupCodesRegenerateRequest(BaseModel):
    """Request to regenerate backup codes"""
    password: str = Field(..., min_length=1, description="Current user password")
    totp_code: str = Field(..., min_length=6, max_length=6, description="6-digit TOTP code")


class BackupCodesResponse(BaseModel):
    """Response containing new backup codes"""
    backup_codes: List[str] = Field(..., description="New backup codes for account recovery")


class TwoFactorErrorResponse(BaseModel):
    """Error response for 2FA operations"""
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Additional error details")