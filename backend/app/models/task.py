import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func, Boolean, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index('idx_task_user_id', 'user_id'),
        Index('idx_task_completed', 'completed'),
        Index('idx_task_priority', 'priority'),
        Index('idx_task_due_date', 'due_date'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    reminder_enabled = Column(Boolean, default=False)
    reminder_time = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)  # When user plans to start the task
    due_date = Column(DateTime, nullable=True)    # When the task is due
    completed = Column(Boolean, default=False, nullable=False)  # Task completion status
    priority = Column(String(20), default='medium', nullable=False)  # 'low', 'medium', 'high'
    tags = Column(JSON, nullable=True)            # Array of task tags for categorization
    