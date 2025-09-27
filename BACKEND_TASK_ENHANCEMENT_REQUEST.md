# 📋 Backend Task Model Enhancement Request

## Challenge & Rewards Feature Overview

The frontend tasks feature is working great, but we need some additional fields in the Task model and API to support the full functionality. Here are the missing fields we need to implement.

## 🎯 Required Changes

### 1. Database Model Changes

**File:** `app/models/task.py`

Add these columns to the `Task` class:

```python
# Add these fields to the existing Task class:

start_date = Column(DateTime, nullable=True)    # When user plans to start the task
due_date = Column(DateTime, nullable=True)      # When the task is due
completed = Column(Boolean, default=False)      # Task completion status
priority = Column(String(20), default='medium') # 'low', 'medium', 'high'
tags = Column(JSON, nullable=True)              # Array of task tags for categorization
```

### 2. API Schema Updates

**File:** `app/schemas/task.py`

#### TaskCreate Schema

```python
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None      # NEW
    due_date: Optional[datetime] = None        # NEW
    priority: Optional[str] = 'medium'         # NEW
    tags: Optional[List[str]] = []             # NEW
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[datetime] = None

    @field_validator("priority")
    def validate_priority(cls, v):
        if v and v not in ['low', 'medium', 'high']:
            raise ValueError("Priority must be 'low', 'medium', or 'high'")
        return v
```

#### TaskUpdate Schema

```python
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None      # NEW
    due_date: Optional[datetime] = None        # NEW
    completed: Optional[bool] = None           # NEW
    priority: Optional[str] = None             # NEW
    tags: Optional[List[str]] = None           # NEW
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[datetime] = None

    @field_validator("priority")
    def validate_priority(cls, v):
        if v and v not in ['low', 'medium', 'high']:
            raise ValueError("Priority must be 'low', 'medium', or 'high'")
        return v
```

#### TaskResponse Schema

```python
class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None      # NEW
    due_date: Optional[datetime] = None        # NEW
    completed: bool                            # NEW
    priority: str                              # NEW
    tags: List[str]                            # NEW
    created_at: datetime
    updated_at: datetime
    reminder_enabled: bool
    reminder_time: Optional[datetime] = None

    class Config:
        from_attributes = True
```

### 3. Database Migration

Create and apply the migration:

```bash
# Create the migration
alembic revision --autogenerate -m "Add start_date, due_date, completed, priority to tasks"

# Apply the migration
alembic upgrade head
```

### 4. Service Layer Updates

**File:** `app/services/taskservice.py`

Update these functions to handle the new fields:

#### create_task function

```python
def create_task(session: Session, task: TaskCreate, user_id: UUID) -> Task:
    try:
        db_task = Task(
            title=task.title,
            description=task.description,
            user_id=user_id,
            start_date=task.start_date,        # NEW
            due_date=task.due_date,            # NEW
            priority=task.priority,            # NEW
            tags=task.tags,                    # NEW
            reminder_enabled=task.reminder_enabled,
            reminder_time=task.reminder_time
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        schedule_reminder(session, db_task)
        logger.info(f"Task created: {db_task.id}")
        return db_task
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Internal server error"
        )
```

#### update_task function

Update to handle the new fields in the existing update logic.

## 🔍 Why We Need These Fields

| Field        | Purpose                           | Frontend Usage                               |
| ------------ | --------------------------------- | -------------------------------------------- |
| `start_date` | When user plans to start the task | Task scheduling and calendar view            |
| `due_date`   | When the task is due              | Categorize as "Today", "Upcoming", "Overdue" |
| `completed`  | Task completion status            | Move to "Done" section, progress tracking    |
| `priority`   | Task importance level             | Visual indicators, sorting, filtering        |
| `tags`       | Task categorization and labeling  | Filtering, grouping, visual organization     |

## 📝 Expected API Behavior

### Creating a Task

**Request:**

```http
POST /api/tasks/
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task management feature",
  "start_date": "2025-09-27T09:00:00Z",
  "due_date": "2025-09-29T17:00:00Z",
  "priority": "high",
  "tags": ["urgent", "development", "feature"]
}
```

**Response:**

```json
{
  "id": "uuid-here",
  "title": "Complete project",
  "description": "Finish the task management feature",
  "start_date": "2025-09-27T09:00:00Z",
  "due_date": "2025-09-29T17:00:00Z",
  "completed": false,
  "priority": "high",
  "tags": ["urgent", "development", "feature"],
  "created_at": "2025-09-26T22:00:00Z",
  "updated_at": "2025-09-26T22:00:00Z",
  "reminder_enabled": false,
  "reminder_time": null
}
```

### Updating Task Completion

**Request:**

```http
PUT /api/tasks/{task_id}
Content-Type: application/json

{
  "completed": true
}
```

### Filtering Tasks by Status

Consider adding query parameters:

```http
GET /api/tasks/?completed=false&priority=high
GET /api/tasks/?due_date_range=today
GET /api/tasks/?tags=urgent,development
```

## ⚡ Current Status

- ✅ **Basic CRUD operations** - Working
- ✅ **Task creation and listing** - Working  
- ✅ **Authentication** - Working
- ❌ **Date-based categorization** - Needs due_date field
- ❌ **Task completion tracking** - Needs completed field
- ❌ **Priority management** - Needs priority field

## 🚀 Priority Level

**Medium Priority** - Current functionality works, but these fields will unlock:

- ✨ Proper task categorization (Today/Upcoming/Done)
- 📅 Due date management and overdue detection
- ✅ Task completion workflow
- 🎯 Priority-based sorting and filtering
- 🏷️ Tag-based organization and filtering

## ⏰ Timeline

**Question:** When can we expect these changes to be implemented?

The frontend is ready to handle these fields once they're available in the API! 🎉

## 📞 Contact

If you have any questions about these requirements or need clarification on the frontend implementation, please let us know!

---

## 🌙 Shutdown Feature Backend Requirements

## Overview

The frontend shutdown feature is implemented but needs backend API endpoints to store and retrieve shutdown data. This feature helps users wrap up their workday mindfully with reflection and progress tracking.

## 🎯 Required Changes

### 1. Database Model - Shutdown Reflections

**File:** `app/models/shutdown_reflection.py` (New file)

