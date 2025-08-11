from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional


class StartSessionRequest(BaseModel):
    id: UUID4
    start_time: Optional [datetime] = None


class EndSessionRequest(BaseModel):
    id: UUID4
    end_time: Optional [datetime] = None

class TimeLogResponse(BaseModel):
    id: UUID4
    start_time: datetime
    end_time: Optional [datetime]
    type: str
    date: datetime
    
    class Config:
        orm_mode = True