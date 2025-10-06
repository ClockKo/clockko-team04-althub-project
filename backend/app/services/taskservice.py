from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, delete, update, func
from fastapi import HTTPException, status
from uuid import UUID
from typing import Optional, List
import logging
from app.core.celery import celery_app
from app.core.database import SessionLocal, get_db_session
from app.models.task import Task
from app.models.timelog import Timelog
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TimeLogResponse
from kombu.exceptions import EncodeError

logger = logging.getLogger(__name__)


class ResourceNotFoundException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


@celery_app.task
def send_reminder_notification(task_id: str, task_title: str, user_id: str):
    """
    Celery task to send a reminder notification for a task.
    Logs the event and can be extended for actual notification delivery.
    """
    try:
        with SessionLocal() as session:
            result = session.execute(
                select(Task).where(Task.id == UUID(task_id)))
            task = result.scalar_one_or_none()
            if task:
                logger.info(
                    f"Reminder triggered for task {task_id}: {task_title} for user {user_id}")
            else:
                logger.warning(f"Task {task_id} not found for reminder")
    except Exception as e:
        logger.error(f"Error in reminder task {task_id}: {str(e)}")
        raise


def schedule_reminder(session: Session, task: Task):
    """
    Schedule a reminder using Celery if enabled and reminder_time is in the future.
    Ensures task_id and user_id are strings for serialization.
    """
    if not task.reminder_enabled or not task.reminder_time:
        logger.info(
            f"No reminder scheduled for task {task.id}: reminder disabled or no time set")
        return

    now = datetime.now(timezone.utc)
    if task.reminder_time <= now:
        logger.warning(
            f"Reminder time {task.reminder_time} for task {task.id} is not in the future")
        return

    # Ensure UTC timezone
    eta = task.reminder_time
    if eta.tzinfo is None:
        eta = eta.replace(tzinfo=timezone.utc)

    # Validate title for serialization
    task_title = task.title.encode('utf-8', errors='ignore').decode('utf-8')
    if not task_title:
        logger.error(
            f"Invalid title for task {task.id}, cannot schedule reminder")
        return

    try:
        send_reminder_notification.apply_async(
            args=[str(task.id), task_title, str(task.user_id)],
            eta=eta,
            task_id=f"reminder_{str(task.id)}"
        )
        logger.info(f"Scheduled reminder for task {task.id} at {eta}")
    except EncodeError as e:
        logger.error(
            f"Serialization error scheduling reminder for task {task.id}: {str(e)}")
    except Exception as e:
        logger.error(
            f"Failed to schedule reminder for task {task.id}: {str(e)}")


def create_task(session: Session, task: TaskCreate, user_id: UUID) -> Task:
    try:
        db_task = Task(
            title=task.title,
            description=task.description,
            user_id=user_id,
            reminder_enabled=task.reminder_enabled,
            reminder_time=task.reminder_time,
            start_date=task.start_date,
            due_date=task.due_date,
            completed=task.completed or False,
            priority=task.priority or 'medium',
            tags=task.tags
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        schedule_reminder(session, db_task)
        logger.info(f"Task created: {db_task.id}")
        return db_task
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def get_tasks(session: Session, user_id: UUID, completed: Optional[bool] = None, 
              priority: Optional[str] = None, tags: Optional[List[str]] = None,
              due_today: Optional[bool] = None, upcoming: Optional[bool] = None) -> list[Task]:
    try:
        query = select(Task).where(Task.user_id == user_id)
        
        # Filter by completion status
        if completed is not None:
            query = query.where(Task.completed == completed)
            
        # Filter by priority
        if priority:
            query = query.where(Task.priority == priority)
            
        # Filter by tags (if task has any of the specified tags)
        if tags:
            from sqlalchemy import func
            query = query.where(func.json_array_length(Task.tags) > 0)
            # This is a simplified check - for exact tag matching, you'd need more complex SQL
            
        # Filter for tasks due today
        if due_today:
            from datetime import date
            today = date.today()
            query = query.where(func.date(Task.due_date) == today)
            
        # Filter for upcoming tasks (due in the future, not completed)
        if upcoming:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            query = query.where(Task.due_date > now, Task.completed == False)
            
        # Order by priority (high first) and due date
        priority_order = func.case(
            (Task.priority == 'high', 1),
            (Task.priority == 'medium', 2),
            (Task.priority == 'low', 3),
            else_=2
        )
        query = query.order_by(priority_order, Task.due_date.asc().nullslast(), Task.created_at.desc())
        
        result = session.execute(query)
        tasks = result.scalars().all()
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def get_task(session: Session, task_id: UUID, user_id: UUID) -> Task:
    try:
        result = session.execute(select(Task).where(
            Task.id == task_id, Task.user_id == user_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ResourceNotFoundException("Task not found")
        return task
    except ResourceNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def update_task(session: Session, task_id: UUID, task_update: TaskUpdate, user_id: UUID) -> Task:
    try:
        update_data = task_update.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")
        session.execute(
            update(Task).where(Task.id == task_id,
                               Task.user_id == user_id).values(**update_data)
        )
        session.commit()
        task = get_task(session, task_id, user_id)
        schedule_reminder(session, task)
        logger.info(f"Task updated: {task_id}")
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def delete_task(session: Session, task_id: UUID, user_id: UUID):
    try:
        session.execute(delete(Task).where(
            Task.id == task_id, Task.user_id == user_id))
        session.commit()
        logger.info(f"Task deleted: {task_id}")
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def start_timer(session: Session, task_id: UUID, user_id: UUID) -> Timelog:
    try:
        get_task(session, task_id, user_id)
        result = session.execute(
            select(Timelog).where(Timelog.user_id == user_id, Timelog.end_time == None)
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Another timer is already running")

        time_log = Timelog(
            task_id=task_id,
            user_id=user_id,
            start_time=datetime.now(timezone.utc)
        )
        session.add(time_log)
        session.commit()
        session.refresh(time_log)
        logger.info(f"Timer started for task {task_id}")
        return time_log
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting timer for task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def stop_timer(session: Session, task_id: UUID, user_id: UUID) -> Timelog:
    try:
        get_task(session, task_id, user_id)
        result = session.execute(
            select(Timelog).where(Timelog.task_id ==
                                  task_id, Timelog.end_time == None)
        )
        time_log = result.scalar_one_or_none()
        if not time_log:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="No active timer for this task")

        time_log.end_time = datetime.now(timezone.utc)
        session.commit()
        session.refresh(time_log)
        logger.info(f"Timer stopped for task {task_id}")
        return time_log
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping timer for task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def get_time_logs(session: Session, task_id: UUID, user_id: UUID) -> list[Timelog]:
    try:
        get_task(session, task_id, user_id)
        result = session.execute(
            select(Timelog).where(Timelog.task_id == task_id))
        time_logs = result.scalars().all()
        return time_logs
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching time logs for task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
