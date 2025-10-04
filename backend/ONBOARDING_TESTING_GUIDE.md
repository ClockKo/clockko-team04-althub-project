# Onboarding API Testing Guide

## Quick Reference

The onboarding system is now **fully implemented** and ready to test!

## Endpoints

### 1. Registration (includes onboarding status)
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-10-04T...",
  "is_verified": false,
  "is_active": true,
  "otp_verified": false,
  "onboarding_completed": false  ← Check this!
}
```

### 2. Login
```
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=john@example.com&password=SecurePass123!

Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### 3. Get Current User (check onboarding status)
```
GET /api/auth/me
Authorization: Bearer <access_token>

Response:
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-10-04T...",
  "is_verified": false,
  "is_active": true,
  "otp_verified": false,
  "onboarding_completed": false  ← Initially false
}
```

### 4. **NEW!** Complete Onboarding
```
PUT /api/auth/me/complete-onboarding
Authorization: Bearer <access_token>

(No request body needed)

Response:
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-10-04T...",
  "is_verified": false,
  "is_active": true,
  "otp_verified": false,
  "onboarding_completed": true  ← Now true!
}
```

## Testing Flow in Swagger UI

### Step 1: Register a New User
1. Go to http://localhost:8000/docs
2. Find `POST /api/auth/register`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Test123!"
   }
   ```
5. Click "Execute"
6. ✅ **Verify response has `"onboarding_completed": false`**

### Step 2: Login
1. Find `POST /api/auth/login`
2. Click "Try it out"
3. Enter:
   - username: `test@example.com`
   - password: `Test123!`
4. Click "Execute"
5. ✅ **Copy the `access_token` from response**

### Step 3: Authenticate in Swagger
1. Click the "Authorize" button at the top
2. Enter: `Bearer <paste_token_here>`
3. Click "Authorize"
4. Click "Close"

### Step 4: Check Current User
1. Find `GET /api/auth/me`
2. Click "Try it out"
3. Click "Execute"
4. ✅ **Verify `"onboarding_completed": false`**

### Step 5: Complete Onboarding
1. Find `PUT /api/auth/me/complete-onboarding`
2. Click "Try it out"
3. Click "Execute"
4. ✅ **Verify `"onboarding_completed": true`**

### Step 6: Verify Status Persists
1. Go back to `GET /api/auth/me`
2. Click "Execute" again
3. ✅ **Verify `"onboarding_completed": true` (still true!)**

## Frontend Integration

### After Registration
```javascript
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
});

const user = await registerResponse.json();

if (!user.onboarding_completed) {
  // Redirect to onboarding flow
  window.location.href = '/onboarding';
} else {
  // Already completed (shouldn't happen on registration)
  window.location.href = '/dashboard';
}
```

### After Login
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    username: email,
    password: password
  })
});

const { access_token } = await loginResponse.json();
localStorage.setItem('token', access_token);

// 2. Get user profile
const userResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const user = await userResponse.json();

// 3. Check onboarding
if (!user.onboarding_completed) {
  window.location.href = '/onboarding';
} else {
  window.location.href = '/dashboard';
}
```

### When User Finishes Onboarding
```javascript
const completeOnboarding = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/auth/me/complete-onboarding', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const user = await response.json();
  
  if (user.onboarding_completed) {
    // Success! Redirect to main app
    window.location.href = '/dashboard';
  }
};
```

## Expected Behavior

### New User Registration Flow
1. User registers → `onboarding_completed = false`
2. Frontend sees `false` → shows onboarding
3. User completes onboarding steps
4. Frontend calls `/api/auth/me/complete-onboarding`
5. Backend updates → `onboarding_completed = true`
6. Frontend redirects to dashboard

### Returning User Login Flow
1. User logs in
2. Frontend calls `/api/auth/me`
3. If `onboarding_completed = true` → go to dashboard
4. If `onboarding_completed = false` → go to onboarding

## Database State

All new users will have:
```sql
onboarding_completed = false
```

After calling the complete endpoint:
```sql
onboarding_completed = true
```

You can manually check/update in database:
```sql
-- Check status
SELECT email, onboarding_completed FROM users;

-- Manually mark as complete (for testing)
UPDATE users SET onboarding_completed = true WHERE email = 'test@example.com';

-- Reset for testing
UPDATE users SET onboarding_completed = false WHERE email = 'test@example.com';
```

## Summary

✅ **All endpoints ready**
✅ **Registration returns onboarding status**
✅ **Login + /me returns onboarding status**
✅ **Complete onboarding endpoint added**
✅ **Ready for frontend integration**

The backend is **100% ready** for the onboarding flow!
