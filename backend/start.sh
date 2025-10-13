#!/bin/bash

# Database migration script for Render deployment
echo "Starting database migrations..."

# Run Alembic migrations
alembic upgrade head

echo "Database migrations completed!"

# Start the application
echo "Starting ClockKo API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}