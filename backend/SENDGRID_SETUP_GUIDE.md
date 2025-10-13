# SendGrid Integration Setup Guide

This guide will help you set up SendGrid for reliable email delivery in your ClockKo application.

## 📋 Prerequisites

- SendGrid account (free tier available)
- Verified sender email address
- API key with Email Send permissions

## 🚀 Quick Setup

### Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day)
3. Verify your email address

### Step 2: Set Up Sender Authentication

#### Option A: Single Sender Verification (Easiest)
1. Navigate to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender**
3. Fill in your details:
   - **From Name**: `ClockKo Team`
   - **From Email**: `clockko04@gmail.com` (or your verified email)
   - **Reply To**: Same as From Email
   - **Company**: ClockKo
4. Click **Create** and verify the email

#### Option B: Domain Authentication (Recommended for Production)
1. Navigate to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Add your domain (e.g., `clockko.com`)
3. Follow DNS configuration instructions
4. Verify domain ownership

### Step 3: Generate API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Select these permissions:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access (optional)
5. Name your key: `ClockKo-Production` or `ClockKo-Development`
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)

### Step 4: Update Environment Variables

#### Development (.env)
```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=clockko04@gmail.com
SENDGRID_FROM_NAME=ClockKo Team
```

#### Production (Render Environment Variables)
Add these to your Render dashboard:
```bash
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=clockko04@gmail.com
SENDGRID_FROM_NAME=ClockKo Team
```

### Step 5: Test Email Functionality

Run this test script to verify your setup:

```python
from app.services.sendgrid_service import sendgrid_service

# Test SendGrid configuration
if sendgrid_service.is_available():
    print("✅ SendGrid is properly configured")
    
    # Send test email
    success = sendgrid_service.send_email(
        to_email="your-test-email@example.com",
        subject="Test Email from ClockKo",
        html_content="<h1>Hello from ClockKo!</h1><p>SendGrid is working correctly.</p>",
        text_content="Hello from ClockKo! SendGrid is working correctly."
    )
    
    if success:
        print("✅ Test email sent successfully!")
    else:
        print("❌ Failed to send test email")
else:
    print("❌ SendGrid is not configured correctly")
```

## 📧 Email Service Priority

Your email service now uses this priority order:

1. **SendGrid** (Primary - reliable delivery)
2. **Resend** (Secondary - backup service)
3. **SMTP** (Fallback - Gmail/MailHog)

## 🔧 Configuration Details

### Email Types Supported

- ✅ OTP verification emails
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ Task notifications
- ✅ System alerts

### Rate Limits

- **Free Tier**: 100 emails/day
- **Essentials Plan**: 40,000 emails/month ($14.95)
- **Pro Plan**: 100,000 emails/month ($89.95)

## 🚨 Troubleshooting

### Common Issues

#### API Key Issues
```bash
# Error: "The provided authorization grant is invalid, expired, or revoked"
# Solution: Generate a new API key with correct permissions
```

#### Sender Issues
```bash
# Error: "The from address does not match a verified Sender Identity"
# Solution: Verify your sender email in SendGrid dashboard
```

#### Rate Limit Issues
```bash
# Error: "Rate limit exceeded"
# Solution: Upgrade your SendGrid plan or implement email queuing
```

### Debug Mode

Enable debug logging in your `.env`:
```bash
DEBUG=True
```

This will log detailed email sending information.

## 📊 Monitoring

### SendGrid Dashboard

Monitor your email delivery:

1. **Activity Feed**: Real-time email status
2. **Statistics**: Delivery rates and metrics
3. **Suppressions**: Bounced/blocked emails

### Application Logs

Check your application logs for:
```
✅ Email sent successfully via SendGrid to user@example.com
⚠️ SendGrid failed, trying Resend
❌ Failed to send email via SendGrid: [error details]
```

## 🔐 Security Best Practices

1. **API Key Storage**: Never commit API keys to version control
2. **Key Rotation**: Rotate API keys periodically
3. **Permissions**: Use restricted access with minimal permissions
4. **Environment Separation**: Use different keys for dev/prod

## 📚 Additional Resources

- [SendGrid Python Library Docs](https://github.com/sendgrid/sendgrid-python)
- [SendGrid API Reference](https://docs.sendgrid.com/api-reference)
- [Email Best Practices](https://docs.sendgrid.com/ui/sending-email/sender-verification)

## ✅ Deployment Checklist

Before deploying to production:

- [ ] SendGrid account created and verified
- [ ] Sender authentication completed
- [ ] API key generated with correct permissions
- [ ] Environment variables set in production
- [ ] Test email sent successfully
- [ ] Email templates reviewed
- [ ] Rate limits understood
- [ ] Monitoring configured

---

**Need help?** Check the [SendGrid Support Center](https://support.sendgrid.com/) or contact the development team.