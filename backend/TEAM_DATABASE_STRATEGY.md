# ClockKo Backend - Team Database Collaboration Strategy

## 🎯 **Overview**
This document outlines the database collaboration strategy for the ClockKo backend team to ensure smooth multi-developer workflow.

## 📁 **Files Created for Team Collaboration**

### **Setup Files**
- `TEAM_SETUP_GUIDE.md` - Complete setup guide for new team members
- `.env.team` - Environment template for team members
- `docker-compose.dev.yml` - Docker environment for consistent development
- `scripts/setup_team_database.ps1` - Automated database setup script
- `scripts/manage_database.py` - Database management utilities

### **Documentation**
- `TEAM_DATABASE_WORKFLOW.md` - Database workflow guidelines
- `scripts/init-multiple-db.sh` - Docker database initialization

## 🔧 **Current Setup Status**

### ✅ **Completed**
- **Clean migration state**: Single migration `775be2096a27` applied
- **All models included**: Users, UserSettings, Tasks, TimeLogs
- **Team .gitignore**: Updated with collaboration-specific exclusions
- **Docker environment**: PostgreSQL, Redis, pgAdmin, MailHog
- **Management scripts**: Database backup, reset, seeding utilities

### 📊 **Database Schema**
```
Current Migration: 775be2096a27 (head)
Tables Created:
- users (with Google OAuth fields ready)
- user_settings 
- tasks
- time_logs (renamed from task_time_logs for clarity)
- alembic_version
```

## 🚀 **For New Team Members**

### **Quick Start**
```bash
# 1. Clone and setup
git clone <repo-url>
cd clockko-team04-althub-project/backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Database setup
python scripts/manage_database.py create-dev YourName

# 3. Apply migrations
alembic upgrade head

# 4. Start development
uvicorn app.main:app --reload
```

### **Using Docker (Recommended)**
```bash
# Start team development environment
docker-compose -f docker-compose.dev.yml up -d

# Access services:
# - pgAdmin: http://localhost:5050
# - MailHog: http://localhost:8025
# - API: http://localhost:8000/docs
```

## 🔄 **Daily Workflow**

### **Start of Day**
```bash
git pull origin main
alembic upgrade head  # Apply any new migrations
```

### **Making Database Changes**
```bash
# 1. Modify models in app/models/
# 2. Generate migration
alembic revision --autogenerate -m "descriptive message"
# 3. Review and test migration
# 4. Commit and push
```

### **End of Day**
```bash
git add .
git commit -m "your changes"
git push origin your-branch
```

## 🛠️ **Database Management Commands**

```bash
# Check migration status
python scripts/manage_database.py status

# Create developer database
python scripts/manage_database.py create-dev JohnDoe

# Backup database
python scripts/manage_database.py backup

# Reset database (with backup)
python scripts/manage_database.py reset --with-seed

# Seed test data
python scripts/manage_database.py seed
```

## 🔒 **Security & Environment**

### **Environment Files**
- `.env` - Your personal environment (NOT committed)
- `.env.team` - Team template (committed)
- `.env.dev_*` - Auto-generated developer configs (NOT committed)

### **Database Naming Convention**
- `clockko_dev_yourname` - Personal development database
- `clockko_test` - Automated testing
- `clockko_staging` - Shared staging environment
- `clockko_production` - Production database

## 📋 **Conflict Prevention**

### **Migration Conflicts**
- Always pull before creating migrations
- Use descriptive migration messages
- Test migrations on fresh database
- Coordinate major schema changes

### **Environment Conflicts**
- Each developer has own database
- Use Docker for consistency
- Share credentials through secure channels
- Document environment changes

## 🎭 **Development Services**

### **Available Tools**
- **pgAdmin**: Database management UI
- **MailHog**: Email testing (no real emails sent)
- **Redis**: Caching and session storage
- **API Docs**: Auto-generated at `/docs`

### **Service URLs**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- pgAdmin: http://localhost:5050
- MailHog: http://localhost:8025

## 🆘 **Troubleshooting**

### **Common Issues**
```bash
# Migration conflicts
git pull origin main
alembic upgrade head

# Database connection issues
docker-compose -f docker-compose.dev.yml restart postgres

# Environment issues
cp .env.team .env  # Update with your values

# Clean slate
python scripts/manage_database.py reset --with-seed
```

## 🤝 **Team Communication**

### **Before Making Changes**
- Discuss major schema changes
- Coordinate migration timing
- Share environment updates

### **When Issues Arise**
- Check this documentation first
- Search existing issues
- Ask in team chat
- Contact team lead if needed

## 📈 **Next Steps**

### **Immediate**
1. Team members follow `TEAM_SETUP_GUIDE.md`
2. Test Docker environment setup
3. Verify migration workflow
4. Establish communication channels

### **Future Enhancements**
- CI/CD pipeline integration
- Automated testing in Docker
- Staging environment setup
- Production deployment strategy

---

**Status**: ✅ Ready for team collaboration  
**Last Updated**: September 9, 2025  
**Migration Version**: 775be2096a27
