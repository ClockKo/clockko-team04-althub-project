"""
Two-Factor Authentication API Endpoints

Handles setup, verification, and management of 2FA for user accounts
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import verify_password, hash_password
from app.models.user import User
from app.schemas.two_factor_auth import (
    TwoFactorSetupRequest,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    TwoFactorDisableRequest,
    TwoFactorStatusResponse,
    BackupCodesRegenerateRequest,
    BackupCodesResponse,
)
from app.services.two_factor_auth import two_factor_service

router = APIRouter(prefix="/2fa", tags=["Two-Factor Authentication"])


@router.post("/setup", response_model=TwoFactorSetupResponse)
async def setup_two_factor_auth(
    request: TwoFactorSetupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initialize 2FA setup by generating secret and QR code
    Requires password verification
    """
    # Verify current password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )
    
    # Check if 2FA is already enabled
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is already enabled"
        )
    
    try:
        # Generate new secret
        secret = two_factor_service.generate_secret()
        
        # Generate QR code
        qr_code = two_factor_service.generate_qr_code(secret, current_user.email)
        
        # Generate backup codes
        backup_codes = two_factor_service.generate_backup_codes()
        
        # Store encrypted secret temporarily (will be confirmed on verification)
        encrypted_secret = two_factor_service.encrypt_secret(secret)
        current_user.two_factor_secret = encrypted_secret
        
        # Store hashed backup codes
        hashed_backup_codes = two_factor_service.hash_backup_codes(backup_codes)
        current_user.backup_codes = json.dumps(hashed_backup_codes)
        
        db.commit()
        
        return TwoFactorSetupResponse(
            secret=two_factor_service.format_secret_for_manual_entry(secret),
            qr_code=qr_code,
            backup_codes=backup_codes
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup 2FA: {str(e)}"
        )


@router.post("/verify")
async def verify_and_enable_two_factor_auth(
    request: TwoFactorVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify TOTP code and enable 2FA
    """
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is already enabled"
        )
    
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No 2FA setup in progress. Please start setup first."
        )
    
    try:
        # Decrypt secret
        secret = two_factor_service.decrypt_secret(current_user.two_factor_secret)
        
        # Verify TOTP code
        if not two_factor_service.verify_totp(secret, request.totp_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        # Enable 2FA
        current_user.two_factor_enabled = True
        db.commit()
        
        return {"message": "Two-factor authentication enabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify 2FA: {str(e)}"
        )


@router.post("/disable")
async def disable_two_factor_auth(
    request: TwoFactorDisableRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Disable 2FA - requires password and TOTP/backup code verification
    """
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is not enabled"
        )
    
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )
    
    # Verify TOTP code or backup code
    if not request.totp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP code or backup code required"
        )
    
    try:
        verified = False
        
        # Try TOTP verification first (6 digits)
        if len(request.totp_code) == 6:
            secret = two_factor_service.decrypt_secret(current_user.two_factor_secret)
            verified = two_factor_service.verify_totp(secret, request.totp_code)
        
        # Try backup code verification (8 digits)
        elif len(request.totp_code) == 8 and current_user.backup_codes:
            verified, updated_codes = two_factor_service.verify_backup_code(
                request.totp_code, current_user.backup_codes
            )
            if verified:
                current_user.backup_codes = updated_codes
        
        if not verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        # Disable 2FA and clear secrets
        current_user.two_factor_enabled = False
        current_user.two_factor_secret = None
        current_user.backup_codes = None
        
        db.commit()
        
        return {"message": "Two-factor authentication disabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable 2FA: {str(e)}"
        )


@router.get("/status", response_model=TwoFactorStatusResponse)
async def get_two_factor_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get current 2FA status and backup codes count
    """
    backup_codes_count = None
    if current_user.two_factor_enabled and current_user.backup_codes:
        try:
            codes = json.loads(current_user.backup_codes)
            backup_codes_count = len(codes)
        except (json.JSONDecodeError, TypeError):
            backup_codes_count = 0
    
    return TwoFactorStatusResponse(
        enabled=current_user.two_factor_enabled,
        backup_codes_remaining=backup_codes_count
    )


@router.post("/backup-codes/regenerate", response_model=BackupCodesResponse)
async def regenerate_backup_codes(
    request: BackupCodesRegenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate new backup codes - requires password and TOTP verification
    """
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is not enabled"
        )
    
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )
    
    # Verify TOTP code
    try:
        secret = two_factor_service.decrypt_secret(current_user.two_factor_secret)
        if not two_factor_service.verify_totp(secret, request.totp_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        # Generate new backup codes
        backup_codes = two_factor_service.generate_backup_codes()
        hashed_backup_codes = two_factor_service.hash_backup_codes(backup_codes)
        
        # Update user's backup codes
        current_user.backup_codes = json.dumps(hashed_backup_codes)
        db.commit()
        
        return BackupCodesResponse(backup_codes=backup_codes)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate backup codes: {str(e)}"
        )