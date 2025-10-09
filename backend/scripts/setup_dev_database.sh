#!/bin/bash
# setup_dev_database.sh
# Database setup script for ClockKo team members

set -e

echo "🗄️ ClockKo Database Setup for Development"
echo "=========================================="

# Get developer name
read -p "Enter your name (for database naming): " DEV_NAME
if [ -z "$DEV_NAME" ]; then
    echo "❌ Developer name is required"
    exit 1
fi

# Convert to lowercase and remove spaces
DB_NAME="clockko_dev_$(echo $DEV_NAME | tr '[:upper:]' '[:lower:]' | tr -d ' ')"

echo "📝 Creating database: $DB_NAME"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL and try again."
    exit 1
fi

# Create database
if createdb "$DB_NAME" 2>/dev/null; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "⚠️  Database '$DB_NAME' already exists or creation failed"
    read -p "Do you want to drop and recreate it? (y/N): " RECREATE
    if [[ $RECREATE =~ ^[Yy]$ ]]; then
        dropdb "$DB_NAME" && createdb "$DB_NAME"
        echo "✅ Database '$DB_NAME' recreated"
    fi
fi

# Create .env.local file
cat > .env.local << EOF
# Database Configuration for $DEV_NAME
DATABASE_URL=postgresql://postgres:password@localhost:5432/$DB_NAME

# Copy other settings from .env.example
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (use shared test credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clockko04@gmail.com
# For local-only testing, set your personal Gmail App Password here or via environment
# Do NOT commit real passwords; in AWS we read SMTP_PASSWORD from Secrets Manager
SMTP_PASSWORD=your-app-password
SMTP_FROM=clockko04@gmail.com
SMTP_FROM_NAME=Clockko Team

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# Application Configuration
DEBUG=True
APP_NAME=ClockKo-Dev-$DEV_NAME
FRONTEND_URL=http://localhost:3000
EOF

echo "📝 Created .env.local with your database configuration"
echo ""
echo "🚀 Next steps:"
echo "1. Copy environment file: cp .env.local .env"
echo "2. Run migrations: alembic upgrade head"
echo "3. Start the server: uvicorn app.main:app --reload"
echo ""
echo "💡 Your database: $DB_NAME"
echo "💡 Your .env file is ready!"
