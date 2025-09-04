from pydantic import BaseModel, computed_field, field_validator
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List
import re


class TagCreate(BaseModel):
    name: str
    color: str

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Tag name cannot be empty")
        if len(v) > 50:
            raise ValueError("Tag name cannot exceed 50 characters")
        if "\x00" in v:
            raise ValueError("Tag name cannot contain null bytes")
        return v.strip()

    @field_validator("color")
    def validate_color(cls, v):
        if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("Color must be a valid hex code (e.g., #FF0000)")
        return v


class TagResponse(BaseModel):
    id: UUID
    name: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[datetime] = None
    tags: Optional[List[TagCreate]] = None

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
    tags: Optional[List[TagCreate]] = None

    @field_validator("reminder_time")
    def ensure_future_reminder(cls, v):
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Reminder time must be in the future")
        # Ensure UTC timezone
        if v and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reminder_enabled: bool
    reminder_time: Optional[datetime] = None
    tags: List[TagResponse]

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
