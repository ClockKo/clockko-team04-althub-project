from sqlalchemy.orm import Session
from app.models.user_settings import UserSettings
from app.models.user import User
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate
from typing import Optional
import uuid
import logging

logger = logging.getLogger(__name__)


def get_user_settings(db: Session, user_id: uuid.UUID) -> Optional[UserSettings]:
    """Get user settings by user ID"""
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def create_default_user_settings(db: Session, user_id: uuid.UUID) -> UserSettings:
    """Create default user settings for a new user"""
    try:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
        logger.info(f"Created default settings for user {user_id}")
        return settings
    except Exception as e:
        logger.error(f"Failed to create default settings for user {user_id}: {e}")
        db.rollback()
        raise


def get_or_create_user_settings(db: Session, user_id: uuid.UUID) -> UserSettings:
    """Get user settings or create default ones if they don't exist"""
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_default_user_settings(db, user_id)
    return settings


def update_user_settings(
    db: Session, 
    user_id: uuid.UUID, 
    settings_update: UserSettingsUpdate
) -> Optional[UserSettings]:
    """Update user settings"""
    try:
        # Get existing settings or create default ones
        settings = get_or_create_user_settings(db, user_id)
        
        # Update only the fields that are provided (not None)
        update_data = settings_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(settings, field):
                setattr(settings, field, value)
        
        db.commit()
        db.refresh(settings)
        logger.info(f"Updated settings for user {user_id}")
        return settings
        
    except Exception as e:
        logger.error(f"Failed to update settings for user {user_id}: {e}")
        db.rollback()
        raise


def reset_user_settings_to_default(db: Session, user_id: uuid.UUID) -> UserSettings:
    """Reset user settings to default values"""
    try:
        # Delete existing settings
        existing_settings = get_user_settings(db, user_id)
        if existing_settings:
            db.delete(existing_settings)
            db.commit()
        
        # Create new default settings
        return create_default_user_settings(db, user_id)
        
    except Exception as e:
        logger.error(f"Failed to reset settings for user {user_id}: {e}")
        db.rollback()
        raise


def delete_user_settings(db: Session, user_id: uuid.UUID) -> bool:
    """Delete user settings"""
    try:
        settings = get_user_settings(db, user_id)
        if settings:
            db.delete(settings)
            db.commit()
            logger.info(f"Deleted settings for user {user_id}")
            return True
        return False
        
    except Exception as e:
        logger.error(f"Failed to delete settings for user {user_id}: {e}")
        db.rollback()
        raise


def validate_work_boundaries(settings_update: UserSettingsUpdate) -> bool:
    """Validate work boundary settings"""
    if (settings_update.work_start_time and settings_update.work_end_time and 
        settings_update.work_start_time >= settings_update.work_end_time):
        return False
    return True


def validate_pomodoro_settings(settings_update: UserSettingsUpdate) -> bool:
    """Validate pomodoro timer settings"""
    # Ensure break duration is less than work duration
    if (settings_update.pomodoro_work_duration and settings_update.pomodoro_break_duration and
        settings_update.pomodoro_break_duration >= settings_update.pomodoro_work_duration):
        return False
    return True
