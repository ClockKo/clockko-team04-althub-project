from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

import uuid

class Timelog(Base):
    __tablename__ = 'time_sessions'

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    type = Column(String)
    date = Column(DateTime)
    planned_duration = Column(Integer)
    status = Column(String)
    paused_at = Column(DateTime, nullable=True)
    remaining_time = Column(Integer, nullable=True)
    
    



