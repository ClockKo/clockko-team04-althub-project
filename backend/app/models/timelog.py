from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

import uuid


class Timelog(Base):
    __tablename__ = 'time_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    type = Column(String)
    date = Column(DateTime)




