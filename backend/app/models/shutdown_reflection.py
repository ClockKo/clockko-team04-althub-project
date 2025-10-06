import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class ShutdownReflection(Base):
    """Model for storing daily shutdown reflections and productivity ratings"""
    __tablename__ = "shutdown_reflections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Productivity rating: 'great', 'good', 'okay', 'tough'
    productivity_rating = Column(String(20), nullable=False)
    
    # Optional reflection note
    reflection_note = Column(Text, nullable=True)
    
    # Array of booleans for mindful disconnect checklist
    # Example: [true, false, true] for completed disconnect activities
    mindful_disconnect_completed = Column(JSON, nullable=True)
    
    # When the reflection was created
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # The date this shutdown reflection is for (can be different from created_at)
    shutdown_date = Column(DateTime, nullable=False, index=True)
    
    # Relationship to user
    user = relationship("User", foreign_keys=[user_id])
