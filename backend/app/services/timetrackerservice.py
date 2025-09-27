from sqlalchemy.orm import Session
from app.models.timelog import Timelog
from app.models.user import User
from app.schemas.timelog import StartSessionRequest, EndSessionRequest
from datetime import datetime, timezone
from fastapi import HTTPException
import uuid

def start_session(db: Session, request: StartSessionRequest, session_type: str):
    # Check if user is active
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Only verified users can start a session.")
    active_session = db.query(Timelog).filter(
        Timelog.user_id == request.user_id,
        Timelog.end_time == None
    ). first ()

    if active_session:
        if active_session.type == session_type:
            raise HTTPException(status_code=409, detail=f"You already have an active {session_type} session.")
        
        else:
            raise HTTPException(status_code=409, detail=f"Cannot start a {session_type} session while a {active_session.type} session is still active. Please end it first.")
    # Check if there's an active session for this user
    existing_session = db.query(Timelog).filter(
        Timelog.user_id == request.user_id,
        Timelog.type == session_type,
        Timelog.end_time == None
    ).first()

    if existing_session:
        # Error message based on session_type
        if session_type == "work":
            raise HTTPException(status_code=409, detail="You already have an active session.")
        
        elif session_type == "break":
            raise HTTPException(status_code=409, detail="You already have an active break session.")
        
        else:
            raise HTTPException(fstatus_code=400, detail=f"User already has an {session_type}.")
    
    
    time_log = Timelog(
        session_id=uuid.uuid4(),
        user_id=request.user_id,
        start_time=request.start_time or datetime.now(timezone.utc),
        type=session_type,
        date=datetime.now(timezone.utc)
    )
    db.add(time_log)
    db.commit()
    db.refresh(time_log)
    return time_log

def end_session(db: Session, request: EndSessionRequest, session_type: str):
    session = db.query(Timelog).filter(
        Timelog.session_id == request.session_id,
        Timelog.end_time == None,
        Timelog.type == session_type
    ).order_by(Timelog.start_time.desc()).first()
    if not session:
        return session
    
    session.end_time =request.end_time or datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session


def list_time_logs(db: Session, user_id):
    # return db.query(Timelog).filter(Timelog.id == id).all()
    return db.query(Timelog).filter(Timelog.user_id == user_id).all()


def get_summary(db: Session, session_id):
    from sqlalchemy import func
    from app.models.timelog import Timelog
    today = datetime.now(timezone.utc).date()
    logs = db.query(Timelog).filter(
        Timelog.session_id == session_id,
        func.date(Timelog.start_time) == today
    ).all()
    total_work = sum(
        [(log.end_time - log.start_time).total_seconds() for log in logs if log.end_time and log.type == "work"]
    )
    total_break = sum(
        [(log.end_time - log.start_time).total_seconds() for log in logs if log.end_time and log.type == "break"]
    )
    return {
        "work_hours": total_work / 3600,
        "break_hours": total_break / 3600
    }


def get_current_session(db: Session, user_id):
    return db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.end_time == None 
            
    ).order_by(Timelog.start_time.desc()).first()

def get_last_session(db: Session, user_id):
    """Get the most recent session (completed or active) for display purposes"""
    return db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.type == "work"  # Only work sessions for the work widget
    ).order_by(Timelog.start_time.desc()).first()






