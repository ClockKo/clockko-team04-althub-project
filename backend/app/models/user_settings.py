"""User settings model for managing user preferences and configurations."""
from sqlalchemy import Column, String, Integer, Boolean, Time, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime


class UserSettings(Base):
    """Model for user preferences and configuration settings."""
    
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Work Schedule Settings
    work_start_time = Column(Time, nullable=True)
    work_end_time = Column(Time, nullable=True)
    max_daily_hours = Column(Integer, nullable=True)
    
    # Wellness Settings
    wellness_check_interval = Column(Integer, nullable=True)  # in minutes
    break_reminder_interval = Column(Integer, nullable=True)  # in minutes
    max_continuous_work = Column(Integer, nullable=True)  # in minutes
    
    # Notification Preferences
    break_reminders_enabled = Column(Boolean, default=True)
    overwork_notifications_enabled = Column(Boolean, default=True)
    wellness_check_enabled = Column(Boolean, default=True)
    email_notifications_enabled = Column(Boolean, default=True)
    push_notifications_enabled = Column(Boolean, default=True)
    
    # Shutdown Settings
    daily_shutdown_time = Column(Time, nullable=True)
    shutdown_reminders_enabled = Column(Boolean, default=False)
    shutdown_reflection_required = Column(Boolean, default=False)
    
    # Localization Settings
    timezone = Column(String, default="UTC")
    date_format = Column(String, default="YYYY-MM-DD")
    time_format = Column(String, default="24h")
    
    # Privacy Settings
    profile_visibility = Column(String, default="public")  # public, private, friends
    share_work_stats = Column(Boolean, default=True)
    share_wellness_data = Column(Boolean, default=False)
    
    # Pomodoro Settings
    pomodoro_work_duration = Column(Integer, default=25)  # in minutes
    pomodoro_break_duration = Column(Integer, default=5)  # in minutes
    pomodoro_long_break_duration = Column(Integer, default=15)  # in minutes
    
    # JSON fields for complex data
    wellness_goals = Column(Text, nullable=True)  # JSON string
    work_preferences = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat(), onupdate=lambda: datetime.utcnow().isoformat())
    
    # Relationship to User
    user = relationship("User", back_populates="settings")

    def __repr__(self):
        return f"<UserSettings(user_id={self.user_id}, timezone={self.timezone})>"
