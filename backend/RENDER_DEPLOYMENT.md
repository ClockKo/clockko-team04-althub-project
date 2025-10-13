# ClockKo Backend - Render Deployment Guide

## Quick Deploy to Render

### 1. Database Setup

- Create a PostgreSQL database in Render Dashboard
- Name: `clockko-postgres`
- Plan: Starter or higher
- Note the connection string

### 2. Web Service Setup

- Connect your GitHub repository
- Service type: Web Service
- Environment: Python 3
- Build Command: `pip install -r requirements.txt`
- Start Command: `./start.sh` (includes migrations)
- Health Check Path: `/health`

### 3. Environment Variables

Set these in Render Dashboard:

**Required:**

```text
DATABASE_URL=<auto-populated from database>
SECRET_KEY=<generate secure random string>
FRONTEND_URL=https://your-frontend-app.onrender.com
```

**Email (Gmail SMTP):**

```text
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-gmail@gmail.com
SMTP_FROM_NAME=ClockKo Team
```

**Optional:**

```text
DEBUG=false
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 4. Domain Configuration

- Your API will be available at: `https://your-service-name.onrender.com`
- Update FRONTEND_URL to match your frontend deployment
- Update CORS settings if needed

### 5. Database Migrations

The `start.sh` script automatically runs Alembic migrations on startup.

### 6. Health Checks

Render will monitor these endpoints:

- `/health` - Main health check
- `/healthz` - Kubernetes-style health check
- `/api/health` - API-prefixed health check

## Deployment Checklist

- [ ] PostgreSQL database created in Render
- [ ] Environment variables configured
- [ ] GitHub repository connected
- [ ] Build and start commands set
- [ ] Health check path configured
- [ ] CORS origins updated for production
- [ ] Email credentials configured
- [ ] Google OAuth credentials set (if using)

## Production Considerations

1. **Security**: Generate strong SECRET_KEY
2. **Database**: Use Starter Plus or Professional plan for production
3. **Monitoring**: Enable Render's logging and monitoring
4. **Scaling**: Consider Professional plan for auto-scaling
5. **Backup**: Enable database backups in Render

## Testing Deployment

After deployment, test these endpoints:

- `GET /health` - Should return `{"status": "ok"}`
- `GET /api/auth/health` - Should confirm auth is working
- `POST /api/auth/register` - Test user registration

## Troubleshooting

**Database Connection Issues:**

- Verify DATABASE_URL format
- Check PostgreSQL database is running
- Ensure SSL is configured (`sslmode=require`)

**Migration Failures:**

- Check logs for Alembic errors
- Verify database permissions
- Ensure latest migration files are committed

**CORS Errors:**

- Update FRONTEND_URL environment variable
- Verify frontend domain is correct
- Check CORS middleware configuration
