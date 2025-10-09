import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import GUID


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String, unique=True, nullable=False, index=True)
    
    # Device information
    device_name = Column(String, nullable=True)
    os_name = Column(String, nullable=True)
    browser_name = Column(String, nullable=True)
    browser_version = Column(String, nullable=True)
    device_type = Column(String, nullable=True)  # 'mobile', 'tablet', 'pc'
    
    # Location information
    ip_address = Column(String, nullable=True)
    location = Column(String, nullable=True)  # City, Country
    
    # Session metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Additional metadata
    user_agent = Column(Text, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, device={self.device_name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "session_id": self.session_id,
            "device_name": self.device_name,
            "os_name": self.os_name,
            "browser_name": self.browser_name,
            "browser_version": self.browser_version,
            "device_type": self.device_type,
            "ip_address": self.ip_address,
            "location": self.location,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_activity": self.last_activity.isoformat() if self.last_activity else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_active": self.is_active,
        }