```python
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base

class ShutdownReflection(Base):
    __tablename__ = "shutdown_reflections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_id = Column(String, nullable=True)  # Link to work session if applicable
    
    # Reflection data
    productivity_rating = Column(String(10), nullable=False)  # 'great', 'good', 'okay', 'tough'
    reflection_note = Column(Text, nullable=True)
    mindful_disconnect_completed = Column(JSON, nullable=False, default=list)  # Array of booleans
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    shutdown_date = Column(DateTime, nullable=False)  # Date when user shut down
    
    # Relationships
    user = relationship("User", back_populates="shutdown_reflections")
```

### 2. API Schema Updates

**File:** `app/schemas/shutdown.py` (New file)

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ShutdownReflectionCreate(BaseModel):
    productivity_rating: str = Field(..., regex="^(great|good|okay|tough)$")
    reflection_note: Optional[str] = None
    mindful_disconnect_completed: List[bool] = Field(default_factory=list)
    session_id: Optional[str] = None

class ShutdownReflectionResponse(BaseModel):
    id: str
    productivity_rating: str
    reflection_note: Optional[str]
    mindful_disconnect_completed: List[bool]
    created_at: datetime
    shutdown_date: datetime
    
    class Config:
        from_attributes = True

class ShutdownSummary(BaseModel):
    # Task data
    tasksCompleted: int
    tasksTotal: int
    pendingTasks: int
    todayTasks: List[dict] = Field(default_factory=list)  # [{"name": str, "completed": bool}]
    
    # Focus data
    focusTime: int  # minutes
    focusGoal: int  # minutes
    
    # Progress data
    shutdownStreak: int  # consecutive days of proper shutdown
    pointsEarned: int   # points earned today
    clockedOutTime: Optional[str] = None  # time when user clocked out
```

### 3. API Endpoints

**File:** `app/api/shutdown.py` (Update existing empty file)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.shutdown import ShutdownReflectionCreate, ShutdownReflectionResponse, ShutdownSummary
from app.services import shutdown_service

router = APIRouter(prefix="/dashboard", tags=["shutdown"])

@router.get("/shutdown-summary", response_model=ShutdownSummary)
async def get_shutdown_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get shutdown summary data for the modal"""
    try:
        summary = await shutdown_service.get_shutdown_summary(db, current_user.id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch shutdown summary"
        )

@router.post("/shutdown-reflection", response_model=ShutdownReflectionResponse)
async def submit_shutdown_reflection(
    reflection: ShutdownReflectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit user's shutdown reflection"""
    try:
        result = await shutdown_service.create_shutdown_reflection(
            db, reflection, current_user.id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save shutdown reflection"
        )

@router.get("/shutdown-history", response_model=List[ShutdownReflectionResponse])
async def get_shutdown_history(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's shutdown reflection history"""
    try:
        history = await shutdown_service.get_shutdown_history(
            db, current_user.id, limit
        )
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch shutdown history"
        )
```

### 4. Service Layer

**File:** `app/services/shutdown_service.py` (New file)

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, date, timedelta
from typing import List, Optional

from app.models.shutdown_reflection import ShutdownReflection
from app.models.task import Task
from app.schemas.shutdown import ShutdownReflectionCreate, ShutdownSummary
from app.services import taskservice, dashboard_service

async def get_shutdown_summary(db: Session, user_id: str) -> ShutdownSummary:
    """Generate shutdown summary data"""
    
    # Get today's tasks
    today_tasks = taskservice.get_tasks(db, user_id)
    tasks_completed = sum(1 for task in today_tasks if task.completed)
    tasks_total = len(today_tasks)
    pending_tasks = tasks_total - tasks_completed
    
    # Format tasks for frontend
    today_tasks_formatted = [
        {"name": task.title, "completed": task.completed}
        for task in today_tasks[:10]  # Limit to 10 most recent
    ]
    
    # Get focus time from dashboard/session data
    focus_data = await dashboard_service.get_current_session_data(db, user_id)
    focus_time = focus_data.get("total_focus_time", 0)  # minutes
    focus_goal = focus_data.get("focus_goal", 480)  # default 8 hours
    
    # Calculate shutdown streak
    shutdown_streak = await calculate_shutdown_streak(db, user_id)
    
    # Calculate points earned today
    points_earned = calculate_daily_points(
        tasks_completed, focus_time, focus_goal, shutdown_streak
    )
    
    return ShutdownSummary(
        tasksCompleted=tasks_completed,
        tasksTotal=tasks_total,
        pendingTasks=pending_tasks,
        todayTasks=today_tasks_formatted,
        focusTime=focus_time,
        focusGoal=focus_goal,
        shutdownStreak=shutdown_streak,
        pointsEarned=points_earned,
        clockedOutTime=datetime.now().strftime("%H:%M")
    )

async def create_shutdown_reflection(
    db: Session, 
    reflection: ShutdownReflectionCreate, 
    user_id: str
) -> ShutdownReflection:
    """Save user's shutdown reflection"""
    
    db_reflection = ShutdownReflection(
        user_id=user_id,
        productivity_rating=reflection.productivity_rating,
        reflection_note=reflection.reflection_note,
        mindful_disconnect_completed=reflection.mindful_disconnect_completed,
        session_id=reflection.session_id,
        shutdown_date=datetime.now()
    )
    
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    
    return db_reflection

async def calculate_shutdown_streak(db: Session, user_id: str) -> int:
    """Calculate consecutive days of proper shutdown"""
    
    # Get recent shutdown reflections, ordered by date
    recent_reflections = db.query(ShutdownReflection)\
        .filter(ShutdownReflection.user_id == user_id)\
        .order_by(desc(ShutdownReflection.shutdown_date))\
        .limit(30)\
        .all()
    
    if not recent_reflections:
        return 0
    
    # Count consecutive days from most recent
    streak = 0
    current_date = date.today()
    
    for reflection in recent_reflections:
        reflection_date = reflection.shutdown_date.date()
        
        if reflection_date == current_date - timedelta(days=streak):
            streak += 1
        else:
            break
    
    return streak

