from datetime import datetime, date, timedelta
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from fastapi import HTTPException, status
from uuid import UUID
import logging
import json
from app.models.shutdown_reflection import ShutdownReflection
from app.models.task import Task
from app.schemas.shutdown import (
    ShutdownReflectionCreate,
    ShutdownReflectionResponse,
    ShutdownSummaryResponse,
    TaskSummary,
    ProductivityRating
)

logger = logging.getLogger(__name__)


def _serialize_reflection(reflection: ShutdownReflection) -> ShutdownReflectionResponse:
    mindful_disconnect = reflection.mindful_disconnect_completed

    mindfulness_values = None
    if mindful_disconnect is not None:
        if isinstance(mindful_disconnect, list):
            mindfulness_values = [bool(item) for item in mindful_disconnect]
        elif isinstance(mindful_disconnect, str):
            try:
                parsed = json.loads(mindful_disconnect)
                if isinstance(parsed, list):
                    mindfulness_values = [bool(item) for item in parsed]
                else:
                    mindfulness_values = None
            except (ValueError, TypeError):
                mindfulness_values = None
        else:
            try:
                mindfulness_values = [bool(item) for item in list(mindful_disconnect)]
            except TypeError:
                mindfulness_values = None

    return ShutdownReflectionResponse(
        id=reflection.id,
        user_id=reflection.user_id,
    productivity_rating=reflection.productivity_rating,
        reflection_note=reflection.reflection_note,
        mindful_disconnect_completed=mindfulness_values,
        created_at=reflection.created_at,
        shutdown_date=reflection.shutdown_date
    )


def create_shutdown_reflection(
    session: Session,
    reflection_data: ShutdownReflectionCreate,
    user_id: UUID
) -> ShutdownReflectionResponse:
    try:
        db_reflection = ShutdownReflection(
            user_id=user_id,
            productivity_rating=reflection_data.productivity_rating,
            reflection_note=reflection_data.reflection_note,
            mindful_disconnect_completed=reflection_data.mindful_disconnect_completed,
            shutdown_date=reflection_data.shutdown_date
        )
        session.add(db_reflection)
        session.commit()
        session.refresh(db_reflection)
        logger.info(f'Shutdown reflection created: {db_reflection.id}')
        return _serialize_reflection(db_reflection)
    except Exception as e:
        logger.error(f'Error creating shutdown reflection: {str(e)}')
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to create shutdown reflection'
        )


def get_shutdown_history(
    session: Session,
    user_id: UUID,
    limit: int = 30
) -> List[ShutdownReflectionResponse]:
    try:
        result = session.execute(
            select(ShutdownReflection)
            .where(ShutdownReflection.user_id == user_id)
            .order_by(ShutdownReflection.shutdown_date.desc())
            .limit(limit)
        )
        reflections = result.scalars().all()
        return [_serialize_reflection(reflection) for reflection in reflections]
    except Exception as e:
        logger.error(f'Error fetching shutdown history: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to fetch shutdown history'
        )


def get_shutdown_summary(session: Session, user_id: UUID):
    try:
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        tasks_result = session.execute(
            select(Task).where(
                and_(
                    Task.user_id == user_id,
                    Task.created_at >= today_start,
                    Task.created_at <= today_end
                )
            )
        )
        today_tasks = tasks_result.scalars().all()
        
        tasks_total = len(today_tasks)
        tasks_completed = sum(1 for task in today_tasks if task.completed)
        pending_tasks = tasks_total - tasks_completed
        
        task_list = [
            TaskSummary(name=task.title, completed=task.completed)
            for task in today_tasks
        ]
        
        shutdown_streak = 0
        current_date = today
        while True:
            day_start = datetime.combine(current_date, datetime.min.time())
            day_end = datetime.combine(current_date, datetime.max.time())
            
            result = session.execute(
                select(ShutdownReflection).where(
                    and_(
                        ShutdownReflection.user_id == user_id,
                        ShutdownReflection.shutdown_date >= day_start,
                        ShutdownReflection.shutdown_date <= day_end
                    )
                )
            )
            has_reflection = result.scalar_one_or_none() is not None
            
            if not has_reflection:
                break
            
            shutdown_streak += 1
            current_date -= timedelta(days=1)
            
            if shutdown_streak > 365:
                break
        
        focus_time = tasks_completed * 25
        focus_goal = 480
        points_earned = (tasks_completed * 10) + (shutdown_streak * 5)
        clocked_out_time = datetime.now().strftime('%H:%M')
        
        return ShutdownSummaryResponse(
            tasksCompleted=tasks_completed,
            tasksTotal=tasks_total,
            pendingTasks=pending_tasks,
            todayTasks=task_list,
            focusTime=focus_time,
            focusGoal=focus_goal,
            shutdownStreak=shutdown_streak,
            pointsEarned=points_earned,
            clockedOutTime=clocked_out_time
        )
        
    except Exception as e:
        logger.error(f'Error generating shutdown summary: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to generate shutdown summary'
        )
