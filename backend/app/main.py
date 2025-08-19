from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, timetracker
from app.core.database import Base, engine

# Create all tables (if using without Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClockKo API",
    description="Authentication and user management system for ClockKo.",
    version="1.0.0",
)


# CORS settings (adjust as needed for frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(timetracker.router, prefix="", tags=["time-log"] )
# app.include_router(user.router, prefix="/user", tags=["User"])
# app.include_router(task.router, prefix="/api/tasks", tags=["Tasks"])

# If you have a reminder thread, import and start it here
# from app.reminders import start_reminder_thread
# start_reminder_thread()

# Optional: Health check route
@app.get("/")
def read_root():
    return {"message": "ClockKo API is running"}