def calculate_daily_points(
    tasks_completed: int, 
    focus_time: int, 
    focus_goal: int, 
    shutdown_streak: int
) -> int:
    """Calculate points earned for the day"""
    
    points = 0
    
    # Base points for completing a work session
    points += 10
    
    # Points for task completion
    points += tasks_completed * 5
    
    # Points for meeting focus goal
    if focus_time >= focus_goal:
        points += 15
    
    # Bonus points for shutdown streak
    if shutdown_streak > 0:
        points += min(shutdown_streak * 2, 20)  # Max 20 bonus points
    
    return points

async def get_shutdown_history(
    db: Session, 
    user_id: str, 
    limit: int = 30
) -> List[ShutdownReflection]:
    """Get user's shutdown reflection history"""
    
    return db.query(ShutdownReflection)\
        .filter(ShutdownReflection.user_id == user_id)\
        .order_by(desc(ShutdownReflection.created_at))\
        .limit(limit)\
        .all()
```

### 5. Database Migration

**Update User model** to include relationship:

```python
# In app/models/user.py, add:
shutdown_reflections = relationship("ShutdownReflection", back_populates="user")
```

**Create migration:**

```bash
# Create the migration
alembic revision --autogenerate -m "Add shutdown reflections table"

# Apply the migration
alembic upgrade head
```

### 6. Register Routes

**File:** `app/main.py` (Add shutdown router)

```python
from app.api import shutdown

app.include_router(shutdown.router, prefix="/api")
```

## 🔍 Expected API Behavior

### Getting Shutdown Summary

**Request:**

```http
GET /api/dashboard/shutdown-summary
Authorization: Bearer {token}
```

**Response:**

```json
{
  "tasksCompleted": 3,
  "tasksTotal": 5,
  "pendingTasks": 2,
  "todayTasks": [
    {"name": "Review PR", "completed": true},
    {"name": "Fix bugs", "completed": true},
    {"name": "Write tests", "completed": false}
  ],
  "focusTime": 420,
  "focusGoal": 480,
  "shutdownStreak": 5,
  "pointsEarned": 45,
  "clockedOutTime": "18:30"
}
```

### Submitting Shutdown Reflection

**Request:**

```http
POST /api/dashboard/shutdown-reflection
Content-Type: application/json
Authorization: Bearer {token}

{
  "productivity_rating": "good",
  "reflection_note": "Good progress today, finished most important tasks",
  "mindful_disconnect_completed": [true, true, false, true],
  "session_id": "optional-session-id"
}
```

**Response:**

```json
{
  "id": "uuid-here",
  "productivity_rating": "good",
  "reflection_note": "Good progress today, finished most important tasks",
  "mindful_disconnect_completed": [true, true, false, true],
  "created_at": "2025-09-26T18:30:00Z",
  "shutdown_date": "2025-09-26T18:30:00Z"
}
```

## 🎯 Integration Points

| Feature            | Backend Dependency    | Notes                                          |
| ------------------ | --------------------- | ---------------------------------------------- |
| Task Summary       | Tasks API             | Needs `completed` field from Task enhancements |
| Focus Time         | Dashboard/Session API | Current session focus tracking                 |
| Shutdown Streak    | Shutdown Reflections  | Count consecutive days                         |
| Points Calculation | Multiple APIs         | Tasks + Focus + Streak data                    |

## 📊 Current Status

- ✅ **Frontend shutdown modal** - Complete and working
- ✅ **User settings** - Shutdown preferences already in backend
- ❌ **Shutdown summary API** - Needs implementation
- ❌ **Reflection storage** - Needs database model and API
- ❌ **Points calculation** - Needs service logic
- ❌ **Shutdown streak tracking** - Needs implementation

---

## 🏆 Challenge & Rewards Feature Backend Requirements

## Overview

The frontend challenge system is fully implemented with stats tracking, leaderboards, and challenge progress. It needs backend APIs to manage challenges, user participation, and leaderboard data.

## 🎯 Required Changes

### 1. Database Models

**File:** `app/models/challenge.py` (New file)

```python
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    points = Column(Integer, nullable=False, default=0)
    
    # Challenge configuration
    challenge_type = Column(String(50), nullable=False)  # 'shutdown', 'focus', 'task', 'break'
    target_value = Column(Integer, nullable=False)  # Target to achieve (days, sessions, etc.)
    duration_days = Column(Integer, default=7)  # Challenge duration
    
    # Metadata
    is_active = Column(Boolean, default=True)
    is_weekly = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    participants = relationship("ChallengeParticipant", back_populates="challenge")

class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    
    # Progress tracking
    progress = Column(Integer, default=0)  # Current progress towards target
    status = Column(String(20), default='in_progress')  # 'not_started', 'in_progress', 'completed'
    points_earned = Column(Integer, default=0)
    
    # Timestamps
    joined_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="challenge_participations")
    challenge = relationship("Challenge", back_populates="participants")

class UserChallengeStats(Base):
    __tablename__ = "user_challenge_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Overall stats
    total_points = Column(Integer, default=0)
    challenges_completed = Column(Integer, default=0)
    current_shutdown_streak = Column(Integer, default=0)
    avg_shutdown_time = Column(String(10), default="0:00")  # "18:30" format
    
    # Weekly stats (reset every week)
    weekly_points = Column(Integer, default=0)
    weekly_rank = Column(Integer, nullable=True)
    
    # Metadata
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="challenge_stats")
```

**Update User model** to include relationships:

```python
# In app/models/user.py, add:
challenge_participations = relationship("ChallengeParticipant", back_populates="user")
challenge_stats = relationship("UserChallengeStats", back_populates="user", uselist=False)
```

### 2. API Schema Updates

**File:** `app/schemas/challenge.py` (New file)

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChallengeBase(BaseModel):
    name: str
    description: str
    points: int
    challenge_type: str
    target_value: int
    duration_days: int = 7

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeResponse(ChallengeBase):
    id: str
    is_active: bool
    created_at: datetime
    joined_count: int = 0
    joined_avatars: List[str] = Field(default_factory=list)
    
    # User-specific data (if user is participating)
    progress: Optional[int] = None
    total: Optional[int] = None
    status: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChallengeParticipantResponse(BaseModel):
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    progress: int
    points: int
    status: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    name: string
    avatar: Optional[str] = None
    points: int
    is_current_user: bool = False

class ChallengeStatsResponse(BaseModel):
    total_points: int
    challenges_done: int
    shutdown_streak: int
    avg_shutdown_time: str

class JoinChallengeRequest(BaseModel):
    challenge_id: str
```

