from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import user_settings as settings_schema
from app.services import usersettingsservice
from app.models.user import User
from app.core.database import get_db
from app.core.auth import get_current_user
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["User Management"])


@router.get("/settings", response_model=settings_schema.UserSettingsResponse, status_code=200)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's settings including:
    - Work boundaries (start/end times, max daily hours)
    - Wellness windows (break reminders, wellness checks)
    - Notification preferences
    - Shutdown settings
    - Privacy and productivity settings
    """
    try:
        settings = usersettingsservice.get_or_create_user_settings(db, current_user.id)
        return settings
    except Exception as e:
        logger.error(f"Failed to get settings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to retrieve user settings"
        )


@router.put("/settings", response_model=settings_schema.UserSettingsResponse, status_code=200)
def update_user_settings(
    settings_update: settings_schema.UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's settings. Only provided fields will be updated.
    
    Features supported:
    - Work boundaries: Set work start/end times and daily hour limits
    - Break reminders: Configure frequency and types of break notifications
    - Overwork nudges: Enable/disable notifications for working too long
    - Wellness windows: Set intervals for wellness check-ins
    - Shutdown settings: Configure end-of-day shutdown reminders
    - Notification preferences: Control email and push notifications
    - Privacy settings: Manage data sharing and profile visibility
    - Productivity settings: Configure Pomodoro timer durations
    """
    try:
        # Validate settings
        if not usersettingsservice.validate_work_boundaries(settings_update):
            logger.error(f"Work boundaries validation failed for user {current_user.id}")
            raise HTTPException(
                status_code=400,
                detail="Work start time must be before work end time"
            )
        
        if not usersettingsservice.validate_pomodoro_settings(settings_update):
            logger.error(f"Pomodoro settings validation failed for user {current_user.id}")
            raise HTTPException(
                status_code=400,
                detail="Pomodoro break duration must be less than work duration"
            )
        
        # Update settings
        logger.info(f"Attempting to update settings for user {current_user.id}")
        updated_settings = usersettingsservice.update_user_settings(
            db, current_user.id, settings_update
        )
        
        if not updated_settings:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        logger.info(f"User {current_user.id} updated their settings")
        return updated_settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update settings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update user settings"
        )


@router.put("/settings/quick", response_model=settings_schema.UserSettingsResponse, status_code=200)
def quick_update_settings(
    settings_update: settings_schema.UserSettingsSimple,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick update for most commonly changed settings:
    - Enable/disable break reminders
    - Enable/disable overwork notifications
    - Enable/disable wellness checks
    - Set work hours
    - Set shutdown time
    """
    try:
        # Convert simple schema to full update schema, excluding None values
        logger.info(f"Quick update for user {current_user.id}: {settings_update}")
        update_data = settings_update.model_dump(exclude_unset=True, exclude_none=True)
        full_update = settings_schema.UserSettingsUpdate(**update_data)
        logger.info(f"Converted to full update: {full_update}")
        
        updated_settings = usersettingsservice.update_user_settings(
            db, current_user.id, full_update
        )
        
        if not updated_settings:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        return updated_settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to quick update settings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update settings"
        )


@router.post("/settings/reset", response_model=settings_schema.UserSettingsResponse, status_code=200)
def reset_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset user settings.
    This will restore all settings to their default values.
    """
    try:
        logger.info(f"Resetting settings for user {current_user.id}")
        reset_settings = usersettingsservice.reset_user_settings_to_default(
            db, current_user.id
        )
        
        logger.info(f"User {current_user.id} reset their settings to defaults")
        return reset_settings
        
    except Exception as e:
        logger.error(f"Failed to reset settings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to reset user settings"
        )


@router.get("/settings/summary", response_model=Dict[str, Any], status_code=200)
def get_settings_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a summary of key user settings for quick reference.
    Returns only the most important settings in a simplified format.
    """
    try:
        settings = usersettingsservice.get_or_create_user_settings(db, current_user.id)
        
        summary = {
            "work_hours": {
                "start": settings.work_start_time.strftime('%H:%M') if settings.work_start_time else None,
                "end": settings.work_end_time.strftime('%H:%M') if settings.work_end_time else None,
                "max_daily_hours": settings.max_daily_hours
            },
            "notifications": {
                "break_reminders": settings.break_reminders_enabled,
                "overwork_alerts": settings.overwork_notifications_enabled,
                "wellness_checks": settings.wellness_check_enabled,
                "email_notifications": settings.email_notifications_enabled
            },
            "wellness": {
                "break_reminder_interval": settings.break_reminder_interval,
                "max_continuous_work": settings.max_continuous_work,
                "shutdown_time": settings.daily_shutdown_time.strftime('%H:%M') if settings.daily_shutdown_time else None
            },
            "productivity": {
                "pomodoro_work": settings.pomodoro_work_duration,
                "pomodoro_break": settings.pomodoro_break_duration
            }
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Failed to get settings summary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve settings summary"
        )


@router.get("/profile", response_model=Dict[str, Any], status_code=200)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user profile information including basic details and settings summary.
    This combines user info with key settings for a complete profile view.
    """
    try:
        settings = usersettingsservice.get_or_create_user_settings(db, current_user.id)
        
        profile = {
            "user": {
                "id": str(current_user.id),
                "username": current_user.username,
                "email": current_user.email,
                "name": current_user.full_name,
                "phone_number": current_user.phone_number,
                "is_verified": current_user.is_verified,
                "created_at": current_user.created_at.isoformat() if current_user.created_at is not None else None,
                "onboarding_completed": current_user.onboarding_completed
            },
            "settings_summary": {
                "timezone": settings.timezone,
                "work_start": settings.work_start_time.strftime('%H:%M') if settings.work_start_time else None,
                "work_end": settings.work_end_time.strftime('%H:%M') if settings.work_end_time else None,
                "notifications_enabled": settings.email_notifications_enabled,
                "privacy": settings.profile_visibility
            }
        }
        
        return profile
        
    except Exception as e:
        logger.error(f"Failed to get profile for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve user profile"
        )


@router.post("/complete-onboarding", status_code=200)
def complete_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark user's onboarding as completed.
    This endpoint should be called when the user finishes the onboarding flow.
    """
    try:
        current_user.onboarding_completed = True
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Onboarding completed successfully",
            "onboarding_completed": True
        }
    except Exception as e:
        logger.error(f"Failed to complete onboarding for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update onboarding status: {str(e)}"
        )


@router.get("/onboarding-status", status_code=200)  
def get_onboarding_status(current_user: User = Depends(get_current_user)):
    """
    Get user's current onboarding completion status.
    Returns whether the user has completed the onboarding flow.
    """
    try:
        return {
            "onboarding_completed": bool(current_user.onboarding_completed)
        }
    except Exception as e:
        logger.error(f"Failed to get onboarding status for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve onboarding status"
        )
