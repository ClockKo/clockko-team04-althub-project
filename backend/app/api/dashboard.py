from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services import timetrackerservice, taskservice
from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.timelog import TimeLogResponse, StartSessionRequest, EndSessionRequest

router = APIRouter(tags=["Dashboard"])

@router.post("/clock-in", response_model=TimeLogResponse)
def clock_in(db: Session = Depends(get_db), user=Depends(get_current_user)):
    request = StartSessionRequest(user_id=user.id)
    return timetrackerservice.start_session(db, request, session_type="work")

@router.post("/clock-out", response_model=TimeLogResponse)
def clock_out(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Get the current active work session for the user
    current_session = timetrackerservice.get_current_session(db, user.id)
    if not current_session or current_session.type != "work" or current_session.end_time is not None:
        raise HTTPException(status_code=404, detail="No active work session found to end.")
    request = EndSessionRequest(session_id=current_session.session_id)
    return timetrackerservice.end_session(db, request, session_type="work")

@router.post("/start-break", response_model=TimeLogResponse)
def start_break(db: Session = Depends(get_db), user=Depends(get_current_user)):
    request = StartSessionRequest(user_id=user.id)
    return timetrackerservice.start_session(db, request, session_type="break")


@router.post("/end-break", response_model=TimeLogResponse)
def end_break(db: Session = Depends(get_db), user=Depends(get_current_user)):
    #Get the current active break session for the user
    current_session = timetrackerservice.get_current_session(db, user.id)
    if not current_session or current_session.type != "break" or current_session.end_time is not None:
        raise HTTPException(status_code=404, detail="No active break session found to end.")
    request = EndSessionRequest(session_id=current_session.session_id)
    return timetrackerservice.end_session(db, request, session_type="break")



# @router.post("/clock-out", response_model=TimeLogResponse)
# def clock_out(db: Session = Depends(get_db), user = Depends(get_current_user)):
#     result = timetrackerservice.end_session(db, user.id, session_type="work")
#     if not result:
#         raise HTTPException(status_code=404, detail="No open work session found")
#     return result

@router.get("/current-session", response_model=TimeLogResponse)
def get_current_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    result = timetrackerservice.get_current_session(db, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="No ongoing session")
    return result

@router.get("/last-session", response_model=TimeLogResponse)
def get_last_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    result = timetrackerservice.get_last_session(db, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="No previous session found")
    return result


