from sqlalchemy.orm import Session
from app.models.timelog import Timelog
from app.models.user import User
from app.schemas.timelog import StartSessionRequest, EndSessionRequest, FocusSessionResponse, PauseSessionRequest, ResumeSessionRequest
from datetime import datetime, timezone
from fastapi import HTTPException
import uuid

def build_focus_session_response(session: Timelog) -> FocusSessionResponse:
    actual_duration = None
    if session.start_time and session.end_time:
        if session.start_time.tzinfo is None:
            session.start_time = session.start_time.replace(tzinfo=timezone.utc)
        if session.end_time.tzinfo is None:
            session.end_time = session.end_time.replace(tzinfo=timezone.utc)
        actual_duration = int((session.end_time - session.start_time).total_seconds() // 60)

    return FocusSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        planned_duration=session.planned_duration or 0,
        actual_duration=actual_duration,
        type=session.type,
        status=session.status,
        paused_at=session.paused_at,
        remaining_time=session.remaining_time,
    )


def start_session(db: Session, request: StartSessionRequest, type: str):
    # Check if user is active
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Only verified users can start a session.")
    

    now = datetime.now(timezone.utc)

    active_session = db.query(Timelog).filter(
        Timelog.user_id == request.user_id,
        Timelog.status == "active"
    ). first ()

    if active_session:
        if active_session.type == type:
            raise HTTPException(status_code=409, detail=f"You already have an active {type} session.")
        
        else:
            raise HTTPException(status_code=409, detail=f"Cannot start a {type} session while a {active_session.type} session is still active. Please end it first.")    
    
    if type == "break":
        paused_focus = db.query(Timelog).filter(
            Timelog.user_id == request.user_id,
            Timelog.type  == "focus",
            Timelog.status == "paused"
        ).order_by(Timelog.start_time.desc()).first()
        if not paused_focus:
            raise HTTPException(status_code=400, detail="Cannot start a break unless a focus session is paused.")
        
    new_session = Timelog(
        session_id=uuid.uuid4(),
        user_id=request.user_id,
        start_time=request.start_time or now,
        type=type,
        date=now,
        planned_duration=request.planned_duration,
        status="active",
        paused_at=None,
        remaining_time=None
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return build_focus_session_response(new_session)


def pause_session(db: Session, request: PauseSessionRequest):
    session = db.query(Timelog).filter(
        Timelog.session_id == request.session_id,
        Timelog.status == "active"
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    now = datetime.now(timezone.utc)

    session.status = "paused"
    session.paused_at = request.paused_at or now

    # Remaining time logic
    if request.remaining_time is not None:
        session.remaining_time = request.remaining_time
    elif session.planned_duration:
        elapsed = int((now - session.start_time).total_seconds() // 60)
        session.remaining_time = max(session.planned_duration - elapsed, 0)
        
    db.commit()
    db.refresh(session)
    return build_focus_session_response(session)


def end_session(db: Session, request: EndSessionRequest, type: str):
    session = db.query(Timelog).filter(
        Timelog.session_id == request.session_id,
        Timelog.end_time == None,
        Timelog.type == type
    ).order_by(Timelog.start_time.desc()).first()
    if not session:
        raise HTTPException(status_code=404, detail="No active session found to end")
    
    now = datetime.now(timezone.utc)
    
    session.end_time =request.end_time or now

    if session.start_time and session.end_time:
        if session.start_time.tzinfo is None:
            session.start_time = session.start_time.replace(tzinfo=timezone.utc)
        if session.end_time.tzinfo is None:
            session.end_time = session.end_time.replace(tzinfo=timezone.utc)

    
    if session.planned_duration:
        elapsed = int((session.end_time - session.start_time).total_seconds() // 60)
        if elapsed < session.planned_duration:
            session.status = "stopped"
        else:
            session.status = "completed"
    else:
        session.status = "completed"

    db.commit()
    db.refresh(session)
    return build_focus_session_response(session)


def resume_session(db: Session, request: ResumeSessionRequest):
    session = db.query(Timelog).filter(
        Timelog.session_id == request.session_id,
        Timelog.status == "paused"
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Paused session not found.")
    
    # If resuming a focus session, make sure no break session is active or paused
    if session.type == "focus":
        conflicting_break = db.query(Timelog).filter(
            Timelog.user_id == session.user_id,
            Timelog.type == "break",
            Timelog.status.in_(["active", "paused"])
        ).first()
        if conflicting_break:
            raise HTTPException(status_code=400, detail="Cannot resume focus session while a break session is active or paused. End/stop the break first.")
        
        # Resume the session
    session.status = "active"

    if request.remaining_time is not None:
        session.remaining_time = request.remaining_time

    db.commit()
    db.refresh(session)
    return build_focus_session_response(session)


def list_time_logs(db: Session, user_id):
    return db.query(Timelog).filter(Timelog.user_id == user_id).all()


def get_daily_summary(db: Session, user_id):
    from sqlalchemy import func
    from app.models.timelog import Timelog
    from datetime import datetime, timezone, timedelta

    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)
    
    logs = db.query(Timelog).filter(
        Timelog.user_id == user_id,
        func.date(Timelog.start_time) == today
        # Timelog.start_time >= today_start,
        # Timelog.start_time < today_end
    ).all()

    total_focus_sessions = 0
    total_focus_time = 0
    total_break_time = 0
    focus_sessions = []

    for log in logs:
                
        if log.end_time:
            duration = abs(log.end_time - log.start_time).total_seconds()

            if log.type == "focus":
                total_focus_sessions += 1
                total_focus_time += duration
                # build session response for each focus log
                focus_sessions.append({
                    "start_time": log.start_time,
                    "end_time": log.end_time,
                    "actual_duration": duration,
                })
            elif log.type == "break":
                total_break_time += duration


    # def format_time(seconds: float):
    #     hours = int(seconds // 3600)
    #     minutes = int((seconds % 3600) // 60)   
    #     return f"{hours}h {minutes}m"         
    
    return {
        "date": today,
        "total_focus_sessions": total_focus_sessions,
        "total_focus_time": int(total_focus_time),
        "total_break_time": int(total_break_time),
        # "focus_sessions": []
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


def get_focus_time(db: Session, user_id):
    summary = get_daily_summary(db, user_id)
    return summary["total_focus_time"] 


def clock_in(db: Session, user_id:int):
    log = Timelog(
        user_id=user_id,
        type="work",
        start_time=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def clock_out(db: Session, user_id:int):
    log = db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.type == "work",
        Timelog.end_time == None
    ).first()

    if not log:
        raise Exception("No active session found.")
    
    log.end_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(log)
    return log

