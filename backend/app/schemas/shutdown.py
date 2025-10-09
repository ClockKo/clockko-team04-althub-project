from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum


class ProductivityRating(str, Enum):
    GREAT = "great"
    GOOD = "good"
    OKAY = "okay"
    TOUGH = "tough"


class ShutdownReflectionCreate(BaseModel):
    productivity_rating: ProductivityRating = Field(..., description="Productivity rating: great, good, okay, tough")
    reflection_note: Optional[str] = Field(None, description="Optional reflection note")
    mindful_disconnect_completed: Optional[List[bool]] = Field(None, description="Array of booleans for disconnect checklist")
    shutdown_date: datetime = Field(..., description="The date this reflection is for")

    model_config = {
        "json_schema_extra": {
            "example": {
                "productivity_rating": "great",
                "reflection_note": "Had a very productive day. Completed all major tasks.",
                "mindful_disconnect_completed": [True, True, False],
                "shutdown_date": "2025-10-05T18:00:00Z"
            }
        }
    }


class ShutdownReflectionResponse(BaseModel):
    id: UUID
    user_id: UUID
    productivity_rating: ProductivityRating
    reflection_note: Optional[str]
    mindful_disconnect_completed: Optional[List[bool]]
    created_at: datetime
    shutdown_date: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440001",
                "productivity_rating": "great",
                "reflection_note": "Had a very productive day",
                "mindful_disconnect_completed": [True, True, False],
                "created_at": "2025-10-05T18:00:00Z",
                "shutdown_date": "2025-10-05T18:00:00Z"
            }
        }
    }


class TaskSummary(BaseModel):
    name: str = Field(..., description="Task name")
    completed: bool = Field(..., description="Whether task is completed")


class ShutdownSummaryResponse(BaseModel):
    tasksCompleted: int = Field(..., description="Number of tasks completed today")
    tasksTotal: int = Field(..., description="Total number of tasks for today")
    pendingTasks: int = Field(..., description="Number of pending tasks")
    todayTasks: List[TaskSummary] = Field(default_factory=list, description="List of today's tasks")
    focusTime: int = Field(..., description="Total focus time in minutes")
    focusGoal: int = Field(default=480, description="Focus goal in minutes")
    shutdownStreak: int = Field(..., description="Current shutdown streak")
    pointsEarned: int = Field(..., description="Points earned today")
    clockedOutTime: str = Field(..., description="Time when user clocked out")

    model_config = {
        "json_schema_extra": {
            "example": {
                "tasksCompleted": 3,
                "tasksTotal": 5,
                "pendingTasks": 2,
                "todayTasks": [
                    {"name": "Review PR", "completed": True},
                    {"name": "Write documentation", "completed": False}
                ],
                "focusTime": 420,
                "focusGoal": 480,
                "shutdownStreak": 5,
                "pointsEarned": 45,
                "clockedOutTime": "18:30"
            }
        }
    }
