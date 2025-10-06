"""Service layer for user settings operations."""
from sqlalchemy.orm import Session
from sqlalchemy import UUID
from app.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate
from typing import Optional
import uuid


def get_user_settings(db: Session, user_id: uuid.UUID) -> Optional[UserSettings]:
    """
    Get user settings by user ID.
    
    Args:
        db: Database session
        user_id: User UUID
        
    Returns:
        UserSettings object or None if not found
    """
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def create_user_settings(
    db: Session, 
    user_id: uuid.UUID, 
    settings: Optional[UserSettingsCreate] = None
) -> UserSettings:
    """
    Create user settings with default values or provided settings.
    
    Args:
        db: Database session
        user_id: User UUID
        settings: Optional settings data
        
    Returns:
        Created UserSettings object
    """
    # Check if settings already exist
    existing = get_user_settings(db, user_id)
    if existing:
        return existing
    
    # Create settings dict with defaults
    settings_data = {
        "user_id": user_id,
        # Notification Preferences (defaults)
        "break_reminders_enabled": True,
        "overwork_notifications_enabled": True,
        "wellness_check_enabled": True,
        "email_notifications_enabled": True,
        "push_notifications_enabled": True,
        # Shutdown Settings (defaults)
        "shutdown_reminders_enabled": False,
        "shutdown_reflection_required": False,
        # Localization Settings (defaults)
        "timezone": "UTC",
        "date_format": "YYYY-MM-DD",
        "time_format": "24h",
        # Privacy Settings (defaults)
        "profile_visibility": "public",
        "share_work_stats": True,
        "share_wellness_data": False,
        # Pomodoro Settings (defaults)
        "pomodoro_work_duration": 25,
        "pomodoro_break_duration": 5,
        "pomodoro_long_break_duration": 15,
    }
    
    # Override with provided settings if any
    if settings:
        settings_dict = settings.model_dump(exclude_unset=True)
        settings_data.update(settings_dict)
    
    db_settings = UserSettings(**settings_data)
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings


def update_user_settings(
    db: Session, 
    user_id: uuid.UUID, 
    settings_update: UserSettingsUpdate
) -> Optional[UserSettings]:
    """
    Update user settings.
    
    Args:
        db: Database session
        user_id: User UUID
        settings_update: Settings update data
        
    Returns:
        Updated UserSettings object or None if not found
    """
    db_settings = get_user_settings(db, user_id)
    if not db_settings:
        return None
    
    # Update only provided fields
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    # Update timestamp
    from datetime import datetime
    db_settings.updated_at = datetime.utcnow().isoformat()
    
    db.commit()
    db.refresh(db_settings)
    return db_settings


def delete_user_settings(db: Session, user_id: uuid.UUID) -> bool:
    """
    Delete user settings.
    
    Args:
        db: Database session
        user_id: User UUID
        
    Returns:
        True if deleted, False if not found
    """
    db_settings = get_user_settings(db, user_id)
    if not db_settings:
        return False
    
    db.delete(db_settings)
    db.commit()
    return True


def get_or_create_user_settings(db: Session, user_id: uuid.UUID) -> UserSettings:
    """
    Get existing user settings or create default ones if they don't exist.
    
    Args:
        db: Database session
        user_id: User UUID
        
    Returns:
        UserSettings object
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_user_settings(db, user_id)
    return settings
