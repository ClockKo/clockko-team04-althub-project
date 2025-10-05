from sqlalchemy.orm import Session
from app.models.timelog import Timelog
from app.models.user import User
from app.schemas.timelog import StartSessionRequest, EndSessionRequest, FocusSessionResponse, PauseSessionRequest, ResumeSessionRequest
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
import uuid

def build_focus_session_response(session: Timelog) -> FocusSessionResponse:
    actual_duration = None
    if session.start_time and session.end_time:
        if session.start_time.tzinfo is None:
            session.start_time = session.start_time.replace(tzinfo=timezone.utc)
        if session.end_time.tzinfo is None:
            session.end_time = session.end_time.replace(tzinfo=timezone.utc)
        actual_duration = max(0, int((session.end_time - session.start_time).total_seconds() // 60))

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
    ).first()

    if active_session:
        if active_session.type == type:
            raise HTTPException(status_code=409, detail=f"You already have an active {type} session.")
        
        # Allow focus sessions to run alongside work sessions
        # Allow work sessions to run alongside focus sessions
        # Allow both focus and break sessions to be started independently
        # Focus and work sessions can coexist - no blocking needed
    
    # REMOVED: Break restriction - allow standalone breaks for better UX
    # REMOVED: Duplicate break restriction logic - now allowing standalone breaks
        
    # Ensure start_time is timezone-aware UTC
    start_time = request.start_time or now
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    elif start_time.tzinfo != timezone.utc:
        start_time = start_time.astimezone(timezone.utc)
    
    print(f"🚀 Creating session with start_time: {start_time} (tzinfo: {start_time.tzinfo})")
    
    new_session = Timelog(
        session_id=uuid.uuid4(),
        user_id=request.user_id,
        start_time=start_time,
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
    # First, let's check if the session exists at all
    session_any_status = db.query(Timelog).filter(
        Timelog.session_id == request.session_id
    ).first()
    
    if not session_any_status:
        print(f"❌ Session {request.session_id} not found in database at all")
        raise HTTPException(status_code=404, detail="Session not found")
    
    print(f"🔍 Found session {request.session_id} with status: {session_any_status.status}")
    
    # Now check for active session
    session = db.query(Timelog).filter(
        Timelog.session_id == request.session_id,
        Timelog.status == "active"
    ).first()

    if not session:
        print(f"❌ Session {request.session_id} exists but status is '{session_any_status.status}', not 'active'")
        raise HTTPException(status_code=404, detail=f"Session found but status is '{session_any_status.status}', not 'active'")
    
    print(f"✅ Pausing active session {request.session_id}")
    now = datetime.now(timezone.utc)

    session.status = "paused"
    session.paused_at = request.paused_at or now

    # Remaining time logic
    if request.remaining_time is not None:
        session.remaining_time = request.remaining_time
    elif session.planned_duration:
        # Fix timezone issue: handle naive start_time
        if session.start_time.tzinfo is None:
            # Convert naive datetime to UTC (assuming it was stored in local time UTC+1)
            start_time_utc = session.start_time.replace(tzinfo=timezone.utc) - timedelta(hours=1)
        else:
            start_time_utc = session.start_time
            
        elapsed = int((now - start_time_utc).total_seconds() // 60)
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
    
    # Use provided end_time or current time, ensure it's timezone-aware UTC
    if request.end_time:
        end_time = request.end_time
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        elif end_time.tzinfo != timezone.utc:
            end_time = end_time.astimezone(timezone.utc)
    else:
        end_time = now
    
    # Debug logging
    print(f"🔍 Backend end_session debug:")
    print(f"  Original start_time: {session.start_time} (tzinfo: {session.start_time.tzinfo})")
    print(f"  Request end_time: {request.end_time}")
    print(f"  Processed end_time: {end_time} (tzinfo: {end_time.tzinfo})")
    
    # Ensure start_time is also timezone-aware UTC (in case of old data)
    if session.start_time.tzinfo is None:
        # For naive datetimes, assume they were stored in local time (UTC+1)
        # and convert to UTC by subtracting 1 hour
        session.start_time = session.start_time.replace(tzinfo=timezone.utc) - timedelta(hours=1)
        print(f"  Fixed start_time (converted from local UTC+1): {session.start_time}")
        
    # Calculate duration to verify it's positive
    duration_seconds = (end_time - session.start_time).total_seconds()
    print(f"  Duration check: {duration_seconds}s ({duration_seconds/60:.1f}min)")
    
    if duration_seconds < 0:
        print(f"❌ ERROR: Negative duration detected!")
        print(f"   Start: {session.start_time}")
        print(f"   End:   {end_time}")
        # Force end_time to be at least equal to start_time
        end_time = session.start_time + timedelta(seconds=1)
        print(f"   Fixed end_time: {end_time}")
    
    session.end_time = end_time

    # Calculate actual duration in minutes
    if session.start_time and session.end_time:
        elapsed_minutes = int((session.end_time - session.start_time).total_seconds() // 60)
        # Note: actual_duration column doesn't exist in DB yet, so we don't store it
        print(f"  Calculated duration: {elapsed_minutes} minutes")
        
        # Determine status based on planned vs actual duration
        if session.planned_duration and elapsed_minutes < session.planned_duration:
            session.status = "stopped"
        else:
            session.status = "completed"
    else:
        session.status = "completed"

    db.commit()
    db.refresh(session)
    
    # Debug the final result
    print(f"  Final start_time: {session.start_time}")
    print(f"  Final end_time: {session.end_time}")
    # Note: actual_duration is calculated in build_focus_session_response, not stored in DB
    
    return build_focus_session_response(session)


def resume_session(db: Session, request: ResumeSessionRequest):
    # First, let's check if the session exists at all
    session_any_status = db.query(Timelog).filter(
        Timelog.session_id == request.session_id
    ).first()
    
    if not session_any_status:
        print(f"❌ Resume: Session {request.session_id} not found in database at all")
        raise HTTPException(status_code=404, detail="Session not found")
    
    print(f"🔍 Resume: Found session {request.session_id} with status: {session_any_status.status}")
    
    session = db.query(Timelog).filter(
        Timelog.session_id == request.session_id,
        Timelog.status == "paused"
    ).first()
    if not session:
        print(f"❌ Resume: Session {request.session_id} exists but status is '{session_any_status.status}', not 'paused'")
        raise HTTPException(status_code=404, detail=f"Session found but status is '{session_any_status.status}', not 'paused'")
    
    print(f"✅ Resuming paused session {request.session_id}")
    
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
    from sqlalchemy import func, and_
    from app.models.timelog import Timelog
    from datetime import datetime, timezone, timedelta

    # Get today's date in UTC
    now_utc = datetime.now(timezone.utc)
    today = now_utc.date()
    today_start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)
    
    # Only get completed sessions (has end_time) from today
    logs = db.query(Timelog).filter(
        and_(
            Timelog.user_id == user_id,
            Timelog.start_time >= today_start,
            Timelog.start_time < today_end,
            Timelog.end_time.isnot(None)  # Only completed sessions
        )
    ).all()

    total_focus_sessions = 0
    total_focus_time = 0
    total_break_time = 0
    focus_sessions = []

    print(f"📊 Daily summary for user {user_id}: Found {len(logs)} completed sessions today")

    for log in logs:
        # Calculate duration in seconds
        duration = (log.end_time - log.start_time).total_seconds()
        
        print(f"  Session: {log.type}, Duration: {duration}s ({duration/60:.1f}min)")

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

    print(f"  📈 Summary: {total_focus_sessions} focus sessions, {total_focus_time}s focus, {total_break_time}s break")
    
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
        start_time=datetime.now(timezone.utc),
        status="active"  # Ensure work sessions have proper status
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
    log.status = "completed"  # Set proper status when ending session
    db.commit()
    db.refresh(log)
    return log


def clear_all_sessions(db: Session, user_id):
    """Clear all timetracker sessions for a user - for clean slate"""
    print(f"🧹 Clearing all timetracker sessions for user {user_id}")
    
    # Delete all focus/break sessions (timetracker related)
    deleted_count = db.query(Timelog).filter(
        Timelog.user_id == user_id,
        Timelog.type.in_(["focus", "break"])  # Only clear timetracker sessions, not work sessions
    ).delete(synchronize_session=False)
    
    db.commit()
    print(f"✅ Cleared {deleted_count} timetracker sessions")
    return {"message": f"Cleared {deleted_count} sessions", "cleared_count": deleted_count}

