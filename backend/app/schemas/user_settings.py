from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, Union
from datetime import time, datetime
import uuid


class UserSettingsBase(BaseModel):
    """Base user settings schema"""
    # Work Boundaries
    work_start_time: Optional[time] = Field(default=time(9, 0), description="Work start time")
    work_end_time: Optional[time] = Field(default=time(17, 0), description="Work end time")
    max_daily_hours: Optional[int] = Field(default=8, ge=1, le=16, description="Maximum daily work hours")
    
    # Wellness Windows
    wellness_check_interval: Optional[int] = Field(default=60, ge=15, le=240, description="Wellness check interval in minutes")
    break_reminder_interval: Optional[int] = Field(default=30, ge=10, le=120, description="Break reminder interval in minutes")
    max_continuous_work: Optional[int] = Field(default=120, ge=30, le=300, description="Maximum continuous work in minutes")
    
    # Notification Preferences
    break_reminders_enabled: bool = Field(default=True, description="Enable break reminders")
    overwork_notifications_enabled: bool = Field(default=True, description="Enable overwork notifications")
    wellness_check_enabled: bool = Field(default=True, description="Enable wellness checks")
    email_notifications_enabled: bool = Field(default=True, description="Enable email notifications")
    push_notifications_enabled: bool = Field(default=True, description="Enable push notifications")
    
    # Shutdown Settings
    daily_shutdown_time: Optional[time] = Field(default=time(18, 0), description="Daily shutdown time")
    shutdown_reminders_enabled: bool = Field(default=True, description="Enable shutdown reminders")
    shutdown_reflection_required: bool = Field(default=False, description="Require shutdown reflection")
    
    # Time Zone and Locale
    timezone: Optional[str] = Field(default="UTC", description="User timezone")
    date_format: Optional[str] = Field(default="YYYY-MM-DD", description="Preferred date format")
    time_format: Optional[str] = Field(default="HH:mm", description="Preferred time format")
    
    # Privacy Settings
    profile_visibility: Optional[str] = Field(default="public", description="Profile visibility (public, private, friends)")
    share_work_stats: bool = Field(default=True, description="Share work statistics")
    share_wellness_data: bool = Field(default=False, description="Share wellness data")
    
    # Productivity Settings
    pomodoro_work_duration: Optional[int] = Field(default=25, ge=15, le=60, description="Pomodoro work duration in minutes")
    pomodoro_break_duration: Optional[int] = Field(default=5, ge=3, le=15, description="Pomodoro break duration in minutes")
    pomodoro_long_break_duration: Optional[int] = Field(default=15, ge=10, le=30, description="Pomodoro long break duration in minutes")
    
    # Custom Notes
    wellness_goals: Optional[str] = Field(default=None, description="Personal wellness goals")
    work_preferences: Optional[str] = Field(default=None, description="Work preferences and notes")

    @field_validator('work_start_time', 'work_end_time', 'daily_shutdown_time', mode='before')
    @classmethod
    def parse_time(cls, v):
        """Parse time from various formats including ISO datetime strings"""
        if v is None:
            return v
        if isinstance(v, time):
            return v
        if isinstance(v, str):
            # Handle ISO datetime format like "09:24:16.180Z"
            if 'T' in v or 'Z' in v or '+' in v:
                try:
                    # Parse as datetime and extract time part
                    dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                    return dt.time()
                except ValueError:
                    pass
            # Handle simple time format like "09:24" or "09:24:16"
            try:
                # Try parsing as time string
                if ':' in v:
                    parts = v.split(':')
                    hour = int(parts[0])
                    minute = int(parts[1]) if len(parts) > 1 else 0
                    second = int(float(parts[2])) if len(parts) > 2 else 0
                    return time(hour, minute, second)
            except (ValueError, IndexError):
                pass
        raise ValueError(f'Invalid time format: {v}. Expected HH:MM or ISO datetime format')


