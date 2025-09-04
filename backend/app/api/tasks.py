from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from sqlalchemy.orm import Session
from uuid import UUID
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TimeLogResponse
from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.taskservice import start_timer, stop_timer, get_time_logs, create_task, get_tasks, get_task, update_task, delete_task


router = APIRouter(tags=["Tasks"])


@router.post("/", response_model=TaskResponse)
def create_new_task(
    task: TaskCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return create_task(db, task, current_user.id)


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    return get_tasks(db, current_user.id)


@router.get("/{task_id}", response_model=TaskResponse)
def get_specific_task(
    task_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return get_task(db, task_id, current_user.id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_specific_task(
    task_id: UUID,
    task: TaskUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return update_task(db, task_id, task, current_user.id)


@router.delete("/{task_id}", status_code=204)
def delete_specific_task(
    task_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    delete_task(db, task_id, current_user.id)
    return {"detail": "Task deleted successfully"}


@router.post("/{task_id}/start-timer", response_model=TimeLogResponse)
def start_task_timer(
    task_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return start_timer(db, task_id, current_user.id)


@router.post("/{task_id}/stop-timer", response_model=TimeLogResponse)
def stop_task_timer(
    task_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return stop_timer(db, task_id, current_user.id)


@router.get("/{task_id}/time-logs", response_model=List[TimeLogResponse])
def get_task_time_logs(
    task_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return get_time_logs(db, task_id, current_user.id)
