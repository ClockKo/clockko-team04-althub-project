from pydantic import BaseModel, computed_field, field_validator
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List, Union, Dict, Any
from enum import Enum


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium" 
    high = "high"


class TagCreate(BaseModel):
    name: str
    color: str


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[datetime] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = False
    priority: Optional[PriorityEnum] = PriorityEnum.medium
    tags: Optional[List[Union[str, Dict[str, Any]]]] = None

    @field_validator("reminder_time")
    def ensure_future_reminder(cls, v):
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Reminder time must be in the future")
        return v
    
    @field_validator("due_date")
    def validate_due_date(cls, v, values):
        if v and hasattr(values, 'data') and 'start_date' in values.data:
            start_date = values.data.get('start_date')
            if start_date and v < start_date:
                raise ValueError("Due date cannot be before start date")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[datetime] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[Union[str, Dict[str, Any]]]] = None

    @field_validator("reminder_time")
    def ensure_future_reminder(cls, v):
        if v and v < datetime.now(timezone.utc):
            raise ValueError("Reminder time must be in the future")
        return v


class TagResponse(BaseModel):
    name: str
    color: str


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reminder_enabled: bool
    reminder_time: Optional[datetime] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed: bool
    priority: str
    tags: Optional[List[Union[str, TagResponse]]] = None

    @field_validator('tags', mode='before')
    @classmethod
    def validate_tags(cls, v):
        if v is None:
            return v
        if not isinstance(v, list):
            return v
        
        # Handle mixed formats - convert dict objects to TagResponse objects
        result = []
        for tag in v:
            if isinstance(tag, dict):
                if 'name' in tag and 'color' in tag:
                    result.append(TagResponse(name=tag['name'], color=tag['color']))
                else:
                    # If it's a dict but doesn't have name/color, convert to string
                    result.append(str(tag))
            else:
                # It's already a string or other format
                result.append(tag)
        return result

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