### 3. API Endpoints

**File:** `app/api/challenges.py` (Update existing empty file)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.challenge import (
    ChallengeResponse, 
    ChallengeStatsResponse, 
    LeaderboardEntry,
    JoinChallengeRequest
)
from app.services import challenge_service

router = APIRouter(prefix="/challenges", tags=["challenges"])

@router.get("/stats", response_model=ChallengeStatsResponse)
async def get_challenge_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's challenge statistics"""
    try:
        stats = await challenge_service.get_user_challenge_stats(db, current_user.id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch challenge stats"
        )

@router.get("/week", response_model=List[ChallengeResponse])
async def get_weekly_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get this week's active challenges with user progress"""
    try:
        challenges = await challenge_service.get_weekly_challenges(db, current_user.id)
        return challenges
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weekly challenges"
        )

@router.get("/leaders", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly leaderboard"""
    try:
        leaders = await challenge_service.get_weekly_leaderboard(db, current_user.id)
        return leaders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch leaderboard"
        )

@router.post("/{challenge_id}/join", response_model=ChallengeResponse)
async def join_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a challenge"""
    try:
        challenge = await challenge_service.join_challenge(db, challenge_id, current_user.id)
        return challenge
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to join challenge"
        )

@router.delete("/{challenge_id}/leave")
async def leave_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a challenge"""
    try:
        await challenge_service.leave_challenge(db, challenge_id, current_user.id)
        return {"message": "Successfully left challenge"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to leave challenge"
        )

@router.post("/{challenge_id}/progress")
async def update_challenge_progress(
    challenge_id: str,
    progress: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's progress on a challenge (called by other services)"""
    try:
        await challenge_service.update_progress(db, challenge_id, current_user.id, progress)
        return {"message": "Progress updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress"
        )
```

### 4. Service Layer

**File:** `app/services/challenge_service.py` (New file)

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, time
from typing import List, Optional

from app.models.challenge import Challenge, ChallengeParticipant, UserChallengeStats
from app.models.user import User
from app.schemas.challenge import ChallengeStatsResponse, ChallengeResponse, LeaderboardEntry

async def get_user_challenge_stats(db: Session, user_id: str) -> ChallengeStatsResponse:
    """Get user's challenge statistics"""
    
    # Get or create user stats
    stats = db.query(UserChallengeStats)\
        .filter(UserChallengeStats.user_id == user_id)\
        .first()
    
    if not stats:
        stats = UserChallengeStats(user_id=user_id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    
    return ChallengeStatsResponse(
        total_points=stats.total_points,
        challenges_done=stats.challenges_completed,
        shutdown_streak=stats.current_shutdown_streak,
        avg_shutdown_time=stats.avg_shutdown_time
    )

async def get_weekly_challenges(db: Session, user_id: str) -> List[ChallengeResponse]:
    """Get active weekly challenges with user progress"""
    
    # Get active challenges
    challenges = db.query(Challenge)\
        .filter(Challenge.is_active == True)\
        .filter(Challenge.is_weekly == True)\
        .all()
    
    result = []
    for challenge in challenges:
        # Get participation count and avatars
        participants = db.query(ChallengeParticipant)\
            .filter(ChallengeParticipant.challenge_id == challenge.id)\
            .all()
        
        joined_count = len(participants)
        joined_avatars = [p.user.avatar_url for p in participants[:3] if p.user.avatar_url]
        
        # Get user's participation if exists
        user_participation = db.query(ChallengeParticipant)\
            .filter(ChallengeParticipant.challenge_id == challenge.id)\
            .filter(ChallengeParticipant.user_id == user_id)\
            .first()
        
        challenge_data = ChallengeResponse(
            id=str(challenge.id),
            name=challenge.name,
            description=challenge.description,
            points=challenge.points,
            challenge_type=challenge.challenge_type,
            target_value=challenge.target_value,
            duration_days=challenge.duration_days,
            is_active=challenge.is_active,
            created_at=challenge.created_at,
            joined_count=joined_count,
            joined_avatars=joined_avatars
        )
        
        # Add user-specific data if participating
        if user_participation:
            challenge_data.progress = user_participation.progress
            challenge_data.total = challenge.target_value
            challenge_data.status = user_participation.status
        
        result.append(challenge_data)
    
    return result

async def get_weekly_leaderboard(db: Session, user_id: str) -> List[LeaderboardEntry]:
    """Get weekly leaderboard"""
    
    # Get top users by weekly points
    top_users = db.query(UserChallengeStats, User)\
        .join(User, UserChallengeStats.user_id == User.id)\
        .order_by(desc(UserChallengeStats.weekly_points))\
        .limit(10)\
        .all()
    
    leaderboard = []
    current_user_rank = None
    
    for i, (stats, user) in enumerate(top_users, 1):
        is_current = str(user.id) == user_id
        if is_current:
            current_user_rank = i
            
        leaderboard.append(LeaderboardEntry(
            rank=i,
            name=user.full_name or user.username,
            avatar=user.avatar_url,
            points=stats.weekly_points,
            is_current_user=is_current
        ))
    
    # If current user not in top 10, add them at the end
    if current_user_rank is None:
        current_user_stats = db.query(UserChallengeStats, User)\
            .join(User, UserChallengeStats.user_id == User.id)\
            .filter(UserChallengeStats.user_id == user_id)\
            .first()
        
        if current_user_stats:
            stats, user = current_user_stats
            # Get actual rank
            higher_users = db.query(UserChallengeStats)\
                .filter(UserChallengeStats.weekly_points > stats.weekly_points)\
                .count()
            
            leaderboard.append(LeaderboardEntry(
                rank=higher_users + 1,
                name=user.full_name or user.username,
                avatar=user.avatar_url,
                points=stats.weekly_points,
                is_current_user=True
            ))
    
    return leaderboard

async def join_challenge(db: Session, challenge_id: str, user_id: str) -> ChallengeResponse:
    """Join a challenge"""
    
    # Check if challenge exists
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise ValueError("Challenge not found")
    
    # Check if already participating
    existing = db.query(ChallengeParticipant)\
        .filter(ChallengeParticipant.challenge_id == challenge_id)\
        .filter(ChallengeParticipant.user_id == user_id)\
        .first()
    
    if existing:
        raise ValueError("Already participating in this challenge")
    
    # Create participation
    participation = ChallengeParticipant(
        user_id=user_id,
        challenge_id=challenge_id,
        status='in_progress'
    )
    
    db.add(participation)
    db.commit()
    
    # Return updated challenge data
    challenges = await get_weekly_challenges(db, user_id)
    return next(c for c in challenges if c.id == challenge_id)

async def leave_challenge(db: Session, challenge_id: str, user_id: str) -> None:
    """Leave a challenge"""
    
    participation = db.query(ChallengeParticipant)\
        .filter(ChallengeParticipant.challenge_id == challenge_id)\
        .filter(ChallengeParticipant.user_id == user_id)\
        .first()
    
    if not participation:
        raise ValueError("Not participating in this challenge")
    
    db.delete(participation)
    db.commit()

async def update_progress(db: Session, challenge_id: str, user_id: str, new_progress: int) -> None:
    """Update user's progress on a challenge"""
    
    participation = db.query(ChallengeParticipant)\
        .filter(ChallengeParticipant.challenge_id == challenge_id)\
        .filter(ChallengeParticipant.user_id == user_id)\
        .first()
    
    if not participation:
        return  # User not participating
    
    participation.progress = new_progress
    
    # Check if challenge is completed
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if challenge and new_progress >= challenge.target_value:
        participation.status = 'completed'
        participation.completed_at = datetime.utcnow()
        participation.points_earned = challenge.points
        
        # Update user stats
        user_stats = db.query(UserChallengeStats)\
            .filter(UserChallengeStats.user_id == user_id)\
            .first()
        
        if user_stats:
            user_stats.total_points += challenge.points
            user_stats.weekly_points += challenge.points
            user_stats.challenges_completed += 1
    
    db.commit()

# Utility function to initialize default challenges
async def create_default_challenges(db: Session) -> None:
    """Create default weekly challenges"""
    
    default_challenges = [
        {
            "name": "Healthy Boundaries",
            "description": "Log off before 5pm for 5 days",
            "points": 75,
            "challenge_type": "shutdown",
            "target_value": 5,
        },
        {
            "name": "Focus Sprint Master",
            "description": "Complete 10 focus sessions",
            "points": 75,
            "challenge_type": "focus",
            "target_value": 10,
        },
        {
            "name": "Break Champion",
            "description": "Take proper breaks during 5 work sessions",
            "points": 75,
            "challenge_type": "break",
            "target_value": 5,
        },
    ]
    
    for challenge_data in default_challenges:
        existing = db.query(Challenge)\
            .filter(Challenge.name == challenge_data["name"])\
            .first()
        
        if not existing:
            challenge = Challenge(**challenge_data)
            db.add(challenge)
    
    db.commit()
```

