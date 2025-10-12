from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM
from uuid import UUID

def _extract_bearer_token(request: Request) -> str | None:
    """Extract Bearer token from common header locations.
    Some proxies (API Gateway/ALB) might remap Authorization header.
    """
    # Primary header
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if isinstance(auth, str) and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()

    # AWS may remap the header
    remapped = request.headers.get("x-amzn-remapped-authorization")
    if isinstance(remapped, str) and remapped.lower().startswith("bearer "):
        return remapped.split(" ", 1)[1].strip()

    # Optional: support cookie named Authorization (not required, but handy locally)
    cookie_auth = request.cookies.get("Authorization")
    if isinstance(cookie_auth, str) and cookie_auth.lower().startswith("bearer "):
        return cookie_auth.split(" ", 1)[1].strip()

    return None


def _bearer_token_dependency(request: Request) -> str:
    token = _extract_bearer_token(request)
    if not token:
        # Mirror FastAPI OAuth2PasswordBearer default message for compat with FE handlers
        raise HTTPException(status_code=401, detail="Not authenticated")
    return token


def get_current_user(token: str = Depends(_bearer_token_dependency), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = UUID(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid credentials")


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to verify the current user has admin privileges.
    Raises 403 Forbidden if user is not an admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required. This operation is restricted to administrators only."
        )
    return current_user


async def get_current_user_websocket(token: str, db: Session) -> User:
    """Authenticate user for WebSocket connection"""
    try:
        from app.core.config import settings
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user
