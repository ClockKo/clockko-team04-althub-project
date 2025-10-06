from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services import timetrackerservice, taskservice
from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.timelog import TimeLogResponse, EndSessionRequest, FocusTimeResponse
from app.models.timelog import Timelog

router = APIRouter(tags=["Dashboard"])

@router.post("/clock-in", response_model=TimeLogResponse)
def clock_in(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # request = StartSessionRequest(user_id=user.id, type="clock-in")
    return timetrackerservice.clock_in(db, user.id)

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
    
    return timetrackerservice.clock_out(db, user.id)


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
    return result

@router.get("/last-session", response_model=TimeLogResponse)
def get_last_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Get the most recent completed work session
    result = timetrackerservice.get_last_session(db, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="No completed session found")
    return result

@router.get("/data")
def get_dashboard_data(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Get dashboard data for the frontend
    try:
        # Get tasks (this might need to be implemented)
        tasks = taskservice.get_user_tasks(db, user.id) if hasattr(taskservice, 'get_user_tasks') else []
        
        # Get today's focus time
        total_focus_time = timetrackerservice.get_focus_time(db, user.id)
        
        # Return data in expected format
        return {
            "tasks": tasks,
            "todaySummary": {
                "duration": total_focus_time
            },
            "points": 0  # Placeholder for user points/streak
        }
    except Exception as e:
        # Return default data if there's an error
        return {
            "tasks": [],
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

@router.get("/shutdown-summary")
def get_shutdown_summary(db: Session = Depends(get_db), user = Depends(get_current_user)):
    """Get summary data for shutdown modal"""
    try:
        # Get today's focus time
        total_focus_time = timetrackerservice.get_focus_time(db, user.id)
        
        # Get tasks (placeholder - implement when task service is ready)
        tasks_completed = 0
        tasks_total = 0
        pending_tasks = 0
        today_tasks = []
        
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