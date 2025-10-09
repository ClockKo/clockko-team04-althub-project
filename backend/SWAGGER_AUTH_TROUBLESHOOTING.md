# Swagger UI Authorization Troubleshooting Guide

## Problem
All protected endpoints return **401 Unauthorized** with "Invalid credentials" even after pasting token in Swagger UI's Authorize dialog.

## Root Cause Investigation

The issue could be one of several things:
1. **Token truncation** - Swagger UI might be cutting off the token
2. **Token format** - HTTPBearer expects just the token, not "Bearer <token>"
3. **Token expiration** - The token might have expired
4. **Token parsing** - The token might not be parsed correctly

## Debugging Steps Added

### 1. Enhanced HTTPBearer Configuration
```python
# app/core/auth.py
security = HTTPBearer(
    scheme_name="Bearer",
    description="Enter your JWT token (the full token, it will be long)",
    auto_error=True
)
```

### 2. Added Debug Logging
The `get_current_user` function now logs:
- Token length received
- Token preview (first 20 + last 20 characters)
- Specific JWT decode errors
- User authentication success

### 3. Better Error Messages
Instead of generic "Invalid credentials", you'll now see:
- "Token missing user ID"
- "User not found"
- "Invalid token: <specific JWT error>"
- "Invalid user ID in token"

## How to Debug

### Step 1: Check Server Auto-Reload
Look at your uvicorn terminal. You should see:
```
INFO: Will watch for changes...
WARNING: WatchFiles detected changes in 'app\core\auth.py'. Reloading...
INFO: Application startup complete.
```

### Step 2: Get Fresh Token
1. Go to http://localhost:8000/docs
2. Find `POST /api/auth/login`
3. Click "Try it out"
4. Enter your credentials:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```
5. Click "Execute"
6. Copy the ENTIRE `access_token` from the response

**IMPORTANT**: Make sure you copy the COMPLETE token. JWT tokens are typically 150-200+ characters long.

### Step 3: Authorize in Swagger
1. Click the green "Authorize" button (top right, or padlock icon)
2. You'll see a field labeled "Value"
3. Paste ONLY the token (not "Bearer <token>", just the token itself)
4. Click "Authorize"
5. Click "Close"

### Step 4: Test Protected Endpoint
1. Try `POST /api/coworking/rooms`
2. Click "Try it out"
3. Enter request body
4. Click "Execute"

### Step 5: Check Logs
Look at your uvicorn terminal. You should see logs like:
```
INFO: Received token length: 164
INFO: Token preview: eyJhbGciOiJIUzI1NiIs...Q4h
INFO: User authenticated: user@example.com
```

## Common Issues & Solutions

### Issue 1: Token Truncated
**Symptom**: Logs show token length < 150 characters
**Solution**: 
- Copy token again carefully
- Check if Swagger UI input field has character limit
- Try using curl or Postman instead

### Issue 2: Token Format Wrong
**Symptom**: JWT decode error in logs
**Solution**:
- Don't include "Bearer " prefix in Swagger
- Make sure token has 3 parts separated by dots (.)
- Verify token isn't wrapped in quotes

### Issue 3: Token Expired
**Symptom**: JWT decode error: "Signature has expired"
**Solution**:
- Login again to get fresh token
- Tokens expire after 7 days

### Issue 4: HTTPBearer Not Working in Swagger
**Symptom**: Authorize button doesn't appear or doesn't work
**Solution**:
- Restart server completely
- Clear browser cache
- Try different browser
- Use curl command instead:
  ```bash
  curl -X POST "http://127.0.0.1:8000/api/coworking/rooms" \
    -H "Authorization: Bearer YOUR_FULL_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"name":"Library","description":"study room","max_participants":10,"color":"blue"}'
  ```

## Alternative: Test with Python Script

If Swagger UI continues to have issues, use this Python script:

```python
import requests

# 1. Login
login = requests.post("http://127.0.0.1:8000/api/auth/login", 
    json={"email": "your-email", "password": "your-password"})
token = login.json()["access_token"]

# 2. Test protected endpoint
headers = {"Authorization": f"Bearer {token}"}
response = requests.post("http://127.0.0.1:8000/api/coworking/rooms",
    headers=headers,
    json={"name":"Library","description":"study room","max_participants":10,"color":"blue"})
    
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

## What to Report

If the issue persists, check the uvicorn logs and report:
1. **Token length** logged
2. **Token preview** (first/last 20 chars)
3. **Exact error message** from logs
4. **HTTP status code** from response
5. **Whether curl works** but Swagger doesn't

## Expected Behavior

✅ **Success logs should show:**
```
INFO: Received token length: 164
INFO: Token preview: eyJhbGciOiJIUzI1NiIs...YEQ4h
INFO: User authenticated: user@example.com
INFO: 127.0.0.1:xxxxx - "POST /api/coworking/rooms HTTP/1.1" 201
```

❌ **Failure logs will show specific error:**
```
ERROR: JWT decode error: Signature verification failed
ERROR: Invalid UUID: badly formed hexadecimal UUID string
ERROR: Authentication error: <specific issue>
```

## Next Steps

1. **Try the debug steps above** and check the uvicorn terminal logs
2. **If you see token truncation** (length < 150), that's the issue
3. **If you see JWT errors**, the token might be corrupted or expired
4. **If curl works** but Swagger doesn't, it's a Swagger UI issue

The debug logging will help us identify exactly what's going wrong!
