from fastapi import FastAPI, Query
import os
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    auth,
    timetracker,
    tasks,
    users,
    dashboard,
    coworking,
    user_settings,
    two_factor_auth,
    challenges,
    websocket,
)
from app.api import auth_google  # Google ID token verification endpoints
from app.core.config import settings, get_secret
from app.core.database import Base, engine

# Create all tables (if using without Alembic migrations)
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        if not google_client_id:
            import logging
            logging.getLogger("uvicorn.warning").warning(
                "GOOGLE_CLIENT_ID is not set. /api/auth/google/verify will return 500 until configured."
            )
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").error(f"Error checking GOOGLE_CLIENT_ID: {e}")
    
    yield
    # Shutdown


app = FastAPI(
    title="ClockKo API",
    description="Authentication and user management system for ClockKo.",
    version="1.0.0",
    lifespan=lifespan,

# CORS settings: read allowed origins from env via settings.FRONTEND_URL (comma-separated supported)
origins = [o.strip() for o in str(getattr(settings, 'FRONTEND_URL', '')).split(',') if o.strip()] or ["*"]
print("CORS allowed origins:", origins)

allow_credentials = True
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(auth_google.router)  # Already has its prefix defined
app.include_router(timetracker.router, prefix="/api", tags=["time-log"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(coworking.router, prefix="/api", tags=["Coworking"])
app.include_router(user_settings.router)  # Has its own prefix /api/users
app.include_router(two_factor_auth.router, prefix="/api/auth", tags=["Two-Factor Authentication"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(websocket.router, prefix="/api", tags=["websocket"])

# If you have a reminder thread, import and start it here
# from app.reminders import start_reminder_thread
# start_reminder_thread()

# Optional: Health check route


@app.get("/")
def read_root():
    return {"message": "ClockKo API is running"}

# K8s/ECS-friendly health endpoints


@app.get("/health")
@app.get("/healthz")
def health():
    return {"status": "ok", "service": "clockko-api", "version": app.version}

# Mirror health endpoints under /api to align with API Gateway path mapping
@app.get("/api/health")
@app.get("/api/healthz")
def api_health():
    return {"status": "ok", "service": "clockko-api", "version": app.version}


@app.get("/health/google")
def google_health():
    # Prefer the in-memory setting, but if empty, attempt to read from Secrets Manager
    configured = bool(getattr(settings, 'GOOGLE_CLIENT_ID', ''))
    if not configured:
        try:
            secret_name = os.getenv("GOOGLE_OAUTH_SECRET_NAME", "clockko-google-oauth")
            google_creds = get_secret(secret_name) or {}
            configured = bool(google_creds.get("client_id"))
        except Exception:
            configured = False
    return {"google_sign_in_configured": configured}


@app.get("/health/google/details")
def google_health_details():
    """
    Diagnostic endpoint exposing non-sensitive signals to help troubleshoot Google OAuth config.
    Does NOT return any secret values.
    """
    source = "settings"
    configured = bool(getattr(settings, 'GOOGLE_CLIENT_ID', ''))
    region = getattr(settings, 'AWS_REGION', None)
    secret_name = os.getenv("GOOGLE_OAUTH_SECRET_NAME", "clockko-google-oauth")
    error = None
    if not configured:
        try:
            google_creds = get_secret(secret_name)
            configured = bool(google_creds.get("client_id"))
            source = "secretsmanager" if configured else "none"
        except Exception as e:  # pragma: no cover
            source = "error"
            # Return a minimal error shape to avoid leaking internals
            error = str(e).split("\n")[0][:200]
    return {
        "configured": configured,
        "source": source,
        "secret_name": secret_name,
        "region": region,
        "error": error,
    }

