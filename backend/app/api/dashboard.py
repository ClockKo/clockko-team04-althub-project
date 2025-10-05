from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services import timetrackerservice, taskservice, shutdownservice
from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.timelog import TimeLogResponse, EndSessionRequest, FocusTimeResponse
from app.schemas.shutdown import ShutdownReflectionCreate, ShutdownReflectionResponse, ShutdownSummaryResponse
from typing import List

router = APIRouter(tags=["Dashboard"])

@router.post("/clock-in", response_model=TimeLogResponse)
def clock_in(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # request = StartSessionRequest(user_id=user.id, type="clock-in")
    return timetrackerservice.clock_in(db, user.id)

@router.post("/clock-out", response_model=TimeLogResponse)
def clock_out(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Get the current active work session for the user
    current_session = timetrackerservice.get_current_session(db, user.id)
    if not current_session or current_session.type != "work" or current_session.end_time is not None:
        raise HTTPException(status_code=404, detail="No active work session found to end.")
    # request = EndSessionRequest(session_id=current_session.session_id)
    return timetrackerservice.clock_out(db, user.id)


@router.get("/current-session", response_model=TimeLogResponse)
def get_current_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    result = timetrackerservice.get_current_session(db, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="No ongoing session")
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
    Create a new shutdown reflection for today.
    Records productivity rating, reflection notes, and mindful disconnect checklist.
    """
    new_reflection = shutdownservice.create_shutdown_reflection(db, reflection, user.id)
    return new_reflection


@router.get("/shutdown-history", response_model=List[ShutdownReflectionResponse])
def get_shutdown_history(
    limit: int = 30,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Get shutdown reflection history.
    Returns the last N reflections (default: 30).
    """
    history = shutdownservice.get_shutdown_history(db, user.id, limit)
    return history
