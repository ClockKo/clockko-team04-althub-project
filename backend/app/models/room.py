import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, func, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class RoomStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class CoworkingRoom(Base):
    __tablename__ = "coworking_rooms"
    __table_args__ = (
        Index('idx_coworking_rooms_status', 'status'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(RoomStatus), nullable=False, default=RoomStatus.active)
    max_participants = Column(Integer, default=10, nullable=False)
    color = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")
    messages = relationship("RoomMessage", back_populates="room", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CoworkingRoom(id={self.id}, name='{self.name}', status='{self.status}')>"
