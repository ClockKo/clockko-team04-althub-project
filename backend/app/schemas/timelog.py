from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional


class StartSessionRequest(BaseModel):
    user_id: UUID4
    start_time: Optional[datetime] = None


class EndSessionRequest(BaseModel):
    session_id: UUID4
    end_time: Optional[datetime] = None


class TimeLogResponse(BaseModel):
    session_id: UUID4
    user_id: UUID4
    start_time: datetime
    end_time: Optional[datetime]
    type: str
    date: datetime

    class Config:
        from_attributes = True
