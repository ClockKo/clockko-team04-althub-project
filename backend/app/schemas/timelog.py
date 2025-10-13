from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List, Literal


class StartSessionRequest(BaseModel):
    user_id: UUID4
    type: str
    start_time: Optional[datetime] = None
    planned_duration: Optional[int] = None

class EndSessionRequest(BaseModel):
    session_id: UUID4
    end_time: Optional[datetime] = None

class PauseSessionRequest(BaseModel):
    session_id: UUID4
    paused_at: datetime
    remaining_time: Optional[int] = None


class ResumeSessionRequest(BaseModel):
    session_id: UUID4
    resumed_at: Optional[datetime] = None
    # optional if frontend wants to provide remaining_time explicitly
    remaining_time: Optional[int] = None  # minutes

class FocusSessionRequest(BaseModel):
    user_id: UUID4
    duration_minutes: int
    type: str
    start_time: Optional[datetime]

class FocusSessionResponse(BaseModel):
    session_id: UUID4
    user_id: UUID4
    start_time: datetime
    end_time: Optional[datetime]
    planned_duration: int  # in minutes
    actual_duration: Optional[int]  # in minutes, if completed
    type: str
    status: str  # "active", "completed","paused", "stopped"
    paused_at: Optional[datetime] = None
    remaining_time: Optional[int] = None

    class Config:
        from_attributes = True


class TimeLogResponse(BaseModel):
    session_id: UUID4
    user_id: UUID4
    start_time: datetime
    end_time: Optional [datetime]
    type: str
    date: Optional[datetime]
    class Config:
        from_attributes = True

class FocusTimeResponse(BaseModel):
    total_focus_time: int
class DailySummaryResponse(BaseModel):
    date: datetime
    total_focus_sessions: int
    total_focus_time: int
    total_break_time: int
    focus_sessions:List[FocusSessionResponse] = []

class WeeklySummaryResponse(BaseModel):
    week_start: datetime
    week_end: datetime
    total_focus_sessions: int
    total_focus_time: int
    total_break_time: int
    daily_summaries: List[DailySummaryResponse] = [] 