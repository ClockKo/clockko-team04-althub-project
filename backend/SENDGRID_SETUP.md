# 🚀 QUICK SENDGRID SETUP FOR PIPEOPS

## 1. Get SendGrid API Key (2 minutes)
1. **Go to**: https://app.sendgrid.com/
2. **Sign up** for free account (100 emails/day free)
3. **Navigate to**: Settings → API Keys
4. **Create API Key** with "Full Access" permissions
5. **Copy the API key** (starts with `SG.`)

## 2. Set Environment Variables in PipeOps
Add these to your PipeOps environment variables:

```bash
# SendGrid (Primary email service)
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@clockko.com
SENDGRID_FROM_NAME=ClockKo Team

# Gmail SMTP (Fallback - keep existing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clockko04@gmail.com
SMTP_PASSWORD=xpgijswtzbdrzmpe
SMTP_FROM=clockko04@gmail.com
SMTP_FROM_NAME=Clockko Team
```

## 3. Deploy Updates
✅ **Requirements.txt updated** (sendgrid==6.11.0 added)
✅ **Email service updated** (SendGrid primary, SMTP fallback)
✅ **bcrypt fixed** (downgraded to 4.1.3)

## 4. Test After Deployment
- User registration should work (bcrypt fixed)
- Emails should send via SendGrid
- If SendGrid fails, automatically falls back to Gmail SMTP

## 🎯 READY TO REDEPLOY!
1. Commit these changes
2. Set SENDGRID_API_KEY in PipeOps
3. Deploy
4. Test registration/email

Your app will now have:
- ✅ **Fixed bcrypt compatibility**
- ✅ **SendGrid email delivery** 
- ✅ **SMTP fallback** if needed
- ✅ **Production-ready email templates**