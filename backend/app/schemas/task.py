from pydantic import BaseModel, computed_field, field_validator
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[datetime] = None

    @field_validator("reminder_time")
    def ensure_future_reminder(cls, v):
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Reminder time must be in the future")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[datetime] = None

    @field_validator("reminder_time")
    def ensure_future_reminder(cls, v):
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Reminder time must be in the future")
        return v


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reminder_enabled: bool
    reminder_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class TimeLogResponse(BaseModel):
    id: UUID
    start_time: datetime
    end_time: Optional[datetime] = None

    @computed_field
    def duration(self) -> Optional[float]:
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() / 3600
        return None

    class Config:
        from_attributes = True
