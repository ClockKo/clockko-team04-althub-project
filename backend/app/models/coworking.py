import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func, Boolean, Integer, Index, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class RoomStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class RoomMessageType(str, enum.Enum):
    text = "text"
    system = "system"
    emoji = "emoji"

# Coworking room model is defined in app/models/room.py
# This is to avoid duplicate table definitions

# class CoworkingRoom(Base):
#     __tablename__ = "coworking_rooms"
#     __table_args__ = (
#         Index('idx_coworking_room_status', 'status'),
#     )

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
#     name = Column(String(255), nullable=False)
#     description = Column(Text, nullable=True)
#     status = Column(Enum(RoomStatus), default=RoomStatus.ACTIVE, nullable=False)
#     max_participants = Column(Integer, default=10)
#     current_participants = Column(Integer, default=0)
#     created_at = Column(DateTime, server_default=func.now(), nullable=False)
#     updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

#     participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")
#     messages = relationship("RoomMessage", back_populates="room", cascade="all, delete-orphan")


class RoomParticipant(Base):
    __tablename__ = "room_participants"
    __table_args__ = (
        Index('idx_room_participant_room_id', 'room_id'),
        Index('idx_room_participant_user_id', 'user_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    room_id = Column(UUID(as_uuid=True), ForeignKey("coworking_rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime, server_default=func.now(), nullable=False)
    is_muted = Column(Boolean, default=True)
    is_speaking = Column(Boolean, default=False)
    left_at = Column(DateTime, nullable=True)

    room = relationship("CoworkingRoom", back_populates="participants")
    user = relationship("User")


class RoomMessage(Base):
    __tablename__ = "room_messages"
    __table_args__ = (
        Index('idx_room_message_room_id', 'room_id'),
        Index('idx_room_message_user_id', 'user_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    room_id = Column(UUID(as_uuid=True), ForeignKey("coworking_rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message_text = Column(Text, nullable=False)
    message_type = Column(Enum(RoomMessageType), default=RoomMessageType.text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    room = relationship("CoworkingRoom", back_populates="messages")
    user = relationship("User")