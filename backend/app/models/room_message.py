import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Text, DateTime, func, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class RoomMessageType(str, enum.Enum):
    text = 'text'
    system = 'system'
    emoji = 'emoji'


# class RoomMessage(Base):
#     __tablename__ = 'room_messages'
#     __table_args__ = (
#         Index('idx_room_messages_room_id_created_at', 'room_id', 'created_at'),
#     )

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
#     room_id = Column(UUID(as_uuid=True), ForeignKey('coworking_rooms.id', ondelete='CASCADE'), nullable=False)
#     user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
#     message_text = Column(Text, nullable=False)
#     message_type = Column(Enum(RoomMessageType), nullable=False, default=RoomMessageType.text)
#     created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

#     # Relationships
#     room = relationship('CoworkingRoom', back_populates='messages')
#     user = relationship('User', back_populates='coworking_messages')

    def __repr__(self):
        return f'<RoomMessage(id={self.id}, room_id={self.room_id}, type={self.message_type})>'
