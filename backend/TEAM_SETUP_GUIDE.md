# ClockKo Backend - Team Setup Guide

## 🚀 Quick Start for New Team Members

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Git
- Docker (optional)

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd clockko-team04-althub-project/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

#### Option A: Use Team Docker Environment (Recommended)
```bash
# Start all services (PostgreSQL, Redis, pgAdmin)
docker-compose -f docker-compose.dev.yml up -d

# Your database will be: clockko_dev_yourname
# pgAdmin: http://localhost:5050 (admin@clockko.dev / clockko_admin)
```

#### Option B: Local PostgreSQL Setup
```bash
# Run the team setup script
./scripts/setup_team_database.ps1 -DeveloperName "YourName"

# Or manually:
createdb clockko_dev_yourname
```

### 3. Environment Configuration

```bash
# Copy team environment template
cp .env.team .env

# Update your .env file:
DATABASE_URL=postgresql://postgres:password@localhost:5432/clockko_dev_yourname
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clockko04@gmail.com
SMTP_PASSWORD=xpgijswtzbdrzmpe
SMTP_FROM=clockko04@gmail.com

# For email testing, use your personal email address
# Check GMAIL_TESTING_GUIDE.md for testing best practices
```

### 4. Database Migration

```bash
# Apply migrations
alembic upgrade head

# Seed test data (optional)
python scripts/seed_database.py
```

### 5. Start Development Server

```bash
uvicorn app.main:app --reload
```

## 📋 Team Workflow

### Daily Workflow
```bash
# Start of day
git pull origin main
alembic upgrade head

# End of day
git add .
git commit -m "your changes"
git push origin your-branch
```

### Making Database Changes

1. **Modify models** in `app/models/`
2. **Generate migration:**
   ```bash
   alembic revision --autogenerate -m "descriptive message"
   ```
3. **Review migration file** in `alembic/versions/`
4. **Test migration:**
   ```bash
   alembic upgrade head
   alembic downgrade -1  # Test rollback
   alembic upgrade head  # Re-apply
   ```
5. **Commit and push**

### Testing
```bash
# Run all tests
pytest

# Run specific test file
pytest app/tests/test_authentication.py

# Run with coverage
pytest --cov=app
```

## 🔧 Development Tools

### Available Services
- **API Documentation:** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5050
- **pgAdmin (Database Management):** http://localhost:5050
- **Redis Insight:** Install separately if needed

### Useful Commands
```bash
# Check current migration status
alembic current

# See migration history
alembic history

# Create test data
python scripts/seed_database.py

# Backup your database
python scripts/backup_database.py

# Reset database (careful!)
python scripts/reset_database.py
```

## 🐛 Common Issues

### Migration Conflicts
```bash
# If you get migration conflicts:
1. Pull latest changes
2. Resolve conflicts in migration files
3. Test merged migration
4. Update migration dependencies if needed
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running:
pg_isready -h localhost -p 5432

# Reset your database:
dropdb clockko_dev_yourname
createdb clockko_dev_yourname
alembic upgrade head
```

### Environment Issues
```bash
# Verify environment setup:
python -c "from app.core.config import settings; print('Config loaded successfully')"
```

## 📚 Project Structure

```
backend/
├── app/
│   ├── api/            # API endpoints
│   ├── core/           # Core functionality (auth, config, etc.)
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   └── tests/          # Test files
├── alembic/            # Database migrations
├── scripts/            # Utility scripts
└── requirements.txt    # Dependencies
```

## 🤝 Team Communication

- **Before major changes:** Discuss with team lead
- **Database changes:** Always test and review migrations
- **Environment issues:** Check team chat or this guide
- **New features:** Create feature branch, test thoroughly

## 📞 Need Help?

1. Check this guide first
2. Search existing issues/discussions
3. Ask in team chat
4. Contact team lead

Happy coding! 🚀
