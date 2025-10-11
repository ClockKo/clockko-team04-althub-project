# import uuid
# from datetime import datetime
# from sqlalchemy import Column, ForeignKey, DateTime, Boolean, func, UniqueConstraint, Index
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from app.core.database import Base


# class RoomParticipant(Base):
#     __tablename__ = "room_participants"
#     __table_args__ = (
#         UniqueConstraint('room_id', 'user_id', name='uq_room_participant_user'),
#         Index('idx_room_participants_room_id', 'room_id'),
#         Index('idx_room_participants_user_id', 'user_id'),
#     )

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
#     room_id = Column(UUID(as_uuid=True), ForeignKey("coworking_rooms.id", ondelete="CASCADE"), nullable=False)
#     user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
#     joined_at = Column(DateTime, server_default=func.now(), nullable=False)
#     left_at = Column(DateTime, nullable=True)
#     is_muted = Column(Boolean, default=True, nullable=False)
#     is_speaking = Column(Boolean, default=False, nullable=False)

#     # Relationships
#     room = relationship("CoworkingRoom", back_populates="participants")
#     user = relationship("User", back_populates="coworking_participations")

#     @property
#     def is_active(self):
#         """Check if participant is currently in the room"""
#         return self.left_at is None

#     def __repr__(self):
#         return f"<RoomParticipant(id={self.id!s}, room_id={self.room_id!s}, user_id={self.user_id!s})>"