### 5. Database Migration

```bash
# Create the migration
alembic revision --autogenerate -m "Add challenge system tables"

# Apply the migration
alembic upgrade head
```

### 6. Register Routes & Initialize Data

**File:** `app/main.py` (Add challenge router)

```python
from app.api import challenges

app.include_router(challenges.router, prefix="/api")
```

**Initialize default challenges on startup:**

```python
# In app/main.py startup event
@app.on_event("startup")
async def startup_event():
    # ... existing startup code ...
    
    # Initialize default challenges
    from app.services.challenge_service import create_default_challenges
    db = next(get_db())
    await create_default_challenges(db)
```

## 🔍 Expected API Behavior

### Getting Challenge Stats

**Request:**

```http
GET /api/challenges/stats
Authorization: Bearer {token}
```

**Response:**

```json
{
  "total_points": 150,
  "challenges_done": 2,
  "shutdown_streak": 5,
  "avg_shutdown_time": "18:30"
}
```

### Getting Weekly Challenges

**Request:**

```http
GET /api/challenges/week
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": "uuid-here",
    "name": "Healthy Boundaries",
    "description": "Log off before 5pm for 5 days",
    "points": 75,
    "challenge_type": "shutdown",
    "target_value": 5,
    "duration_days": 7,
    "is_active": true,
    "created_at": "2025-09-26T00:00:00Z",
    "joined_count": 145,
    "joined_avatars": ["/avatars/1.png", "/avatars/2.png"],
    "progress": 2,
    "total": 5,
    "status": "in_progress"
  }
]
```

### Getting Leaderboard

**Request:**

```http
GET /api/challenges/leaders
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "rank": 1,
    "name": "Sophie L.",
    "avatar": "/avatars/sophie.png",
    "points": 1245,
    "is_current_user": false
  },
  {
    "rank": 4,
    "name": "You",
    "avatar": "/avatars/user.png", 
    "points": 150,
    "is_current_user": true
  }
]
```

### Joining a Challenge

**Request:**

```http
POST /api/challenges/{challenge_id}/join
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "uuid-here",
  "name": "Healthy Boundaries",
  "description": "Log off before 5pm for 5 days",
  "points": 75,
  "progress": 0,
  "total": 5,
  "status": "in_progress"
}
```

## 🎯 Integration Points

| Challenge Type | Integration Service     | Progress Trigger          |
| -------------- | ----------------------- | ------------------------- |
| `shutdown`     | Shutdown Service        | Daily shutdown completion |
| `focus`        | Dashboard/Timer Service | Focus session completion  |
| `task`         | Task Service            | Task completion           |
| `break`        | Timer Service           | Break taken during work   |

## 📊 Current Status

- ✅ **Frontend challenge page** - Complete with stats, challenges, leaderboard
- ✅ **Challenge types defined** - Shutdown, focus, task, break challenges
- ✅ **Progress tracking UI** - Visual progress bars and completion states
- ✅ **Leaderboard display** - Weekly ranking with user highlighting
- ❌ **Challenge database models** - Needs implementation
- ❌ **Challenge APIs** - Needs endpoints for stats, challenges, leaderboard
- ❌ **Progress tracking service** - Needs integration with other services
- ❌ **Weekly reset logic** - Needs scheduled tasks for new challenges

