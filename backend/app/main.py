from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
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
from fastapi import HTTPException
from fastapi.responses import Response
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
)

# CORS settings: Always allow the frontend domains
origins = [
    "https://clockko.vercel.app",
    "https://clockko-team04-althub-project.vercel.app",
    "https://clockko-team04-althub-project-git-fe-feature-renderhosting-clockko.vercel.app",
    "https://clockko-team04-althub-project-git-main-clockko.vercel.app", 
    "http://localhost:5173",
]

# Also try to read from environment if available
frontend_url = getattr(settings, 'FRONTEND_URL', '')
if frontend_url:
    env_origins = [o.strip() for o in frontend_url.split(',') if o.strip()]
    origins.extend(env_origins)

# Remove duplicates
origins = list(set(origins))

print("🌐 CORS allowed origins:", origins)

# Fallback: allow all origins in production to debug CORS issues
# This is temporary for debugging - should be restricted in production
import logging
logger = logging.getLogger(__name__)

def log_cors_request(origin: str):
    """Log all CORS requests for debugging"""
    logger.info(f"🌐 CORS Request from origin: {origin}")
    print(f"🌐 CORS Request from origin: {origin}")

# More permissive CORS for debugging production issues
allow_credentials = True
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for debugging
    allow_credentials=False,  # Set to False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"]
)

# Add logging middleware to debug CORS requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for debugging"""
    origin = request.headers.get("origin", "No Origin")
    method = request.method
    url = str(request.url)
    
    logger.info(f"📨 {method} {url} from origin: {origin}")
    print(f"📨 {method} {url} from origin: {origin}")
    
    try:
        response = await call_next(request)
        logger.info(f"📤 Response status: {response.status_code}")
        print(f"📤 Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"💥 Request failed: {str(e)}")
        print(f"💥 Request failed: {str(e)}")
        raise

# Custom exception handler to ensure CORS headers on all responses
@app.exception_handler(Exception)
async def custom_exception_handler(request: Request, exc: Exception):
    """
    Custom exception handler that ensures CORS headers are present on error responses.
    """
    import traceback
    import logging
    
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
    
    # Add CORS headers manually to error responses (allow all for debugging)
    origin = request.headers.get("origin")
    if origin:
        log_cors_request(origin)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

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

# Manual CORS preflight handler for debugging
@app.options("/{path:path}")
async def options_handler(path: str, request: Request):
    """Handle CORS preflight requests manually"""
    origin = request.headers.get("origin", "*")
    logger.info(f"🔧 CORS preflight for path: /{path} from origin: {origin}")
    
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "86400"
    return response

# CORS test endpoint
@app.get("/api/cors-test")
def cors_test(request: Request):
    """Simple endpoint to test CORS functionality"""
    origin = request.headers.get("origin", "No Origin")
    return {
        "message": "CORS test successful",
        "origin": origin,
        "timestamp": "2025-10-13T20:00:00Z"
    }

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
