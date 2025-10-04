from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.timelog import StartSessionRequest, EndSessionRequest, FocusSessionResponse, PauseSessionRequest, ResumeSessionRequest, DailySummaryResponse
from app.services import timetrackerservice
from app.core.auth import get_current_user
# from app.models.timelog import Timelog

router = APIRouter(tags=["time-log"])

@router.post("/focus-sessions/start", response_model=FocusSessionResponse)
def start_session(request: StartSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Use authenticated user's ID
    request.user_id = user.id
    return timetrackerservice.start_session(db, request, type="focus")


@router.post("/focus-sessions/{session_id}/end", response_model=FocusSessionResponse)
def end_session(session_id: str, request: EndSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Set session_id from URL parameter
    request.session_id = session_id
    return timetrackerservice.end_session(db, request, type="focus")

@router.post("/focus-sessions/{session_id}/pause", response_model=FocusSessionResponse)
def pause_session(session_id: str, request: PauseSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    request.session_id = session_id
    return timetrackerservice.pause_session(db, request)

@router.post("/focus-sessions/{session_id}/resume", response_model=FocusSessionResponse)
def resume_session(session_id: str, request: ResumeSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    request.session_id = session_id
    return timetrackerservice.resume_session(db, request)

@router.post("/break-sessions/start", response_model=FocusSessionResponse)
def start_break(request: StartSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    request.user_id = user.id
    return timetrackerservice.start_session(db, request, type="break")


@router.post("/break-sessions/{session_id}/end", response_model=FocusSessionResponse)
def end_break(session_id: str, request: EndSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    request.session_id = session_id
    return timetrackerservice.end_session(db, request, type="break")

@router.post("/break-sessions/{session_id}/pause", response_model=FocusSessionResponse)
def pause_break(session_id: str, request: PauseSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    request.session_id = session_id
    return timetrackerservice.pause_session(db, request)

@router.post("/break-sessions/{session_id}/resume", response_model=FocusSessionResponse)
def resume_break(session_id: str, request: ResumeSessionRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    request.session_id = session_id
    return timetrackerservice.resume_session(db, request)

@router.get("/time-logs/daily-summary", response_model=DailySummaryResponse)
def get_daily_summary(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return timetrackerservice.get_daily_summary(db, user.id)

@router.get("/time-logs/current", response_model=FocusSessionResponse)
def current_session(db: Session = Depends(get_db), user = Depends(get_current_user)):
    result = timetrackerservice.get_current_session(db, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="No ongoing session")
    return timetrackerservice.build_focus_session_response(result)

# @router.get("/paused_session", response_model=FocusSessionResponse)
# def get_current_paused_session(user_id: str, db: Session = Depends(get_db)):
#     return