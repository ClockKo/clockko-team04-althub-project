import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    ForeignKey,
    DateTime,
    func,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ChallengeType(str, enum.Enum):
    shutdown = "shutdown"
    focus = "focus"
    task = "task"
    break_ = "break"


class ChallengeStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    points = Column(Integer, nullable=False)
    challenge_type = Column(Enum(ChallengeType), nullable=False)
    target_value = Column(Integer, nullable=False)
    duration_days = Column(Integer, default=7)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    participants = relationship("ChallengeParticipant", back_populates="challenge")


class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"
    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", name="uq_user_challenge"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    progress = Column(Integer, default=0)
    status = Column(Enum(ChallengeStatus), default=ChallengeStatus.in_progress)
    points_earned = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="challenges")
    challenge = relationship("Challenge", back_populates="participants")


class UserChallengeStats(Base):
    __tablename__ = "user_challenge_stats"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    total_points = Column(Integer, default=0)
    challenges_completed = Column(Integer, default=0)
    weekly_points = Column(Integer, default=0)
    current_shutdown_streak = Column(Integer, default=0)
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="challenge_stats")
