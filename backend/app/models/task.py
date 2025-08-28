import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index('idx_task_user_id', 'user_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now(), nullable=False)
    reminder_enabled = Column(Boolean, default=False)
    reminder_time = Column(DateTime, nullable=True)

    time_logs = relationship(
        "TimeLog", back_populates="task", cascade="all, delete-orphan")


class TimeLog(Base):
    __tablename__ = "time_logs"
    __table_args__ = (
        Index('idx_timelog_user_id_task_id', 'user_id', 'task_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4, index=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey(
        "tasks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="time_logs")