class UserSettingsCreate(UserSettingsBase):
    """Schema for creating user settings"""
    pass


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings (all fields optional)"""
    # Work Boundaries
    work_start_time: Optional[time] = None
    work_end_time: Optional[time] = None
    max_daily_hours: Optional[int] = Field(default=None, ge=1, le=16)
    
    # Wellness Windows
    wellness_check_interval: Optional[int] = Field(default=None, ge=15, le=240)
    break_reminder_interval: Optional[int] = Field(default=None, ge=10, le=120)
    max_continuous_work: Optional[int] = Field(default=None, ge=30, le=300)
    
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
    
    # Time Zone and Locale
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    
    # Privacy Settings
    profile_visibility: Optional[str] = None
    share_work_stats: Optional[bool] = None
    share_wellness_data: Optional[bool] = None
    
    # Productivity Settings
    pomodoro_work_duration: Optional[int] = Field(default=None, ge=15, le=60)
    pomodoro_break_duration: Optional[int] = Field(default=None, ge=3, le=15)
    pomodoro_long_break_duration: Optional[int] = Field(default=None, ge=10, le=30)
    
    # Custom Notes
    wellness_goals: Optional[str] = None
    work_preferences: Optional[str] = None

    @field_validator('work_start_time', 'work_end_time', 'daily_shutdown_time', mode='before')
    @classmethod
    def parse_time(cls, v):
        """Parse time from various formats including ISO datetime strings"""
        if v is None:
            return v
        if isinstance(v, time):
            return v
        if isinstance(v, str):
            # Handle ISO datetime format like "09:24:16.180Z"
            if 'T' in v or 'Z' in v or '+' in v or '-' in v[-6:]:
                try:
                    # Replace Z with +00:00 for proper ISO parsing
                    iso_str = v.replace('Z', '+00:00')
                    # If it looks like just time with Z, prepend today's date
                    if ':' in iso_str and 'T' not in iso_str:
                        iso_str = f"1900-01-01T{iso_str}"
                    # Parse as datetime and extract time part
                    dt = datetime.fromisoformat(iso_str)
                    return dt.time()
                except ValueError:
                    pass
            # Handle simple time format like "09:24" or "09:24:16"
            try:
                # Try parsing as time string
                if ':' in v:
                    parts = v.split(':')
                    hour = int(parts[0])
                    minute = int(parts[1]) if len(parts) > 1 else 0
                    # Handle seconds and microseconds
                    second = 0
                    microsecond = 0
                    if len(parts) > 2:
                        sec_parts = parts[2].split('.')
                        second = int(sec_parts[0])
                        if len(sec_parts) > 1:
                            # Convert fractional seconds to microseconds
                            frac = sec_parts[1].rstrip('Z')[:6]  # Remove Z and take up to 6 digits
                            frac = frac.ljust(6, '0')  # Pad with zeros
                            microsecond = int(frac)
                    return time(hour, minute, second, microsecond)
            except (ValueError, IndexError):
                pass
        raise ValueError(f'Invalid time format: {v}. Expected HH:MM, HH:MM:SS, or ISO datetime format')
    pomodoro_work_duration: Optional[int] = Field(default=None, ge=15, le=60)
    pomodoro_break_duration: Optional[int] = Field(default=None, ge=3, le=15)
    pomodoro_long_break_duration: Optional[int] = Field(default=None, ge=10, le=30)
    
    # Custom Notes
    wellness_goals: Optional[str] = None
    work_preferences: Optional[str] = None


class UserSettingsResponse(UserSettingsBase):
    """Schema for returning user settings"""
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            # Custom encoder for time objects
            time: lambda t: t.strftime('%H:%M') if t else None,
            # Custom encoder for datetime objects
            datetime: lambda dt: dt.isoformat() if dt else None
        }
    )

    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def convert_datetime_to_string(cls, v):
        """Convert datetime to ISO string format"""
        if v is None:
            return v
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class UserSettingsSimple(BaseModel):
    """Simplified user settings for quick updates"""
    # Most commonly updated settings
    break_reminders_enabled: Optional[bool] = None
    overwork_notifications_enabled: Optional[bool] = None
    wellness_check_enabled: Optional[bool] = None
    work_start_time: Optional[time] = None
    work_end_time: Optional[time] = None
    max_daily_hours: Optional[int] = Field(default=None, ge=1, le=16)
    daily_shutdown_time: Optional[time] = None

    @field_validator('work_start_time', 'work_end_time', 'daily_shutdown_time', mode='before')
    @classmethod
    def parse_time(cls, v):
        """Parse time from various formats including ISO datetime strings"""
        if v is None:
            return v
        if isinstance(v, time):
            return v
        if isinstance(v, str):
            # Handle ISO datetime format like "09:24:16.180Z"
            if 'T' in v or 'Z' in v or '+' in v:
                try:
                    # Parse as datetime and extract time part
                    dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                    return dt.time()
                except ValueError:
                    pass
            # Handle simple time format like "09:24" or "09:24:16"
            try:
                # Try parsing as time string
                if ':' in v:
                    parts = v.split(':')
                    hour = int(parts[0])
                    minute = int(parts[1]) if len(parts) > 1 else 0
                    second = int(float(parts[2])) if len(parts) > 2 else 0
                    return time(hour, minute, second)
            except (ValueError, IndexError):
                pass
        raise ValueError(f'Invalid time format: {v}. Expected HH:MM or ISO datetime format')
