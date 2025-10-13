# 🚨 PipeOps Deployment Fixes

## Issues Found in Logs:

### 1. **bcrypt Version Compatibility Error**
```
(trapped) error reading bcrypt version
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**Root Cause**: `bcrypt==4.3.0` is incompatible with `passlib==1.7.4`

**Fix Applied**: Updated `requirements.txt`:
- Changed `bcrypt==4.3.0` → `bcrypt==4.1.3`
- Changed `passlib==1.7.4` → `passlib[bcrypt]==1.7.4`

### 2. **SMTP Network Unreachable Error**
```
Failed to create SMTP connection: [Errno 101] Network is unreachable
❌ Failed to send email to mahreeam@gmail.com
```

**Root Cause**: PipeOps container networking or Gmail SMTP configuration issue

**Solutions**:

#### Option A: Use Gmail App Password (Recommended)
1. **Enable 2FA** on Gmail account
2. **Generate App Password**: Google Account → Security → 2-Step Verification → App passwords
3. **Use App Password** instead of regular password

#### Option B: Use Alternative SMTP Provider
If Gmail is blocked, use SendGrid, Mailgun, or other SMTP services:

```bash
# SendGrid SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# Mailgun SMTP
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-user
SMTP_PASSWORD=your-mailgun-smtp-password
```

#### Option C: Disable Email in Production (Temporary)
Add environment variable to disable email:
```bash
DISABLE_EMAIL=true
```

## 🔧 **Immediate Actions:**

### 1. **Update Dependencies**
Redeploy with the fixed `requirements.txt`

### 2. **Fix Email Configuration**
Update these environment variables in PipeOps:

```bash
# Use Gmail App Password
SMTP_USER=clockko04@gmail.com
SMTP_PASSWORD=xpgijswtzbdrzmpe  # This should be an App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Or use alternative SMTP provider
```

### 3. **Network Troubleshooting**
If Gmail is still blocked, check PipeOps network policies:
- Ensure outbound SMTP (port 587) is allowed
- Check if Gmail SMTP is whitelisted
- Consider using PipeOps-recommended email service

## 🚀 **Quick Fix Deployment:**

1. **Commit the fixed `requirements.txt`**
2. **Update environment variables** in PipeOps dashboard
3. **Redeploy** the service
4. **Test** registration to confirm bcrypt fix works
5. **Test** email functionality

## ✅ **Verification Steps:**

After redeployment, test:
- ✅ User registration (bcrypt should work)
- ✅ Password hashing (no more bcrypt errors)
- ✅ Email sending (SMTP connection should work)
- ✅ Login functionality (JWT tokens)

## 📞 **If Issues Persist:**

1. **Check PipeOps logs** for new error messages
2. **Verify network policies** allow SMTP connections
3. **Try alternative SMTP provider** (SendGrid/Mailgun)
4. **Contact PipeOps support** about SMTP connectivity

The authentication and core app functionality should work now - email is the only remaining issue that may need alternative SMTP provider.