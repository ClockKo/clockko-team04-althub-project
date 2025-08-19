from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.timelog import StartSessionRequest, EndSessionRequest, TimeLogResponse
from app.services import timetrackerservice
# from app.models.timelog import Timelog

router = APIRouter(tags=["time-log"])

@router.post("/time-logs/start-work", response_model=TimeLogResponse)
def start_work(request: StartSessionRequest, db: Session = Depends(get_db)):
    return timetrackerservice.start_session(db, request, session_type="work")


@router.post("/time-logs/end-work", response_model=TimeLogResponse)
def end_work(request: EndSessionRequest, db: Session = Depends(get_db)):
    result = timetrackerservice.end_session(db, request, session_type="work")
    if not result:
        raise HTTPException(status_code=404, detail="No open work session found")
    return result


@router.post("/time-logs/start-break", response_model=TimeLogResponse)
def start_break(request: StartSessionRequest, db: Session = Depends(get_db)):
    return timetrackerservice.start_session(db, request, session_type="break")


@router.post("/time-logs/end-break", response_model=TimeLogResponse)
def end_break(request: EndSessionRequest, db: Session = Depends(get_db)):
    result = timetrackerservice.end_session(db, request, session_type="break")
    if not result:
        raise HTTPException(status_code=404, detail="No open break session found")
    return result


@router.get("/time-logs", response_model=list[TimeLogResponse])
def get_logs(user_id: str, db: Session = Depends(get_db)):
    return timetrackerservice.list_time_logs(db, user_id)


@router.get("/time-logs/summary")
def get_summary(session_id: str, db: Session = Depends(get_db)):
    return timetrackerservice.get_summary(db, session_id)



@router.get("/time-logs/current", response_model=TimeLogResponse)
def current_session(user_id: str, db: Session = Depends(get_db)):
    result = timetrackerservice.get_current_session(db, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="No ongoing session")
    return result