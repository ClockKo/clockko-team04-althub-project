# Onboarding Implementation Guide

## Overview
The onboarding feature tracks whether a user has completed the initial setup/onboarding process in the frontend application.

## Database Schema

### User Model Field
```python
onboarding_completed = Column(Boolean, default=False, nullable=False)
```

**Default Value**: `False` (new users haven't completed onboarding)

## API Endpoints

### 1. **POST /api/auth/register** - User Registration
**Response includes `onboarding_completed`:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-10-04T12:00:00",
  "is_verified": false,
  "is_active": true,
  "otp_verified": false,
  "onboarding_completed": false  // ← Frontend checks this
}
```

### 2. **POST /api/auth/login** - User Login
**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```
**Note**: After login, frontend should call `/api/auth/me` to get user details including `onboarding_completed`.

### 3. **GET /api/auth/me** - Get Current User
**Response includes `onboarding_completed`:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-10-04T12:00:00",
  "is_verified": false,
  "is_active": true,
  "otp_verified": false,
  "onboarding_completed": false  // ← Check this on every app load
}
```

### 4. **PUT /api/users/me/onboarding** - Mark Onboarding as Complete
**Purpose**: Frontend calls this when user completes onboarding

**Request**: No body needed (could add optional onboarding data)
```json
{}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-10-04T12:00:00",
  "is_verified": false,
  "is_active": true,
  "otp_verified": false,
  "onboarding_completed": true  // ← Now true!
}
```

## Frontend Implementation Flow

### On Registration
```javascript
// 1. User registers
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, password })
});

const userData = await response.json();

// 2. Check onboarding status
if (!userData.onboarding_completed) {
  // Redirect to onboarding flow
  router.push('/onboarding');
} else {
  // Redirect to dashboard
  router.push('/dashboard');
}
```

### On Login
```javascript
// 1. User logs in
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  body: new URLSearchParams({ username: email, password })
});

const { access_token } = await loginResponse.json();
localStorage.setItem('token', access_token);

// 2. Fetch user profile
const meResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const userData = await meResponse.json();

// 3. Check onboarding status
if (!userData.onboarding_completed) {
  // Show onboarding
  router.push('/onboarding');
} else {
  // Show main app
  router.push('/dashboard');
}
```

### On App Load (Protected Routes)
```javascript
// Check on every app load
const userData = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

if (!userData.onboarding_completed && currentRoute !== '/onboarding') {
  // Force user to onboarding
  router.push('/onboarding');
}
```

### When User Completes Onboarding
```javascript
// User completes onboarding steps in frontend
const completeOnboarding = async () => {
  const response = await fetch('/api/users/me/onboarding', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const userData = await response.json();
  
  if (userData.onboarding_completed) {
    // Redirect to main app
    router.push('/dashboard');
  }
};
```

## Backend Implementation Status

### ✅ Already Implemented
- [x] `onboarding_completed` field in User model
- [x] Field included in UserResponse schema
- [x] Field returned in `/api/auth/me` endpoint
- [x] Field returned in registration response

### ⚠️ Missing Implementation
- [ ] **PUT /api/users/me/onboarding** endpoint to mark onboarding complete

## Next Steps

### Create the Complete Onboarding Endpoint

**File**: `app/api/users.py` (or create new endpoint in `app/api/auth.py`)

```python
@router.put("/me/onboarding", response_model=UserResponse)
def complete_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark user's onboarding as completed.
    
    Frontend calls this when user finishes onboarding steps.
    """
    current_user.onboarding_completed = True
    db.commit()
    db.refresh(current_user)
    return UserResponse.from_user_model(current_user)
```

## Testing

### Test Registration Returns Onboarding Status
```bash
POST http://localhost:8000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!"
}

# Expected response includes:
# "onboarding_completed": false
```

### Test Get Me Returns Onboarding Status
```bash
GET http://localhost:8000/api/auth/me
Authorization: Bearer <token>

# Expected response includes:
# "onboarding_completed": false
```

### Test Complete Onboarding
```bash
PUT http://localhost:8000/api/users/me/onboarding
Authorization: Bearer <token>

# Expected response includes:
# "onboarding_completed": true
```

## Database Migration

✅ **No migration needed!** The field is already uncommented in the User model.

If you need to add it to existing users:
```sql
UPDATE users SET onboarding_completed = false WHERE onboarding_completed IS NULL;
```

## Summary

The backend is **almost complete**. You just need to add the **PUT /api/users/me/onboarding** endpoint so the frontend can mark onboarding as complete when the user finishes the setup flow.

All responses already include the `onboarding_completed` field, so the frontend can:
1. ✅ Check it after registration
2. ✅ Check it after login
3. ✅ Check it on app load
4. ⚠️ Mark it complete (needs endpoint to be added)
