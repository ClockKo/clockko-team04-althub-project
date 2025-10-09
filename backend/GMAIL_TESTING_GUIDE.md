# Gmail Email Testing Guide

## 🎯 **Why Gmail for Development?**

We use Gmail for email testing because:
- ✅ **Real email delivery** - Test the actual user experience
- ✅ **Production parity** - Same setup as production environment
- ✅ **Reliable delivery** - Gmail's excellent delivery rates
- ✅ **Mobile testing** - Test emails on actual devices
- ✅ **No setup overhead** - Works immediately for all team members

## 📧 **Team Gmail Configuration**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clockko04@gmail.com
SMTP_PASSWORD=xpgijswtzbdrzmpe
SMTP_FROM=clockko04@gmail.com
SMTP_FROM_NAME=ClockKo Team
```

## 🔧 **Best Practices for Email Testing**

### **1. Use Your Personal Email for Testing**
```python
# When testing registration/OTP, always use your own email
test_email = "your.name@gmail.com"  # ✅ Good
test_email = "user@example.com"     # ❌ Bad - email won't deliver
```

### **2. Check Spam/Promotions Folder**
- Gmail may filter test emails to spam
- Check "Promotions" tab in Gmail
- Add clockko04@gmail.com to your contacts

### **3. Rate Limit Awareness**
- Gmail allows 100 emails/day for app passwords
- More than sufficient for development
- If you hit limits, coordinate with team

### **4. Email Organization**
Create Gmail filters to organize test emails:

**Filter Setup:**
1. Go to Gmail Settings → Filters and Blocked Addresses
2. Create new filter:
   - From: clockko04@gmail.com
   - Subject contains: OTP OR Verification OR Welcome
3. Apply label: "ClockKo Development"
4. Skip inbox (optional)

## 🧪 **Testing Email Flows**

### **Registration Testing**
```bash
# Test registration with your email
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@gmail.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### **OTP Testing**
```bash
# Test OTP request
curl -X POST "http://localhost:8000/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@gmail.com"
  }'
```

### **Email Verification Testing**
```bash
# Check your email for verification link
# Click the link or copy the token for verification
```

## 🔍 **Debugging Email Issues**

### **Common Issues & Solutions**

1. **Email not received**
   - Check spam folder
   - Verify email address spelling
   - Check Gmail filters
   - Try a different email address

2. **"Authentication failed" error**
   - Verify SMTP credentials in .env
   - Ensure Gmail app password is correct
   - Check if 2FA is enabled on Gmail account

3. **Emails going to spam**
   - Add clockko04@gmail.com to contacts
   - Mark test emails as "Not Spam"
   - Gmail will learn over time

4. **Rate limit exceeded**
   - Wait 24 hours for reset
   - Coordinate testing with team
   - Use fewer email tests per day

## 📱 **Mobile Email Testing**

### **Testing on Mobile Devices**
1. Send test emails to your mobile email
2. Check how emails display on:
   - iPhone Mail app
   - Gmail mobile app
   - Android default mail
   - Outlook mobile

### **Email Template Testing**
```python
# Test HTML email rendering
html_content = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>ClockKo Email Test</h2>
        <p>This is a test email to verify mobile display.</p>
    </div>
</body>
</html>
"""
```

## 🚀 **Production Considerations**

Since we use Gmail for both development and production:

### **Environment Separation**
- **Development**: Use team Gmail (clockko04@gmail.com)
- **Staging**: Use same team Gmail with different templates
- **Production**: Use production Gmail account

### **Email Templates**
- Add environment indicators in email subjects
- Use different email signatures for dev/staging/prod
- Consider different "from" names per environment

## 🤝 **Team Collaboration Tips**

### **Shared Testing**
- Coordinate email testing in team chat
- Share test results and screenshots
- Document any email delivery issues

### **Email Debugging**
- Share email headers when debugging
- Use verbose SMTP logging in development
- Test with multiple email providers (Gmail, Outlook, Yahoo)

### **Security Notes**
- Keep Gmail app password secure
- Don't commit passwords to git
- Rotate app password periodically
- Use environment variables for all credentials

## 📊 **Email Analytics (Optional)**

Track email delivery success:
```python
import logging

logger = logging.getLogger("email")

def send_email_with_tracking(to_email: str, subject: str, content: str):
    try:
        # Send email
        result = email_service.send_email(to_email, subject, content)
        logger.info(f"Email sent successfully to {to_email} - Subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Email failed to {to_email} - Error: {str(e)}")
        return False
```

---

## ✅ **Summary**

Gmail is an excellent choice for email testing because:
- 🎯 Real email delivery testing
- 📧 Production parity
- 🔒 Reliable and secure
- 🚀 Already working perfectly
- 💯 No additional setup required

Follow this guide for consistent, reliable email testing across your team!
