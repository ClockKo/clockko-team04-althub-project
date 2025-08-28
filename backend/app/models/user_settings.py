import uuid
from datetime import datetime, time
from sqlalchemy import Column, String, Boolean, DateTime, Time, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID


class UserSettings(Base):
    """User settings model for wellness windows, work boundaries, and notifications"""
    __tablename__ = "user_settings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Work Boundaries
    work_start_time = Column(Time, nullable=True, default=time(9, 0))  # Default 9:00 AM
    work_end_time = Column(Time, nullable=True, default=time(17, 0))   # Default 5:00 PM
    max_daily_hours = Column(Integer, nullable=True, default=8)        # Max work hours per day
    
    # Wellness Windows
    wellness_check_interval = Column(Integer, nullable=True, default=60)  # Minutes between wellness checks
    break_reminder_interval = Column(Integer, nullable=True, default=30)  # Minutes between break reminders
    max_continuous_work = Column(Integer, nullable=True, default=120)     # Max minutes of continuous work
    
    # Notification Preferences
    break_reminders_enabled = Column(Boolean, default=True)
    overwork_notifications_enabled = Column(Boolean, default=True)
    wellness_check_enabled = Column(Boolean, default=True)
    email_notifications_enabled = Column(Boolean, default=True)
    push_notifications_enabled = Column(Boolean, default=True)
    
    # Shutdown Settings
    daily_shutdown_time = Column(Time, nullable=True, default=time(18, 0))  # Default 6:00 PM
    shutdown_reminders_enabled = Column(Boolean, default=True)
    shutdown_reflection_required = Column(Boolean, default=False)
    
    # Time Zone and Locale
    timezone = Column(String, nullable=True, default="UTC")
    date_format = Column(String, nullable=True, default="YYYY-MM-DD")
    time_format = Column(String, nullable=True, default="HH:mm")
    
    # Privacy Settings
    profile_visibility = Column(String, nullable=True, default="public")  # public, private, friends
    share_work_stats = Column(Boolean, default=True)
    share_wellness_data = Column(Boolean, default=False)
    
    # Productivity Settings
    pomodoro_work_duration = Column(Integer, nullable=True, default=25)   # Minutes
    pomodoro_break_duration = Column(Integer, nullable=True, default=5)   # Minutes
    pomodoro_long_break_duration = Column(Integer, nullable=True, default=15)  # Minutes
    
    # Custom Notes
    wellness_goals = Column(Text, nullable=True)
    work_preferences = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="settings")


# Add the relationship to the User model
# Note: This should be added to the existing User model
# user = relationship("UserSettings", back_populates="user", uselist=False)
