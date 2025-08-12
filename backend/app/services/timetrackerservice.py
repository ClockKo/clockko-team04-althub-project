from sqlalchemy.orm import Session
from app.models.timelog import Timelog
from app.schemas.timelog import StartSessionRequest, EndSessionRequest
from datetime import datetime, timezone



def start_session(db: Session, request: StartSessionRequest, session_type: str):
    time_log = Timelog(
        id=request.id,
        start_time=request.start_time or datetime.now(timezone.utc),
        type=session_type,
        date=datetime.now(timezone.utc)
    )
    db.add(time_log)
    db.commit()
    db.refresh(time_log)
    return time_log

def end_session(db: Session, request: EndSessionRequest, session_type: str):
    log = db.query(Timelog).filter(
        Timelog.id == request.id,
        Timelog.end_time == None,
        Timelog.type == session_type
    ).order_by(Timelog.start_time.desc()).first()
    if not log:
        return None
    
    log.end_time =request.end_time or datetime.now(timezone.utc)
    db.commit()
    db.refresh(log)
    return log


def list_time_logs(db: Session, id):
    return db.query(Timelog).filter(Timelog.id == id).all()
    # return db.query(Timelog).filter(Timelog.user_id == user_id).all()


def get_summary(db: Session, id):
    from sqlalchemy import func
    from app.models.timelog import Timelog
    today = datetime.now(timezone.utc).date()
    logs = db.query(Timelog).filter(
        Timelog.id == id,
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


def get_current_session(db: Session, id):
    return db.query(Timelog).filter(
        Timelog.id == id,
        Timelog.end_time == None 
            
    ).order_by(Timelog.start_time.desc()).first()






