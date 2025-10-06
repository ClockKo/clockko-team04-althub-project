# Authentication Final Configuration

**Date:** October 6, 2025  
**Status:** ✅ Complete - Login uses JSON, Swagger uses manual token  

---

## Current Setup

### Login Endpoint Configuration

**Endpoint:** `POST /api/auth/login`  
**Format:** JSON (not OAuth2 form)  
**Request Body:**
```json
{
  "email": "onovaemaureen+555@gmail.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## How to Use Swagger UI

### Step 1: Login to Get Token
1. Go to http://localhost:8000/docs
2. Find `POST /api/auth/login`
3. Click "Try it out"
4. Enter JSON body:
```json
{
  "email": "your.email@example.com",
  "password": "your_password"
}
```
5. Click "Execute"
6. **Copy the `access_token`** from response

### Step 2: Authorize in Swagger
1. Click **"Authorize"** button (lock icon at top right)
2. Paste **ONLY the token** (not "Bearer " prefix):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi...
   ```
3. Click "Authorize"
4. Click "Close"

### Step 3: Test Protected Endpoints
Now all your requests will include: `Authorization: Bearer <token>`

---

## For Frontend Development

### Login Request:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const {access_token} = await response.json();
localStorage.setItem('token', access_token);
```

### Authenticated Requests:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/dashboard/shutdown-summary', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Why This Design?

✅ **JSON Login:**
- Consistent with all other endpoints
- Frontend-friendly
- Type-safe with Pydantic validation
- Easy to extend with additional fields

✅ **Manual Token in Swagger:**
- Simple and reliable
- No OAuth2 form complexity
- Works perfectly for API testing
- Frontend teams use direct API calls anyway

---

## Files Modified

1. **`app/api/auth.py`**
   - Login accepts `schema.UserLogin` (JSON)
   - Returns JWT token
   
2. **`app/core/auth.py`**
   - OAuth2PasswordBearer with tokenUrl: `/api/auth/login`
   - Extracts Bearer token from Authorization header

3. **`app/models/user.py`**
   - Removed `is_admin` column (not needed)

---

## All Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login (returns JWT token) |
| `/api/auth/user` | GET | Get current user info |
| `/api/auth/send-verification-email` | POST | Send OTP |
| `/api/auth/verify-email` | POST | Verify email with OTP |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with OTP |
| `/api/auth/user` | PUT | Update user profile |

---

**Status:** ✅ Complete and ready for use!  
**Documentation:** http://localhost:8000/docs
