"""API endpoints for user settings management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
import uuid

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.user_settings import (
    UserSettingsCreate,
    UserSettingsUpdate,
    UserSettingsResponse
)
from app.services import usersettingsservice


router = APIRouter(prefix="/api/users", tags=["User Settings"])


@router.get("/me/settings", response_model=UserSettingsResponse)
def get_current_user_settings(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Get current user's settings.
    
    Returns settings if they exist, or creates default settings if they don't.
    """
    settings = usersettingsservice.get_or_create_user_settings(db, current_user.id)
    return UserSettingsResponse.model_validate(settings)


@router.post("/me/settings", response_model=UserSettingsResponse, status_code=status.HTTP_201_CREATED)
def create_current_user_settings(
    settings_data: UserSettingsCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Create settings for current user with custom values.
    
    This endpoint is useful if you want to create settings with non-default values.
    If settings already exist, use PUT /api/users/me/settings instead.
    """
    settings = usersettingsservice.create_user_settings(db, current_user.id, settings_data)
    return UserSettingsResponse.model_validate(settings)


@router.put("/me/settings", response_model=UserSettingsResponse)
def update_current_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Update current user's settings.
    
    Only provided fields will be updated. Other fields remain unchanged.
    If settings don't exist, they will be created with default values first.
    """
    # Get or create settings first
    existing_settings = usersettingsservice.get_user_settings(db, current_user.id)
    if not existing_settings:
        # Create default settings first, then update
        usersettingsservice.create_user_settings(db, current_user.id)
    
    # Now update with provided data
    settings = usersettingsservice.update_user_settings(db, current_user.id, settings_data)
    return UserSettingsResponse.model_validate(settings)


@router.patch("/me/settings", response_model=UserSettingsResponse)
def patch_current_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Partially update current user's settings (alias for PUT).
    
    Only provided fields will be updated. Other fields remain unchanged.
    """
    # Get or create settings first
    existing_settings = usersettingsservice.get_user_settings(db, current_user.id)
    if not existing_settings:
        # Create default settings first, then update
        usersettingsservice.create_user_settings(db, current_user.id)
    
    settings = usersettingsservice.update_user_settings(db, current_user.id, settings_data)
    return UserSettingsResponse.model_validate(settings)


@router.delete("/me/settings", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_settings(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Delete current user's settings.
    
    This will reset settings to defaults on next access.
    """
    deleted = usersettingsservice.delete_user_settings(db, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User settings not found"
        )
    return None


# Admin endpoints (optional - for managing other users' settings)
@router.get("/{user_id}/settings", response_model=UserSettingsResponse, tags=["Admin"])
def get_user_settings_by_id(
    user_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Get settings for a specific user (admin endpoint).
    
    Note: Add admin role check in production.
    """
    settings = usersettingsservice.get_user_settings(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User settings not found"
        )
    return UserSettingsResponse.model_validate(settings)