---

### ⏰ Time Tracker Integration Requirements

## Overview

The frontend time tracker (Pomodoro-style focus timer) is fully implemented with countdown timers, focus sessions, break tracking, and daily summaries. However, it's currently only managing state locally and needs backend integration to persist session data and retrieve daily/historical summaries.

## 🎯 Current Backend Status

✅ **Already Implemented:**

- Basic timetracker API endpoints (`/time-logs/start-work`, `/time-logs/end-work`, etc.)
- TimeLog database model and schemas
- Session start/end functionality

❌ **Missing Integration:**

- Frontend connection to existing APIs
- Focus session duration tracking
- Daily summary API endpoints
- Automatic session management from frontend timer

## 🔄 Required Backend Enhancements

### 1. API Schema Updates

**File:** `app/schemas/timelog.py` (Enhance existing)

Add focus session specific schemas:

```python
# Add these to existing schemas
from typing import List

class FocusSessionRequest(BaseModel):
    user_id: UUID4
    duration_minutes: int  # Planned focus duration (30, 60, 90)
    session_type: str = "focus"  # "focus" or "break"
    start_time: Optional[datetime] = None

class FocusSessionResponse(BaseModel):
    session_id: UUID4
    user_id: UUID4
    start_time: datetime
    end_time: Optional[datetime]
    planned_duration: int  # in minutes
    actual_duration: Optional[int]  # in minutes, if completed
    session_type: str  # "focus" or "break"
    status: str  # "active", "completed", "stopped"
    
    class Config:
        orm_mode = True

class DailySummaryResponse(BaseModel):
    date: datetime
    total_focus_sessions: int
    total_focus_time: int  # in seconds
    total_break_time: int  # in seconds
    focus_sessions: List[FocusSessionResponse] = []
    
class WeeklySummaryResponse(BaseModel):
    week_start: datetime
    week_end: datetime
    total_focus_sessions: int
    total_focus_time: int  # in seconds
    total_break_time: int  # in seconds
    daily_summaries: List[DailySummaryResponse] = []
```

### 2. Database Model Updates

**File:** `app/models/timelog.py` (Enhance existing)

Add focus-specific fields:

```python
# Add these columns to existing Timelog model:

# Focus session specific fields
planned_duration = Column(Integer, nullable=True)  # Planned duration in minutes
session_type = Column(String(20), default="work")  # "focus", "break", "work"
status = Column(String(20), default="active")  # "active", "completed", "stopped"

# Helper method
def get_actual_duration_minutes(self) -> Optional[int]:
    """Calculate actual duration in minutes if session is completed"""
    if self.start_time and self.end_time:
        duration_seconds = (self.end_time - self.start_time).total_seconds()
        return int(duration_seconds / 60)
    return None

def get_actual_duration_seconds(self) -> Optional[int]:
    """Calculate actual duration in seconds if session is completed"""
    if self.start_time and self.end_time:
        return int((self.end_time - self.start_time).total_seconds())
    return None
```

### 3. New API Endpoints

**File:** `app/api/timetracker.py` (Add to existing)

```python
# Add these endpoints to existing router

@router.post("/focus-sessions/start", response_model=FocusSessionResponse)
def start_focus_session(
    request: FocusSessionRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a focus session with planned duration"""
    try:
        session = timetrackerservice.start_focus_session(
            db, current_user.id, request.duration_minutes, request.session_type
        )
        return session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/focus-sessions/{session_id}/complete", response_model=FocusSessionResponse)
def complete_focus_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a focus session as completed"""
    try:
        session = timetrackerservice.complete_focus_session(db, current_user.id, session_id)
        return session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete focus session"
        )

@router.post("/focus-sessions/{session_id}/stop", response_model=FocusSessionResponse)
def stop_focus_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stop a focus session before completion"""
    try:
        session = timetrackerservice.stop_focus_session(db, current_user.id, session_id)
        return session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop focus session"
        )

@router.get("/daily-summary", response_model=DailySummaryResponse)
def get_daily_summary(
    date: Optional[str] = None,  # Format: "2025-09-26"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily summary of focus sessions and breaks"""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else datetime.now().date()
        summary = timetrackerservice.get_daily_summary(db, current_user.id, target_date)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch daily summary"
        )

@router.get("/current-session", response_model=Optional[FocusSessionResponse])
def get_current_focus_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current active focus session if any"""
    try:
        session = timetrackerservice.get_current_focus_session(db, current_user.id)
        return session
    except Exception as e:
        return None  # No active session
```

### 4. Service Layer Enhancements

**File:** `app/services/timetrackerservice.py` (Add to existing)

