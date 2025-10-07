from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import user as schema
from app.services import userservice
from app.models.user import User
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from typing import Union
import uuid
import json
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])

@router.post("/register", response_model=schema.UserResponse)
def register(user_data: schema.UserCreate, db: Session = Depends(get_db)):
    """Register a new user and send OTP email"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check if username already exists (since we're using name as username)
        existing_username = db.query(User).filter(User.username == user_data.name).first()
        if existing_username:
            # Generate unique username by appending timestamp
            import time
            unique_username = f"{user_data.name}_{int(time.time())}"
        else:
            unique_username = user_data.name
        
        # Hash password and generate tokens
        hashed_password = hash_password(user_data.password)
        verification_token = str(uuid.uuid4())
        user_id = uuid.uuid4()  
        
        # Create new user
        db_user = User(
            id=user_id,
            username=unique_username,  # Use the unique username we generated
            full_name=user_data.name,  # Store original name as full_name
            email=user_data.email,
            # phone_number=user_data.phone_number,
            hashed_password=hashed_password,
            verification_token=verification_token,
            is_active=True,
            is_verified=False,
            otp_verified=False
            # onboarding_completed=False  # Field is commented out in User model
        )
        
        # Save user to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Send welcome email with OTP (in case of failure it doesn't break the registration process)
        try:
            otp_sent = userservice.send_welcome_otp(db, user_data.email)
            if otp_sent:
                print(f"Welcome email with OTP sent to {user_data.email}")
            else:
                print(f"Welcome email sending failed for {user_data.email}")
        except Exception as email_error:
            print(f"Welcome email sending error: {email_error}")
            # Continue with registration even if email fails

        # Return user data using custom mapping to ensure frontend compatibility
        user_resp = schema.UserResponse.from_user_model(db_user)
        return user_resp.model_dump()
        
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate email)
        db.rollback()
        raise
    except Exception as e:
        # Handle any other errors
        db.rollback()
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(user_credentials: schema.UserLogin, db: Session = Depends(get_db)):
    """Login endpoint - accepts JSON """
    try:
        # Authenticate user
        user = db.query(User).filter(User.email == user_credentials.email).first()
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"User found: {user.email}")
        print(f"User is_active: {user.is_active}")
        
        if not verify_password(user_credentials.password, user.hashed_password):
            print("Password verification failed")
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print("Password verification successful")
        
        if not user.is_active:
            raise HTTPException(400, detail="Account is disabled")
        
        print(f"Creating token for user ID: {user.id}")
        
        # Create access token
        token = create_access_token({"sub": str(user.id)})
        print(f"Token created successfully")
        
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/user", response_model=schema.UserResponse)
def get_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information"""
    user_resp = schema.UserResponse.from_user_model(current_user)
    return user_resp.model_dump()

