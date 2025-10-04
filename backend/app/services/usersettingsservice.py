"""Service layer for UserSettings operations."""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.user_settings import UserSettings
from app.models.user import User
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate
from datetime import datetime
import uuid


def get_user_settings(db: Session, user_id: uuid.UUID) -> Optional[UserSettings]:
    """
    Get user settings by user_id.
    
    Args:
        db: Database session
        user_id: UUID of the user
        
    Returns:
        UserSettings object or None if not found
    """
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def create_default_user_settings(db: Session, user_id: uuid.UUID) -> UserSettings:
    """
    Create default settings for a new user.
    
    Args:
        db: Database session
        user_id: UUID of the user
        
    Returns:
        Created UserSettings object
        
    Raises:
        HTTPException: If settings already exist or user doesn't exist
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if settings already exist
    existing = get_user_settings(db, user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User settings already exist"
        )
    
    # Create default settings
    settings = UserSettings(
        id=uuid.uuid4(),
        user_id=user_id,
        # Default values are set in the model
    )
    
    try:
        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create user settings: {str(e)}"
        )


def create_user_settings(
    db: Session, 
    user_id: uuid.UUID, 
    settings_data: UserSettingsCreate
) -> UserSettings:
    """
    Create user settings with custom values.
    
    Args:
        db: Database session
        user_id: UUID of the user
        settings_data: UserSettingsCreate schema with values
        
    Returns:
        Created UserSettings object
        
    Raises:
        HTTPException: If settings already exist or validation fails
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if settings already exist
    existing = get_user_settings(db, user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User settings already exist. Use update endpoint instead."
        )
    
    # Create settings with provided data
    settings = UserSettings(
        id=uuid.uuid4(),
        user_id=user_id,
        **settings_data.model_dump(exclude_unset=True)
    )
    
    try:
        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create user settings: {str(e)}"
        )


def update_user_settings(
    db: Session, 
    user_id: uuid.UUID, 
    settings_data: UserSettingsUpdate
) -> UserSettings:
    """
    Update user settings.
    
    Args:
        db: Database session
        user_id: UUID of the user
        settings_data: UserSettingsUpdate schema with values
        
    Returns:
        Updated UserSettings object
        
    Raises:
        HTTPException: If settings don't exist
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User settings not found. Create them first."
        )
    
    # Update only provided fields
    update_data = settings_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    # Update timestamp
    settings.updated_at = datetime.utcnow().isoformat()
    
    try:
        db.commit()
        db.refresh(settings)
        return settings
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update user settings: {str(e)}"
        )


def get_or_create_user_settings(db: Session, user_id: uuid.UUID) -> UserSettings:
    """
    Get user settings or create default ones if they don't exist.
    
    Args:
        db: Database session
        user_id: UUID of the user
        
    Returns:
        UserSettings object
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_default_user_settings(db, user_id)
    return settings


def delete_user_settings(db: Session, user_id: uuid.UUID) -> bool:
    """
    Delete user settings.
    
    Args:
        db: Database session
        user_id: UUID of the user
        
    Returns:
        True if deleted, False if not found
    """
    settings = get_user_settings(db, user_id)
    if not settings:
        return False
    
    db.delete(settings)
    db.commit()
    return True