```python
# Add these functions to existing service

from app.schemas.timelog import FocusSessionResponse, DailySummaryResponse
from datetime import date, timedelta

def start_focus_session(
    db: Session, 
    user_id: str, 
    duration_minutes: int, 
    session_type: str = "focus"
) -> FocusSessionResponse:
    """Start a new focus session"""
    
    # Check for existing active session
    active_session = db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.end_time == None,
        Timelog.session_type.in_(["focus", "break"])
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=409, 
            detail=f"Active {active_session.session_type} session already exists"
        )
    
    # Create new focus session
    session = Timelog(
        session_id=uuid.uuid4(),
        user_id=user_id,
        start_time=datetime.now(timezone.utc),
        planned_duration=duration_minutes,
        session_type=session_type,
        status="active",
        type=session_type,  # For compatibility with existing system
        date=datetime.now(timezone.utc)
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return FocusSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        planned_duration=session.planned_duration,
        actual_duration=session.get_actual_duration_minutes(),
        session_type=session.session_type,
        status=session.status
    )

def complete_focus_session(db: Session, user_id: str, session_id: str) -> FocusSessionResponse:
    """Complete a focus session"""
    
    session = db.query(Timelog).filter(
        Timelog.session_id == session_id,
        Timelog.user_id == user_id,
        Timelog.end_time == None
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    session.end_time = datetime.now(timezone.utc)
    session.status = "completed"
    
    db.commit()
    db.refresh(session)
    
    return FocusSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        planned_duration=session.planned_duration,
        actual_duration=session.get_actual_duration_minutes(),
        session_type=session.session_type,
        status=session.status
    )

def stop_focus_session(db: Session, user_id: str, session_id: str) -> FocusSessionResponse:
    """Stop a focus session before completion"""
    
    session = db.query(Timelog).filter(
        Timelog.session_id == session_id,
        Timelog.user_id == user_id,
        Timelog.end_time == None
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    session.end_time = datetime.now(timezone.utc)
    session.status = "stopped"
    
    db.commit()
    db.refresh(session)
    
    return FocusSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        planned_duration=session.planned_duration,
        actual_duration=session.get_actual_duration_minutes(),
        session_type=session.session_type,
        status=session.status
    )

def get_daily_summary(db: Session, user_id: str, target_date: date) -> DailySummaryResponse:
    """Get daily summary of focus sessions and breaks"""
    
    # Get all sessions for the target date
    start_of_day = datetime.combine(target_date, datetime.min.time())
    end_of_day = datetime.combine(target_date, datetime.max.time())
    
    sessions = db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.start_time >= start_of_day,
        Timelog.start_time <= end_of_day,
        Timelog.session_type.in_(["focus", "break"])
    ).all()
    
    # Calculate totals
    focus_sessions = [s for s in sessions if s.session_type == "focus"]
    break_sessions = [s for s in sessions if s.session_type == "break"]
    
    total_focus_sessions = len([s for s in focus_sessions if s.status == "completed"])
    total_focus_time = sum(
        s.get_actual_duration_seconds() or 0 
        for s in focus_sessions 
        if s.status == "completed"
    )
    total_break_time = sum(
        s.get_actual_duration_seconds() or 0 
        for s in break_sessions 
        if s.status == "completed"
    )
    
    # Convert sessions to response format
    focus_session_responses = [
        FocusSessionResponse(
            session_id=s.session_id,
            user_id=s.user_id,
            start_time=s.start_time,
            end_time=s.end_time,
            planned_duration=s.planned_duration,
            actual_duration=s.get_actual_duration_minutes(),
            session_type=s.session_type,
            status=s.status
        ) for s in sessions
    ]
    
    return DailySummaryResponse(
        date=datetime.combine(target_date, datetime.min.time()),
        total_focus_sessions=total_focus_sessions,
        total_focus_time=total_focus_time,
        total_break_time=total_break_time,
        focus_sessions=focus_session_responses
    )

def get_current_focus_session(db: Session, user_id: str) -> Optional[FocusSessionResponse]:
    """Get current active focus session"""
    
    session = db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.end_time == None,
        Timelog.session_type.in_(["focus", "break"])
    ).first()
    
    if not session:
        return None
    
    return FocusSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        planned_duration=session.planned_duration,
        actual_duration=session.get_actual_duration_minutes(),
        session_type=session.session_type,
        status=session.status
    )
```

## 🔗 Frontend Integration Points

### Required Frontend Changes

### 1. Create Time Tracker API Service

```typescript
// frontend/src/features/timeTracker/services/timeTrackerAPI.ts
export const timeTrackerAPI = {
  startFocusSession: (duration: number, type: 'focus' | 'break') => 
    axios.post('/api/focus-sessions/start', { duration_minutes: duration, session_type: type }),
  
  completeFocusSession: (sessionId: string) => 
    axios.post(`/api/focus-sessions/${sessionId}/complete`),
  
  stopFocusSession: (sessionId: string) => 
    axios.post(`/api/focus-sessions/${sessionId}/stop`),
  
  getDailySummary: (date?: string) => 
    axios.get('/api/daily-summary', { params: { date } }),
  
  getCurrentSession: () => 
    axios.get('/api/current-session')
}
```

### 2. Update TimeTrackerPanel Component

- Connect timer start to `startFocusSession` API
- Connect timer completion to `completeFocusSession` API
- Connect stop button to `stopFocusSession` API
- Load daily summary from `getDailySummary` API
- Restore active session on page load with `getCurrentSession`

### 3. Update DailySummary Component

- Fetch real data from backend instead of local state
- Show historical data and persistent totals

## 🎯 Expected API Behavior

### Starting a Focus Session

**Request:**

```http
POST /api/focus-sessions/start
Content-Type: application/json
Authorization: Bearer {token}

{
  "duration_minutes": 30,
  "session_type": "focus"
}
```

**Response:**

```json
{
  "session_id": "uuid-here",
  "user_id": "user-uuid",
  "start_time": "2025-09-26T14:30:00Z",
  "end_time": null,
  "planned_duration": 30,
  "actual_duration": null,
  "session_type": "focus",
  "status": "active"
}
```

### Getting Daily Summary

**Request:**

```http
GET /api/daily-summary?date=2025-09-26
Authorization: Bearer {token}
```

**Response:**

```json
{
  "date": "2025-09-26T00:00:00Z",
  "total_focus_sessions": 3,
  "total_focus_time": 5400,
  "total_break_time": 900,
  "focus_sessions": [
    {
      "session_id": "uuid-1",
      "start_time": "2025-09-26T09:00:00Z",
      "end_time": "2025-09-26T09:30:00Z",
      "planned_duration": 30,
      "actual_duration": 30,
      "session_type": "focus",
      "status": "completed"
    }
  ]
}
```

## 📊 Current Integration Status

- ✅ **Backend API Foundation** - Basic timetracker endpoints exist
- ✅ **Frontend Timer Logic** - Complete Pomodoro-style timer
- ✅ **Database Models** - TimeLog model exists
- ❌ **API Connection** - Frontend not connected to backend
- ❌ **Focus Session Tracking** - Missing planned vs actual duration
- ❌ **Daily Summary API** - Missing aggregation endpoints
- ❌ **Session Persistence** - Timer resets on page refresh

## 🚀 Implementation Priority

**High Priority:**

1. Add focus session API endpoints
2. Connect frontend timer to backend APIs
3. Implement daily summary endpoint
4. Add session persistence and restoration

**Medium Priority:**

1. Weekly/monthly summary endpoints
2. Advanced analytics and insights
3. Integration with challenge system (focus challenges)

---

## 👤 User Avatar Management Requirements

## Overview

The frontend onboarding flow includes avatar selection, and the main layout displays user avatars. Currently, we're using localStorage as a temporary bridge, but we need backend API support for proper avatar management and persistence.

