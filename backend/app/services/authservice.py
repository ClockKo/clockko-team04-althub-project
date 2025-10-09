from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password
from app.core.config import settings
from app.services.emailservice import email_service
import uuid
import random
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

logger = logging.getLogger(__name__)


def create_user(db: Session, user_data: UserCreate) -> User:
    try:
        hashed = hash_password(user_data.password)
        verification_token = str(uuid.uuid4())
        
        user = User(
            username=user_data.name,  # Map name to username
            email=user_data.email,
            full_name=user_data.name,  # Also use name as full_name
            phone_number=None,  # Frontend doesn't provide phone number
            hashed_password=hashed,
            verification_token=verification_token,
            is_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Send welcome email with verification link (don't let email failure affect user creation)
        try:
            verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
            email_service.send_welcome_email(
                to_email=str(user.email),  # type: ignore
                username=str(user.username),  # type: ignore
                verification_link=verification_link
            )
            logger.info(f"Welcome email sent to {user.email}")
        except Exception as e:
            logger.warning(f"Failed to send welcome email to {user.email}: {e}")
            if settings.DEBUG:
                print(f"Manual verification link: {settings.FRONTEND_URL}/verify-email?token={user.verification_token}")
        
        return user
        
    except Exception as e:
        logger.error(f"Failed to create user: {e}")
        db.rollback()
        raise


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()
    if user and verify_password(password, str(user.hashed_password)):  # type: ignore
        return user if bool(user.is_verified) else None  # type: ignore
    return None


def send_welcome_otp(db: Session, email: str) -> bool:
    """Send welcome email with OTP for new user registration"""
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        # Use timezone-aware datetime for consistency
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        user.otp = otp  # type: ignore
        user.otp_expires_at = otp_expires_at  # type: ignore
        db.commit()
        
        # Create verification link for the email
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={user.verification_token}"
        
        # Send welcome email with OTP and verification link
        try:
            email_service.send_welcome_email_with_otp(
                to_email=str(user.email),  # type: ignore
                otp=otp,
                username=str(user.username),  # type: ignore
                verification_link=verification_link
            )
            logger.info(f"Welcome email with OTP sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send welcome email with OTP to {user.email}: {e}")
            if settings.DEBUG:
                print(f"OTP for {user.email}: {otp} (expires at {otp_expires_at})")
                print(f"Verification link: {verification_link}")
            return True  # Still return True if OTP was generated, even if email failed
    return False

def send_otp(db: Session, email: str) -> bool:
    """Send OTP verification email (for manual verification requests)"""
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        # Use timezone-aware datetime for consistency
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        user.otp = otp  # type: ignore
        user.otp_expires_at = otp_expires_at  # type: ignore
        db.commit()
        
        # Create verification link for the email
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={user.verification_token}"
        
        # Send OTP via email with verification link
        try:
            email_service.send_otp_email_with_link(
                to_email=str(user.email),  # type: ignore
                otp=otp,
                username=str(user.username),  # type: ignore
                verification_link=verification_link
            )
            logger.info(f"OTP with verification link sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send OTP to {user.email}: {e}")
            if settings.DEBUG:
                print(f"OTP for {user.email}: {otp} (expires at {otp_expires_at})")
                print(f"Verification link: {verification_link}")
            return True  # Still return True if OTP was generated, even if email failed
    return False

def send_password_reset_otp(db: Session, email: str) -> bool:
    """Send password reset OTP (different from regular email verification OTP)"""
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        # Use timezone-aware datetime for consistency
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        user.otp = otp  # type: ignore
        user.otp_expires_at = otp_expires_at  # type: ignore
        db.commit()
        
        # Send password reset OTP via email
        try:
            email_service.send_password_reset_otp_email(
                to_email=str(user.email),  # type: ignore
                username=str(user.username),  # type: ignore
                otp=otp,
                reset_link=""  # Optional reset link, empty for now
            )
            logger.info(f"Password reset OTP sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset OTP to {user.email}: {e}")
            if settings.DEBUG:
                print(f"Password reset OTP for {user.email}: {otp} (expires at {otp_expires_at})")
            return True  # Still return True if OTP was generated, even if email failed
    return False

def verify_email_token(db: Session, token: str) -> bool:
    """Verify email using verification token"""
    if not token or not token.strip():
        logger.warning("Empty or invalid token provided")
        return False
        
    user = db.query(User).filter(User.verification_token == token.strip()).first()
    if user:
        # Check if user is already verified
        if user.is_verified:
            logger.info(f"User {user.email} is already verified")
            return True  # Consider it successful if already verified
            
        # Verify the user
        user.is_verified = True  # type: ignore
        user.verification_token = None  # type: ignore
        db.commit()
        logger.info(f"Email verified successfully for user {user.email}")
        return True
    else:
        logger.warning(f"No user found with verification token: {token[:10]}...")
        return False

def verify_otp(db: Session, email: str, otp: str) -> bool:
    user = db.query(User).filter(User.email == email, User.otp == otp).first()
    if user:
        # Check if OTP has expired
        if user.otp_expires_at is not None:
            # Handle both offset-naive and offset-aware datetimes
            try:
                # Try with timezone-aware comparison first
                current_time = datetime.now(timezone.utc)
                
                # If stored datetime is offset-naive, make it timezone-aware (assume UTC)
                if user.otp_expires_at.tzinfo is None:
                    expires_at = user.otp_expires_at.replace(tzinfo=timezone.utc)
                else:
                    expires_at = user.otp_expires_at
                    
                if current_time > expires_at:
                    # Clean up expired OTP
                    user.otp = None  # type: ignore
                    user.otp_expires_at = None  # type: ignore
                    db.commit()
                    logger.info(f"Expired OTP cleaned up for {user.email}")
                    return False
                    
            except Exception as e:
                logger.error(f"Datetime comparison error for {user.email}: {e}")
                # If there's any datetime comparison error, treat as expired and clean up
                user.otp = None  # type: ignore
                user.otp_expires_at = None  # type: ignore
                db.commit()
                return False
        
        # OTP is valid and not expired
        user.otp_verified = True  # type: ignore
        user.is_verified = True  # type: ignore  # Also mark email as verified
        user.otp = None  # type: ignore  
        user.otp_expires_at = None  # type: ignore
        db.commit()
        logger.info(f"OTP verified successfully for {user.email}")
        return True
    return False

def request_password_reset(db: Session, email: str) -> Optional[str]:
    user = db.query(User).filter(User.email == email).first()
    if user:
        token = str(uuid.uuid4())
        # Use timezone-aware datetime for consistency
        reset_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
        
        user.reset_token = token  # type: ignore
        user.reset_token_expires_at = reset_expires_at  # type: ignore
        db.commit()
        
        # Send password reset email
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        try:
            email_service.send_password_reset_email(
                to_email=str(user.email),  # type: ignore
                username=str(user.username),  # type: ignore
                reset_link=reset_link
            )
            logger.info(f"Password reset email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {e}")
            if settings.DEBUG:
                print(f"Password reset link: {reset_link} (expires at {reset_expires_at})")
        
        return token
    return None

def reset_password(db: Session, token: str, new_password: str) -> bool:
    user = db.query(User).filter(User.reset_token == token).first()
    if user:
        # Check if reset token has expired - handle both timezone formats
        if user.reset_token_expires_at is not None:
            try:
                current_time = datetime.now(timezone.utc)
                
                # If stored datetime is offset-naive, make it timezone-aware (assume UTC)
                if user.reset_token_expires_at.tzinfo is None:
                    expires_at = user.reset_token_expires_at.replace(tzinfo=timezone.utc)
                else:
                    expires_at = user.reset_token_expires_at
                    
                if current_time > expires_at:
                    # Clean up expired token
                    user.reset_token = None  # type: ignore
                    user.reset_token_expires_at = None  # type: ignore
                    db.commit()
                    logger.info(f"Expired reset token cleaned up")
                    return False
                    
            except Exception as e:
                logger.error(f"Datetime comparison error for reset token: {e}")
                # If there's any datetime comparison error, treat as expired
                user.reset_token = None  # type: ignore
                user.reset_token_expires_at = None  # type: ignore
                db.commit()
                return False
        
        # Token is valid and not expired
        user.hashed_password = hash_password(new_password)  # type: ignore
        user.reset_token = None  # type: ignore
        user.reset_token_expires_at = None  # type: ignore
        db.commit()
        logger.info(f"Password reset successfully via token")
        return True
    return False


def reset_password_with_otp(db: Session, email: str, otp: str, new_password: str) -> bool:
    """Reset password using OTP verification"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning(f"No user found with email: {email}")
        return False
    
    # Check if OTP is valid and not expired
    if user.otp != otp or not user.otp_expires_at:
        logger.warning(f"Invalid OTP or no expiry time for {email}")
        return False
    
    # Handle both offset-naive and offset-aware datetimes
    try:
        current_time = datetime.now(timezone.utc)
        
        # If stored datetime is offset-naive, make it timezone-aware (assume UTC)
        if user.otp_expires_at.tzinfo is None:
            expires_at = user.otp_expires_at.replace(tzinfo=timezone.utc)
        else:
            expires_at = user.otp_expires_at
            
        if current_time > expires_at:
            # Clean up expired OTP
            user.otp = None  # type: ignore
            user.otp_expires_at = None  # type: ignore
            db.commit()
            logger.info(f"Expired OTP cleaned up for password reset: {email}")
            return False
            
    except Exception as e:
        logger.error(f"Datetime comparison error for password reset {email}: {e}")
        # If there's any datetime comparison error, treat as expired and clean up
        user.otp = None  # type: ignore
        user.otp_expires_at = None  # type: ignore
        db.commit()
        return False
    
    # OTP is valid, reset password
    user.hashed_password = hash_password(new_password)  # type: ignore
    user.otp = None  # type: ignore
    user.otp_expires_at = None  # type: ignore
    db.commit()
    logger.info(f"Password reset successfully for {email}")
    return True
