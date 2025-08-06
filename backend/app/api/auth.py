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

router = APIRouter(tags=["auth"])

@router.post("/register", response_model=schema.UserResponse)
def register(user_data: schema.UserCreate, db: Session = Depends(get_db)):
    """Register a new user and send OTP email"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and generate tokens
        hashed_password = hash_password(user_data.password)
        verification_token = str(uuid.uuid4())
        user_id = uuid.uuid4()  
        
        # Create new user
        db_user = User(
            id=user_id,
            username=user_data.username,
            full_name=user_data.full_name,
            email=user_data.email,
            phone_number=user_data.phone_number,
            hashed_password=hashed_password,
            verification_token=verification_token,
            is_active=True,
            is_verified=False,
            otp_verified=False
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
        
        # Return user data (convert to UserResponse for proper serialization)
        return schema.UserResponse.model_validate(db_user)
        
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
        if not user or not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(400, detail="Account is disabled")
        
        # Create access token
        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/user", response_model=schema.UserResponse)
def get_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information"""
    return current_user

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
            raise HTTPException(404, detail="User not found")
        return {
            "detail": "Password reset code sent successfully",
            "message": f"A 6-digit password reset code has been sent to {payload.email}. Use it to reset your password."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send password reset code: {str(e)}")

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