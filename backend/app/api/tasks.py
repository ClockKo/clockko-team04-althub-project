# app/api/task.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.schemas.task import TaskCreate, TaskUpdate, TaskRead
from app.models.task import Task
from app.core.security import get_current_user
from app.core.database import get_db
from app.api import task as crud_task
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskRead)
def create(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    # Ensure user_id is a UUID, not a SQLAlchemy Column
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return crud_task.create_task(db, user_id, task_in)

@router.get("/", response_model=list[TaskRead])
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    return crud_task.get_tasks(db, user_id)

@router.get("/{task_id}", response_model=TaskRead)
def read(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure user_id is always a UUID, not a SQLAlchemy Column
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    task = crud_task.get_task(db, task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskRead)
def update(
    task_id: UUID,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    task = crud_task.get_task(db, task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud_task.update_task(db, task, task_in)

@router.delete("/{task_id}", status_code=204)
def delete(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")
    task = crud_task.get_task(db, task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud_task.delete_task(db, task)
    return None