@router.post("/send-verification-email")
def send_verification_email(payload: schema.SendOTPRequest, db: Session = Depends(get_db)):
    """Send verification email with OTP code"""
    try:
        success = userservice.send_otp(db, payload.email)
        if not success:
            raise HTTPException(404, detail="User not found")
        return {
            "detail": "Verification email sent successfully",
            "message": f"A 6-digit verification code has been sent to {payload.email}. It will expire in 5 minutes."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")

@router.post("/verify-email")
def verify_email(payload: schema.VerifyOTPRequest, db: Session = Depends(get_db)):    
    """Verify email with OTP code"""
    try:
        success = userservice.verify_otp(db, payload.email, payload.otp)
        if not success:
            raise HTTPException(400, detail="Invalid or expired verification code")
        return {
            "detail": "Email verified successfully!",
            "message": "Your account has been verified. You can now log in."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email verification failed: {str(e)}")

@router.post("/forgot-password")
def forgot_password(payload: schema.SendOTPRequest, db: Session = Depends(get_db)):
    """Send password reset OTP"""
    try:
        success = userservice.send_password_reset_otp(db, payload.email)
        if not success:
            raise HTTPException(400, detail="User not found")
        return {"detail": "If the email is registered, a reset code has been sent"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to send reset email: {str(e)}")

@router.post("/reset-password")
def reset_password(payload: schema.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password with OTP verification"""
    try:
        success = userservice.reset_password_with_otp(db, payload.email, payload.otp, payload.new_password)
        if not success:
            raise HTTPException(400, detail="Invalid or expired OTP")
        return {
            "detail": "Password reset successfully!",
            "message": "Your password has been updated. You can now log in with your new password."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")


@router.put("/user", response_model=schema.UserResponse)
def update_user_profile(
    profile_update: schema.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the current user's profile information"""
    try:
        # Update only the fields that are provided (not None)
        if profile_update.name is not None:
            current_user.full_name = profile_update.name
        
        if profile_update.phone_number is not None:
            current_user.phone_number = profile_update.phone_number
        
        if profile_update.avatar_url is not None:
            current_user.avatar_url = profile_update.avatar_url
        
        db.commit()
        db.refresh(current_user)
        
        return schema.UserResponse.from_user_model(current_user)
    
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Profile update failed: Invalid data provided")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")


@router.post("/verify-password")
def verify_current_password(
    payload: schema.PasswordVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify current user's password for security operations."""
    try:
        if not verify_password(payload.password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect password")
        
        return {"detail": "Password verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password verification failed: {str(e)}")


@router.get("/check-email")
def check_email_availability(email: str, db: Session = Depends(get_db)):
    """Check if email is available for use."""
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email address is already in use")
        
        return {"detail": "Email is available"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email check failed: {str(e)}")


@router.post("/send-email-verification")
def send_email_change_verification(
    payload: schema.EmailChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send verification code to new email address for email change."""
    try:
        # Check if new email is different from current
        if payload.new_email == current_user.email:
            raise HTTPException(status_code=400, detail="New email must be different from current email")
        
        # Check if new email is already in use
        existing_user = db.query(User).filter(User.email == payload.new_email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email address is already in use")
        
        # Use the same OTP system as account creation
        from datetime import datetime, timedelta, timezone
        import random
        
        # Generate 6-digit OTP (same as account creation)
        otp = f"{random.randint(100000, 999999)}"
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)  # 5 minutes like account creation
        
        # Store OTP and new email in user record
        current_user.otp = otp
        current_user.otp_expires_at = otp_expires_at
        # Store the new email temporarily in verification_token
        current_user.verification_token = f"email_change:{payload.new_email}"
        db.commit()
        
        # Send OTP via email (using the same email service as account creation)
        try:
            from app.services.emailservice import email_service
            email_service.send_otp_email_with_link(
                to_email=payload.new_email,
                otp=otp,
                username=current_user.username or current_user.full_name or "User",
                verification_link=f"Email change verification code: {otp}"  # Simple message for now
            )
            logger.info(f"Email change OTP sent to {payload.new_email}")
        except Exception as e:
            logger.warning(f"Failed to send email change OTP to {payload.new_email}: {e}")
            # Print to console for development
            print(f"Email change verification code for {payload.new_email}: {otp} (expires in 5 minutes)")
        
        return {
            "detail": "Verification code sent successfully", 
            "message": f"A 6-digit verification code has been sent to {payload.new_email}. It will expire in 5 minutes."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send verification code: {str(e)}")


@router.post("/change-email")
def change_email_address(
    payload: schema.EmailChangeVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change email address after verifying the verification code."""
    try:
        # Check if email change request exists
        if not current_user.verification_token or not current_user.verification_token.startswith('email_change:'):
            raise HTTPException(status_code=400, detail="No email change request found")
        
        # Extract new email from verification token
        try:
            stored_new_email = current_user.verification_token.split(':', 1)[1]
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="Invalid email change request")
        
        # Verify the email matches
        if stored_new_email != payload.new_email:
            raise HTTPException(status_code=400, detail="Email address mismatch")
        
        # Use the same OTP verification logic as account creation
        if not current_user.otp or current_user.otp != payload.verification_code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Check if OTP has expired (same logic as userservice.verify_otp)
        if current_user.otp_expires_at is not None:
            from datetime import datetime, timezone
            try:
                current_time = datetime.now(timezone.utc)
                
                # Handle timezone-aware/naive datetime comparison
                if current_user.otp_expires_at.tzinfo is None:
                    expires_at = current_user.otp_expires_at.replace(tzinfo=timezone.utc)
                else:
                    expires_at = current_user.otp_expires_at
                    
                if current_time > expires_at:
                    # Clean up expired OTP
                    current_user.otp = None
                    current_user.otp_expires_at = None
                    current_user.verification_token = None
                    db.commit()
                    raise HTTPException(status_code=400, detail="Verification code has expired")
                    
            except Exception as e:
                logger.error(f"Datetime comparison error for {current_user.email}: {e}")
                # Clean up on error
                current_user.otp = None
                current_user.otp_expires_at = None
                current_user.verification_token = None
                db.commit()
                raise HTTPException(status_code=400, detail="Verification code has expired")
        
        # Check if new email is still available
        existing_user = db.query(User).filter(User.email == payload.new_email).first()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email address is already in use")
        
        # Update email address and clean up verification data
        current_user.email = payload.new_email
        current_user.verification_token = None
        current_user.otp = None
        current_user.otp_expires_at = None
        current_user.is_verified = True  # Mark email as verified
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"Email successfully changed to {payload.new_email} for user {current_user.id}")
        
        return {
            "detail": "Email address changed successfully",
            "message": f"Your email has been successfully changed to {payload.new_email}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Email change failed for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email change failed: {str(e)}")