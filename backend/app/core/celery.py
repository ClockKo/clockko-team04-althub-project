from celery import Celery
import os

celery_app = Celery(
    "clockko",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    include=["app.services.taskservice"],
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    enable_utc=True,
    timezone="UTC"
)
celery_app.conf.update(
    enable_utc=True,
    timezone="UTC",
)