## 🎯 Required Changes

### 1. Database Model Updates

**File:** `app/models/user.py` (Update existing User model)

Add avatar field to the existing User model:

```python
# Add this field to the existing User class:

avatar_url = Column(String(500), nullable=True)  # URL or path to user's avatar image
```

### 2. API Schema Updates

**File:** `app/schemas/user.py` (Update existing schemas)

#### UserCreate Schema

```python
# Add to existing UserCreate schema:
avatar_url: Optional[str] = None
```

#### UserUpdate Schema

```python
# Add to existing UserUpdate schema:
avatar_url: Optional[str] = None
```

#### UserResponse Schema

```python
# Add to existing UserResponse schema:
avatar_url: Optional[str] = None
```

### 3. API Endpoints

**File:** `app/api/users.py` (Add to existing user endpoints)

```python
# Add these endpoints to existing user router

@router.put("/profile/avatar", response_model=UserResponse)
async def update_user_avatar(
    avatar_data: dict,  # {"avatar_url": "string"}
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's avatar URL"""
    try:
        updated_user = user_service.update_user_avatar(
            db, current_user.id, avatar_data.get("avatar_url")
        )
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update avatar"
        )

@router.get("/profile/avatar")
async def get_user_avatar(
    current_user: User = Depends(get_current_user)
):
    """Get user's current avatar URL"""
    return {"avatar_url": current_user.avatar_url}

# For onboarding completion - add avatar to existing preferences endpoint
@router.put("/onboarding/complete", response_model=UserResponse)
async def complete_onboarding(
    onboarding_data: dict,  # Include avatar_url in onboarding completion
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete user onboarding with preferences and avatar"""
    try:
        # Include avatar in the onboarding completion
        preferences = onboarding_data.get("preferences", {})
        avatar_url = onboarding_data.get("avatar_url")
        
        updated_user = user_service.complete_onboarding(
            db, current_user.id, preferences, avatar_url
        )
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete onboarding"
        )
```

### 4. Service Layer Updates

**File:** `app/services/user_service.py` (Add to existing user service)

```python
# Add these functions to existing user service

def update_user_avatar(db: Session, user_id: str, avatar_url: str) -> User:
    """Update user's avatar URL"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    
    return user

def complete_onboarding(
    db: Session, 
    user_id: str, 
    preferences: dict, 
    avatar_url: Optional[str] = None
) -> User:
    """Complete user onboarding with preferences and avatar"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update preferences (existing logic)
    if preferences:
        # Update user preferences logic here
        pass
    
    # Update avatar if provided
    if avatar_url:
        user.avatar_url = avatar_url
    
    # Mark onboarding as complete
    user.onboarding_completed = True
    
    db.commit()
    db.refresh(user)
    
    return user
```

### 5. Database Migration

Create and apply the migration:

```bash
# Create the migration
alembic revision --autogenerate -m "Add avatar_url to users table"

# Apply the migration
alembic upgrade head
```

## 🔍 Expected API Behavior

### Updating User Avatar

**Request:**

```http
PUT /api/users/profile/avatar
Content-Type: application/json
Authorization: Bearer {token}

{
  "avatar_url": "/avatars/avatar-1.png"
}
```

**Response:**

```json
{
  "id": "user-uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "avatar_url": "/avatars/avatar-1.png",
  "created_at": "2025-09-26T10:00:00Z"
}
```

### Getting User Avatar

**Request:**

```http
GET /api/users/profile/avatar
Authorization: Bearer {token}
```

**Response:**

```json
{
  "avatar_url": "/avatars/avatar-1.png"
}
```

### Completing Onboarding with Avatar

**Request:**

```http
PUT /api/users/onboarding/complete
Content-Type: application/json
Authorization: Bearer {token}

{
  "preferences": {
    "work_hours": "9-5",
    "notification_enabled": true
  },
  "avatar_url": "/avatars/avatar-1.png"
}
```

**Response:**

```json
{
  "id": "user-uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "avatar_url": "/avatars/avatar-1.png",
  "onboarding_completed": true,
  "created_at": "2025-09-26T10:00:00Z"
}
```

## 🎯 Integration Points

| Frontend Component | Backend Dependency | Current Workaround |
| ------------------ | ------------------ | ------------------ |
| Onboarding Flow | `PUT /users/onboarding/complete` | localStorage bridge |
| Main Layout Avatar | `GET /users/profile` with avatar_url | localStorage fallback |
| Profile Management | `PUT /users/profile/avatar` | Not implemented |
| Challenge Leaderboard | User avatar in challenge responses | Will use avatar_url field |

## 📊 Current Status

- ✅ **Frontend avatar selection** - Complete in onboarding flow
- ✅ **Frontend avatar display** - Working with localStorage bridge
- ✅ **Avatar persistence across navigation** - localStorage solution
- ❌ **Database avatar field** - Needs avatar_url column in users table
- ❌ **Avatar API endpoints** - Needs avatar management endpoints
- ❌ **Onboarding integration** - Needs avatar included in onboarding completion
- ❌ **Profile API integration** - Frontend not connected to avatar endpoints

## 🚀 Implementation Priority

**High Priority:**

1. Add `avatar_url` field to User model and create migration
2. Update user response schemas to include avatar
3. Implement avatar update endpoint (`PUT /users/profile/avatar`)
4. Include avatar in onboarding completion endpoint

**Medium Priority:**

1. Avatar file upload support (if planning to host avatar images)
2. Default avatar assignment for new users
3. Avatar validation and URL verification

## 🔗 Frontend Migration Plan

Once backend APIs are ready:

1. **Update onboardingFlow.tsx**: Replace localStorage save with API call to onboarding completion
2. **Update mainLayout.tsx**: Replace localStorage avatar loading with user profile API
3. **Remove localStorage bridges**: Clean up temporary avatar persistence code
4. **Add avatar management**: Create profile settings for avatar updates

## ⚠️ Current Temporary Solution

The frontend currently uses localStorage to bridge avatar selection from onboarding to the main layout. This works for immediate functionality but needs backend persistence for:

- Avatar availability across devices
- Avatar display in challenge leaderboards
- Proper user profile management
- Data persistence beyond browser storage

---

**Frontend Team** 💙
