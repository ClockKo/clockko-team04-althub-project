from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ShutdownReflectionCreate(BaseModel):
    productivity_rating: str = Field(..., description="Productivity rating: great, good, okay, tough")
    reflection_note: Optional[str] = Field(None, description="Optional reflection note")
    mindful_disconnect_completed: Optional[List[bool]] = Field(None, description="Array of booleans for disconnect checklist")
    shutdown_date: datetime = Field(..., description="The date this reflection is for")


class ShutdownReflectionResponse(BaseModel):
    id: str
    user_id: str
    productivity_rating: str
    reflection_note: Optional[str]
    mindful_disconnect_completed: Optional[List[bool]]
    created_at: datetime
    shutdown_date: datetime
    
    model_config = {"from_attributes": True}


class TaskSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_percentage: float


class ShutdownSummaryResponse(BaseModel):
    tasks_summary: TaskSummary
    focus_time_minutes: int
    shutdown_streak: int
    points_earned: int
    last_reflection: Optional[ShutdownReflectionResponse]
    
    model_config = {"from_attributes": True}
