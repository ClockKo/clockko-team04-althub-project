# ClockKo Backend Team Database Workflow

## 🎯 **Quick Start for New Developers**

### **1. Initial Setup**
```powershell
# Clone the repository
git clone https://github.com/ClockKo/clockko-team04-althub-project.git
cd clockko-team04-althub-project/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set up your personal database
.\scripts\setup_dev_database.ps1 -DeveloperName "YourName"
# OR on Linux/Mac: ./scripts/setup_dev_database.sh

# Copy your environment file
Copy-Item .env.local .env

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

## 🗄️ **Database Collaboration Rules**

### **DO's ✅**
- ✅ **Use your own development database** (clockko_dev_yourname)
- ✅ **Always run migrations after pulling changes**
- ✅ **Test migrations on fresh database before committing**
- ✅ **Use descriptive migration messages**
- ✅ **Review generated migration files**
- ✅ **Keep database schema changes in separate commits**

### **DON'Ts ❌**
- ❌ **Never manually edit database schema**
- ❌ **Never commit .env files**
- ❌ **Never delete migration files**
- ❌ **Never skip migration generation for schema changes**
- ❌ **Never use production database for testing**

## 🔄 **Daily Workflow**

### **Start of Day**
```powershell
# Pull latest changes
git pull origin main

# Update database with latest migrations
alembic upgrade head

# Check migration status
alembic current
```

### **Making Schema Changes**
```powershell
# 1. Create feature branch
git checkout -b feature/add-user-preferences

# 2. Modify models in app/models/
# (Make your changes)

# 3. Generate migration
alembic revision --autogenerate -m "add user preferences table"

# 4. Review migration file in alembic/versions/
# Check for:
# - Data loss operations
# - Index creation/deletion
# - Foreign key constraints

# 5. Test migration
alembic upgrade head

# 6. Test rollback (optional but recommended)
alembic downgrade -1
alembic upgrade head

# 7. Run tests
pytest

# 8. Commit changes
git add .
git commit -m "feat: add user preferences table with migration"
git push origin feature/add-user-preferences
```

### **End of Day**
```powershell
# Ensure all changes are committed
git status

# Push your branch
git push origin your-branch-name
```

## 🔧 **Migration Conflict Resolution**

### **When Migrations Conflict:**

1. **Coordinate with team** - Check if someone else is working on schema changes
2. **Rename conflicting migrations** using sequential numbers:
   ```
   001_user_table.py
   002_task_table.py  
   003_your_changes.py
   ```
3. **Update dependencies** in migration files:
   ```python
   down_revision = '002_task_table'  # Previous migration
   ```
4. **Test merged migrations** on fresh database

### **If You See Migration Errors:**
```powershell
# Check current migration state
alembic current

# Check migration history
alembic history

# If needed, downgrade to specific revision
alembic downgrade revision_id

# Then upgrade to latest
alembic upgrade head
```

## 🐳 **Docker Setup (Optional)**

For consistent environments across team:

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: clockko_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```powershell
# Start database
docker-compose -f docker-compose.dev.yml up -d postgres

# Your app connects to localhost:5432 as usual
```

## 🧪 **Testing Guidelines**

### **Before Committing Schema Changes:**
```powershell
# 1. Test with fresh database
dropdb clockko_test
createdb clockko_test
set DATABASE_URL=postgresql://postgres:password@localhost:5432/clockko_test
alembic upgrade head

# 2. Run all tests
pytest

# 3. Test key endpoints
curl http://localhost:8000/docs

# 4. Test migration rollback
alembic downgrade -1
alembic upgrade head
```

## 📋 **Environment Variables**

### **Required for Development:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/clockko_dev_yourname
SECRET_KEY=dev-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clockko04@gmail.com
SMTP_PASSWORD=your-app-password  # For AWS, use Secrets Manager via Terraform
SMTP_FROM=clockko04@gmail.com
```

### **Environment Files:**
- `.env.local` - Your personal generated file
- `.env` - Active environment file (gitignored)
- `.env.example` - Template file (committed to git)

## 🆘 **Common Issues & Solutions**

### **"No module named 'app'" in migrations**
```powershell
# Ensure you're in the backend directory
cd backend

# Check Python path
echo $env:PYTHONPATH
set PYTHONPATH=.
```

### **Migration conflicts**
```powershell
# List migrations
alembic history

# Check current state
alembic current

# Reset to specific revision
alembic downgrade revision_id
```

### **Database connection issues**
```powershell
# Test PostgreSQL connection
psql -U postgres -c "SELECT 1;"

# Check database exists
psql -U postgres -c "\l" | findstr clockko
```

## 👥 **Team Communication**

### **Before Major Schema Changes:**
1. **Announce in team chat** - "Working on user preferences schema"
2. **Coordinate timing** - Avoid simultaneous schema changes
3. **Review together** - Have someone review migration files
4. **Test together** - Verify migrations work on different environments

### **Migration Naming Convention:**
```
YYYY-MM-DD_descriptive_name.py
001_initial_tables.py
002_add_user_preferences.py
003_add_task_relationships.py
```

## 🚀 **Production Deployment**

### **Before Production Deploy:**
1. **Test all migrations** on staging database
2. **Backup production database**
3. **Test rollback procedures**
4. **Coordinate with team** for deployment timing

This workflow ensures smooth collaboration while maintaining database integrity! 🎯
