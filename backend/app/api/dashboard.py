from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services import timetrackerservice, taskservice, shutdownservice
from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.timelog import TimeLogResponse, EndSessionRequest, FocusTimeResponse
from app.schemas.shutdown import ShutdownReflectionCreate, ShutdownReflectionResponse, ShutdownSummaryResponse
from typing import List
from app.models.timelog import Timelog

router = APIRouter(tags=["Dashboard"])

@router.post("/clock-in", response_model=TimeLogResponse)
def clock_in(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # request = StartSessionRequest(user_id=user.id, type="clock-in")
    result = timetrackerservice.clock_in(db, user.id)
    return fix_timezone_for_timelog(result)

@router.post("/clock-out", response_model=TimeLogResponse)
def clock_out(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Get the current active work session specifically for the user
    current_work_session = db.query(Timelog).filter(
        Timelog.user_id == user.id,
        Timelog.type == "work",
        Timelog.end_time == None
    ).order_by(Timelog.start_time.desc()).first()
    
    if not current_work_session:
        raise HTTPException(status_code=404, detail="No active work session found to end.")
    
    result = timetrackerservice.clock_out(db, user.id)
    return fix_timezone_for_timelog(result)


def fix_timezone_for_timelog(timelog: Timelog) -> Timelog:
    """Fix timezone issues for existing database records"""
    from datetime import timezone
    
    if timelog.start_time and timelog.start_time.tzinfo is None:
        # Treat naive datetime as UTC (not local time)
        timelog.start_time = timelog.start_time.replace(tzinfo=timezone.utc)
    
    if timelog.end_time and timelog.end_time.tzinfo is None:
        # Treat naive datetime as UTC (not local time)  
        timelog.end_time = timelog.end_time.replace(tzinfo=timezone.utc)
        
    if timelog.date and timelog.date.tzinfo is None:
        timelog.date = timelog.date.replace(tzinfo=timezone.utc)
        
    if timelog.paused_at and timelog.paused_at.tzinfo is None:
        timelog.paused_at = timelog.paused_at.replace(tzinfo=timezone.utc)
    
    return timelog

@router.get("/current-session", response_model=TimeLogResponse)
def get_current_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Get current work session specifically for dashboard
    result = db.query(Timelog).filter(
        Timelog.user_id == user.id,
        Timelog.type == "work",
        Timelog.end_time == None
    ).order_by(Timelog.start_time.desc()).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="No ongoing work session")
    
    # Fix timezone issues for response
    result = fix_timezone_for_timelog(result)
    return result

@router.get("/last-session", response_model=TimeLogResponse)
def get_last_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Get the most recent completed work session
    result = timetrackerservice.get_last_session(db, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="No completed session found")
    
    # Fix timezone issues for response
    result = fix_timezone_for_timelog(result)
    return result

@router.get("/data")
def get_dashboard_data(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Get dashboard data for the frontend
    try:
        # Get all tasks
        all_tasks = taskservice.get_tasks(db, user.id)
        
        # Get tasks for today's progress - includes:
        # 1. Tasks due today (regardless of completion status) 
        # 2. Tasks updated today (approximation until completed_at field is added)
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_today = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        today_progress_tasks = []
        for task in all_tasks:
            # Include if due today (handle timezone-naive dates)
            if task.due_date:
                # Make due_date timezone-aware if it's naive
                due_date = task.due_date
                if due_date.tzinfo is None:
                    due_date = due_date.replace(tzinfo=timezone.utc)
                if start_of_today <= due_date <= end_of_today:
                    today_progress_tasks.append(task)
            # Include if updated today and completed (approximation until we have completed_at)
            elif task.completed and task.updated_at:
                # Make updated_at timezone-aware if it's naive
                updated_at = task.updated_at
                if updated_at.tzinfo is None:
                    updated_at = updated_at.replace(tzinfo=timezone.utc)
                if start_of_today <= updated_at <= end_of_today:
                    today_progress_tasks.append(task)
        
        # Remove duplicates
        today_progress_tasks = list({task.id: task for task in today_progress_tasks}.values())
        
        # Get today's focus time
        total_focus_time = timetrackerservice.get_focus_time(db, user.id)
        print(f"🎯 Dashboard focus time for user {user.id}: {total_focus_time} seconds")
        
        # Return data in expected format
        return {
            "tasks": all_tasks,
            "todayTasks": today_progress_tasks,  # Tasks relevant to today's progress
            "todaySummary": {
                "duration": total_focus_time
            },
            "points": 0  # Placeholder for user points/streak
        }
    except Exception as e:
        print(f"❌ Dashboard API error: {e}")
        print(f"❌ Exception type: {type(e)}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        # Return default data if there's an error
        return {
            "tasks": [],
            "todayTasks": [],
            "todaySummary": {
                "duration": 0
            },
            "points": 0
        }

# Today's progress Focus Time 
@router.get("/focus-sessions/all-daily-focus", response_model=FocusTimeResponse)
def get_focus_time(db: Session = Depends(get_db), user = Depends(get_current_user)):
    total_focus_time = timetrackerservice.get_focus_time(db, user.id)
    return {"total_focus_time": total_focus_time}


# Tasks Completed
# @router.get("/task-completed/all")
# def get_all_tasks():
#     return


# Shutdown Reflection Endpoints

@router.get("/shutdown-summary", response_model=ShutdownSummaryResponse)
def get_shutdown_summary(db: Session = Depends(get_db), user = Depends(get_current_user)):
    """
    Get today's shutdown summary including:
    - Tasks completed today
    - Total focus time
    - Current shutdown streak
    - Points earned
    """
    summary = shutdownservice.get_shutdown_summary(db, user.id)
    return summary


@router.post("/shutdown-reflection", response_model=ShutdownReflectionResponse)
def create_shutdown_reflection(
    reflection: ShutdownReflectionCreate,
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    """
    Create a new shutdown reflection for today. Records productivity rating, reflection notes, and mindful disconnect checklist.
    """
    return shutdownservice.create_shutdown_reflection(db, reflection, user.id)


@router.get("/shutdown-history", response_model=List[ShutdownReflectionResponse])
def get_shutdown_history(
    limit: int = 30,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Get historical shutdown reflections for the user.
    """
    return shutdownservice.get_shutdown_history(db, user.id, limit)
@router.get("/shutdown-summary")
def get_shutdown_summary(db: Session = Depends(get_db), user = Depends(get_current_user)):
    """Get summary data for shutdown modal"""
    try:
        # Get today's focus time
        total_focus_time = timetrackerservice.get_focus_time(db, user.id)
        
        # Get today's tasks
        today_tasks_data = taskservice.get_tasks(db, user.id, due_today=True)
        tasks_completed = len([t for t in today_tasks_data if t.completed])
        tasks_total = len(today_tasks_data)
        pending_tasks = tasks_total - tasks_completed
        
        # Transform tasks for frontend
        today_tasks = [
            {"name": task.title, "completed": task.completed} 
            for task in today_tasks_data
        ]
        
        # Calculate other metrics
        focus_goal = 120  # Default 2 hours in minutes
        shutdown_streak = 1  # Placeholder
        points_earned = 10  # Base points
        
        # Add points for focus time
        if total_focus_time >= focus_goal:
            points_earned += 15
            
        # Add points for completed tasks
        points_earned += tasks_completed * 5
        
        return {
            "tasksCompleted": tasks_completed,
            "tasksTotal": tasks_total, 
            "focusTime": total_focus_time,  # This will show actual focus time from timetracker
            "focusGoal": focus_goal,
            "pendingTasks": pending_tasks,
            "shutdownStreak": shutdown_streak,
            "pointsEarned": points_earned,
            "clockedOutTime": None,  # Will be set by frontend
            "todayTasks": today_tasks
        }
        
    except Exception as e:
        print(f"Error getting shutdown summary: {e}")
        # Return default data if there's an error
        return {
            "tasksCompleted": 0,
            "tasksTotal": 0,
            "focusTime": 0,
            "focusGoal": 120,
            "pendingTasks": 0,
            "shutdownStreak": 0,
            "pointsEarned": 10,
            "clockedOutTime": None,
            "todayTasks": []
        }
