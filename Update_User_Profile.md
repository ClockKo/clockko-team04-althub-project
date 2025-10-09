# Update User Profile Endpoint

This endpoint allows users to update their display name (`full_name`) in the backend.  
It should be added to your FastAPI backend in `app/api/users.py` and included in your router.

## Endpoint

**URL:** `/api/users/profile`  
**Method:** `PUT`  
**Auth:** Requires authentication (current user)

## Request Body

```json
{
  "name": "New Name"
}
```

## Response

```json
{
  "id": "user-uuid",
  "name": "New Name",
  "email": "user@example.com",
  ...
}
```

## Example Usage

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Alex Smith"
}
```

## Implementation Steps

1. **Add the endpoint to `app/api/users.py`:**
    - See the code below for reference.
2. **Include the router in your main app:**
    ```python
    from app.api import users
    app.include_router(users.router, prefix="/api/users")
    ```
3. **Ensure `current_user` dependency is set up for authentication.**
4. **Test with an authenticated request.**

## Example FastAPI Endpoint

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserResponse
from app.dependencies import get_db, get_current_user

router = APIRouter()

@router.put("/profile", response_model=UserResponse)
def update_profile(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.full_name = name
    db.commit()
    db.refresh(current_user)
    return UserResponse.from_orm(current_user)
```

## Notes

- This endpoint only updates the user's name (`full_name`).  
- Extend the request body and logic if you want to support avatar or other profile fields.
- Make sure to handle authentication and permissions as needed.

---

**Contact the frontend team for integration details or if you need to support additional fields.**