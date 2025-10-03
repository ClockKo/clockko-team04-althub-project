from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services import timetrackerservice, taskservice
from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.timelog import TimeLogResponse, EndSessionRequest, FocusTimeResponse

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

# Today's progress Focus Time 
@router.get("/focus-sessions/all-daily-focus", response_model=FocusTimeResponse)
def get_focus_time(db: Session = Depends(get_db), user = Depends(get_current_user)):
    total_focus_time = timetrackerservice.get_focus_time(db, user.id)
    return {"total_focus_time": total_focus_time}


# Tasks Completed
# @router.get("/task-completed/all")
# def get_all_tasks():
#     return