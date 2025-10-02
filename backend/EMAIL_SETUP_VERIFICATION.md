# Email Setup Verification Guide

## ✅ **Requirements Check**

All email dependencies are included in `requirements.txt` and will be installed automatically:

- ✅ `email-validator==2.3.0` - Email validation
- ✅ Built-in Python libraries: `smtplib`, `ssl`, `email.mime.*`
- ✅ `python-dotenv==1.1.1` - Environment variable loading

## ✅ **Installation Steps**

1. **Clone the repository**
2. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```
3. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure .env file with real SMTP credentials:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_real_email@gmail.com
   SMTP_PASSWORD=your_app_password_or_real_password
   SMTP_FROM=your_real_email@gmail.com
   SMTP_FROM_NAME=ClockKo Team
   ```

## 🔧 **Gmail Setup (if using Gmail)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this app password in `SMTP_PASSWORD`

## ✅ **Test Email Configuration**

Use this endpoint to test your email setup:
```bash
curl -X GET "http://127.0.0.1:8000/api/auth/test-email-config"
```

Expected response:
```json
{
  "smtp_configured": true,
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "your_email@gmail.com",
  "message": "SMTP configuration appears valid"
}
```

## 🚨 **Common Issues & Solutions**

### Issue: "SMTP configuration is incomplete"
**Solution:** Make sure all SMTP variables are set in `.env`:
- `SMTP_HOST`
- `SMTP_PORT` 
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

### Issue: "Authentication failed"
**Solution:** 
- For Gmail: Use App Password, not regular password
- Enable 2FA first, then generate App Password

### Issue: "Connection refused"
**Solution:**
- Check firewall/network settings
- Verify SMTP_HOST and SMTP_PORT are correct

### Issue: Registration works but no email sent
**Solution:**
- Check server logs for detailed error messages
- Test email config with the test endpoint above
- Verify email credentials are correct

## ✅ **Verification**

After setup, test registration:
1. Start the server: `uvicorn app.main:app --reload`
2. Register a new user via `/api/auth/register`
3. Check email inbox for OTP
4. Check server logs for any error messages

If registration creates the user but doesn't send email, the issue is in the SMTP configuration, not the code dependencies.