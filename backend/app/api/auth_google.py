from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserResponse

# Google auth libs
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
except Exception as e:  # pragma: no cover
    id_token = None  # type: ignore
    google_requests = None  # type: ignore

router = APIRouter(prefix="/api/auth/google", tags=["auth", "google"])


class GoogleToken(BaseModel):
    token: str


@router.post("/verify", response_model=dict)
def verify_google_id_token(body: GoogleToken, db: Session = Depends(get_db)):
    """
    Verify a Google ID token (from Google Sign-In on the client). If valid:
    - Find or create a User by email
    - Return a minimal user payload with 'name' and 'email' (matching FE expectations)
    Note: This endpoint does NOT create our own JWT yet; we will extend later if needed.
    """
    if id_token is None or google_requests is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="google-auth library is not available. Please install 'google-auth'.",
        )

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_CLIENT_ID is not configured on the server",
        )

    try:
        request = google_requests.Request()
        info = id_token.verify_oauth2_token(body.token, request, settings.GOOGLE_CLIENT_ID)
        # info contains fields like: email, email_verified, name, picture, sub, aud, iss, exp
    except ValueError as err:
        # Log reason in debug mode for easier troubleshooting (audience mismatch, expired, wrong issuer, etc.)
        if getattr(settings, "DEBUG", False):
            import logging

            logging.getLogger("uvicorn.error").warning("Google token verification failed: %s", str(err))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")

    email: Optional[str] = info.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token missing email")

    # Derive a display name
    display_name: str = info.get("name") or email.split("@")[0]

    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Ensure unique username from email local-part
        base_username = email.split("@")[0]
        unique_username = base_username
        suffix = 1
        while db.query(User).filter(User.username == unique_username).first() is not None:
            suffix += 1
            unique_username = f"{base_username}{suffix}"

        user = User(email=email, username=unique_username, full_name=display_name, is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Return normalized response matching FE shape
    payload = UserResponse.from_user_model(user).model_dump()
    return {"user": payload}
