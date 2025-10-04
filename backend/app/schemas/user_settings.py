"""Pydantic schemas for UserSettings."""
from typing import Optional
from datetime import time
from pydantic import BaseModel, Field, ConfigDict
import uuid


class UserSettingsBase(BaseModel):
    """Base schema for UserSettings with common fields."""
    
    # Work Schedule Settings
    work_start_time: Optional[time] = Field(None, description="User's preferred work start time")
    work_end_time: Optional[time] = Field(None, description="User's preferred work end time")
    max_daily_hours: Optional[int] = Field(None, ge=1, le=24, description="Maximum daily work hours")
    
    # Wellness Settings
    wellness_check_interval: Optional[int] = Field(None, ge=5, description="Wellness check interval in minutes")
    break_reminder_interval: Optional[int] = Field(None, ge=5, description="Break reminder interval in minutes")
    max_continuous_work: Optional[int] = Field(None, ge=15, description="Maximum continuous work time in minutes")
    
    # Notification Preferences
    break_reminders_enabled: bool = Field(True, description="Enable break reminders")
    overwork_notifications_enabled: bool = Field(True, description="Enable overwork notifications")
    wellness_check_enabled: bool = Field(True, description="Enable wellness checks")
    email_notifications_enabled: bool = Field(True, description="Enable email notifications")
    push_notifications_enabled: bool = Field(True, description="Enable push notifications")
    
    # Shutdown Settings
    daily_shutdown_time: Optional[time] = Field(None, description="Daily shutdown time")
    shutdown_reminders_enabled: bool = Field(False, description="Enable shutdown reminders")
    shutdown_reflection_required: bool = Field(False, description="Require reflection before shutdown")
    
    # Localization Settings
    timezone: str = Field("UTC", description="User's timezone")
    date_format: str = Field("YYYY-MM-DD", description="Preferred date format")
    time_format: str = Field("24h", description="Preferred time format (12h or 24h)")
    
    # Privacy Settings
    profile_visibility: str = Field("public", description="Profile visibility: public, private, friends")
    share_work_stats: bool = Field(True, description="Share work statistics")
    share_wellness_data: bool = Field(False, description="Share wellness data")
    
    # Pomodoro Settings
    pomodoro_work_duration: int = Field(25, ge=1, le=120, description="Pomodoro work duration in minutes")
    pomodoro_break_duration: int = Field(5, ge=1, le=30, description="Pomodoro break duration in minutes")
    pomodoro_long_break_duration: int = Field(15, ge=5, le=60, description="Pomodoro long break duration in minutes")
    
    # JSON fields for complex data
    wellness_goals: Optional[str] = Field(None, description="Wellness goals as JSON string")
    work_preferences: Optional[str] = Field(None, description="Work preferences as JSON string")


class UserSettingsCreate(UserSettingsBase):
    """Schema for creating user settings."""
    pass


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings (all fields optional)."""
    
    # Work Schedule Settings
    work_start_time: Optional[time] = None
    work_end_time: Optional[time] = None
    max_daily_hours: Optional[int] = Field(None, ge=1, le=24)
    
    # Wellness Settings
    wellness_check_interval: Optional[int] = Field(None, ge=5)
    break_reminder_interval: Optional[int] = Field(None, ge=5)
    max_continuous_work: Optional[int] = Field(None, ge=15)
    
    # Notification Preferences
    break_reminders_enabled: Optional[bool] = None
    overwork_notifications_enabled: Optional[bool] = None
    wellness_check_enabled: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None
    push_notifications_enabled: Optional[bool] = None
    
    # Shutdown Settings
    daily_shutdown_time: Optional[time] = None
    shutdown_reminders_enabled: Optional[bool] = None
    shutdown_reflection_required: Optional[bool] = None
    
    # Localization Settings
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    
    # Privacy Settings
    profile_visibility: Optional[str] = None
    share_work_stats: Optional[bool] = None
    share_wellness_data: Optional[bool] = None
    
    # Pomodoro Settings
    pomodoro_work_duration: Optional[int] = Field(None, ge=1, le=120)
    pomodoro_break_duration: Optional[int] = Field(None, ge=1, le=30)
    pomodoro_long_break_duration: Optional[int] = Field(None, ge=5, le=60)
    
    # JSON fields
    wellness_goals: Optional[str] = None
    work_preferences: Optional[str] = None


class UserSettingsResponse(UserSettingsBase):
    """Schema for user settings response."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    created_at: str
    updated_at: str
    
    @classmethod
    def model_validate(cls, obj):
        """Convert UUIDs to strings for the response."""
        if hasattr(obj, 'id') and isinstance(obj.id, uuid.UUID):
            obj.id = str(obj.id)
        if hasattr(obj, 'user_id') and isinstance(obj.user_id, uuid.UUID):
            obj.user_id = str(obj.user_id)
        return super().model_validate(obj)


# Alias for backward compatibility
UserSettingsSimple = UserSettingsUpdate

