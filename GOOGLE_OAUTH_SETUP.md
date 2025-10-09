# Google OAuth Setup Guide for Team Members

## 🚀 Quick Setup for Teammates

### 1. Frontend Environment Setup

1. **Copy the environment file:**
   ```bash
   cd frontend/clockko-wellness-app
   cp .env.example .env.local
   ```

2. **Update your `.env.local` file:**
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID="1041621987892-ruan8gh12d87kso2f0adh1amv3mso7ha.apps.googleusercontent.com"
   ```


### 2. Backend Environment Setup

1. **Copy backend environment file:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Update your backend `.env` file:**
   ```env
   # Add Google OAuth settings
   GOOGLE_CLIENT_ID=1041621987892-ruan8gh12d87kso2f0adh1amv3mso7ha.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

### 3. Common Issues & Solutions

#### Issue: "redirect_uri_mismatch" error
**Solution:** Ensure your dev server port matches the authorized origins in Google Console.

#### Issue: "invalid_client" error
**Solution:** 
1. Check your `.env.local` file has the correct `VITE_GOOGLE_CLIENT_ID`
2. Restart your development server after changing environment variables

#### Issue: Google button not working
**Solution:**
1. Clear browser cache and cookies
2. Check browser console for JavaScript errors
3. Ensure you're running on `http://localhost` not file:// protocol

### 5. Development Server Commands

**Frontend:**
```bash
cd frontend/clockko-wellness-app
npm run dev
# Should run on http://localhost:5173
```

**Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload
# Should run on http://localhost:8000
```

### 6. Team Sharing Best Practices

1. **Never commit `.env.local` files** (they're in .gitignore)
2. **Share Google Client ID via secure channels** (Slack DMs, encrypted notes)
3. **Use the same ports consistently** across the team
4. **Document any port changes** in this file

### 7. Testing Google OAuth

To verify Google OAuth is working:

1. Go to `http://localhost:5173/signin`
2. Click "Sign in with Google" button
3. Complete Google authentication flow
4. Should redirect to dashboard on success

### 8. Troubleshooting Checklist

- [ ] `.env.local` file exists with correct `VITE_GOOGLE_CLIENT_ID`
- [ ] Backend `.env` file has Google credentials
- [ ] Development servers running on correct ports
- [ ] Google Console has authorized origins configured
- [ ] Browser allows third-party cookies
- [ ] No ad blockers interfering with Google services

## 🆘 Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify your environment variables: `console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)`
3. Contact the project maintainer with specific error messages

---
**Last Updated:** October 2025