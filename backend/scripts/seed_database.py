#!/usr/bin/env python3
"""
Database seeding script for ClockKo development
Creates test data for development and testing
"""

import sys
import os
from datetime import datetime, timezone
import uuid

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import engine, get_db
from app.models.user import User
from app.models.user_settings import UserSettings
from app.models.task import Task, TimeLog
from app.core.security import hash_password


def create_test_users(db: Session) -> list[User]:
    """Create test users for development"""
    print("📝 Creating test users...")
    
    test_users_data = [
        {
            "username": "john_doe",
            "email": "john@clockko.dev",
            "full_name": "John Doe",
            "password": "testpass123"
        },
        {
            "username": "jane_smith", 
            "email": "jane@clockko.dev",
            "full_name": "Jane Smith",
            "password": "testpass123"
        },
        {
            "username": "admin_user",
            "email": "admin@clockko.dev", 
            "full_name": "Admin User",
            "password": "adminpass123"
        }
    ]
    
    created_users = []
    
    for user_data in test_users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            print(f"   ⚠️  User {user_data['email']} already exists, skipping...")
            created_users.append(existing_user)
            continue
            
        user = User(
            id=uuid.uuid4(),
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=hash_password(user_data["password"]),
            is_active=True,
            is_verified=True,
            otp_verified=True,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(user)
        created_users.append(user)
        print(f"   ✅ Created user: {user_data['email']}")
    
    db.commit()
    return created_users


def create_user_settings(db: Session, users: list[User]) -> None:
    """Create default settings for test users"""
    print("⚙️  Creating user settings...")
    
    for user in users:
        # Check if settings already exist
        existing_settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        if existing_settings:
            print(f"   ⚠️  Settings for {user.email} already exist, skipping...")
            continue
            
        settings = UserSettings(
            id=uuid.uuid4(),
            user_id=user.id,
            work_start_time="09:00",
            work_end_time="17:00",
            max_daily_hours=8,
            wellness_check_interval=60,
            break_reminder_interval=30,
            break_reminders_enabled=True,
            overwork_notifications_enabled=True,
            wellness_check_enabled=True,
            email_notifications_enabled=True,
            pomodoro_work_duration=25,
            pomodoro_break_duration=5
        )
        
        db.add(settings)
        print(f"   ✅ Created settings for: {user.email}")
    
    db.commit()


def create_test_tasks(db: Session, users: list[User]) -> list[Task]:
    """Create test tasks for users"""
    print("📋 Creating test tasks...")
    
    task_templates = [
        {"title": "Setup Development Environment", "description": "Install dependencies and configure local setup"},
        {"title": "Design User Interface", "description": "Create wireframes and mockups for the application"},
        {"title": "Implement Authentication", "description": "Build login, registration, and JWT token handling"},
        {"title": "Database Schema Design", "description": "Plan and implement database structure"},
        {"title": "API Endpoint Development", "description": "Create REST API endpoints for core functionality"},
        {"title": "Write Unit Tests", "description": "Implement comprehensive test coverage"},
        {"title": "Code Review", "description": "Review team member's pull requests"},
        {"title": "Documentation", "description": "Write API documentation and user guides"}
    ]
    
    created_tasks = []
    
    for user in users[:2]:  # Create tasks for first 2 users
        for i, task_template in enumerate(task_templates):
            if i >= 4:  # Limit to 4 tasks per user
                break
                
            task = Task(
                id=uuid.uuid4(),
                title=task_template["title"],
                description=task_template["description"],
                user_id=user.id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                reminder_enabled=i % 2 == 0  # Enable reminder for every other task
            )
            
            db.add(task)
            created_tasks.append(task)
            print(f"   ✅ Created task '{task.title}' for {user.email}")
    
    db.commit()
    return created_tasks


def create_test_time_logs(db: Session, tasks: list[Task]) -> None:
    """Create sample time logs for tasks"""
    print("⏰ Creating test time logs...")
    
    for i, task in enumerate(tasks[:3]):  # Create logs for first 3 tasks
        # Create a completed time log
        start_time = datetime.now(timezone.utc).replace(hour=9, minute=0, second=0, microsecond=0)
        end_time = start_time.replace(hour=10, minute=30)  # 1.5 hours
        
        time_log = TimeLog(
            id=uuid.uuid4(),
            task_id=task.id,
            user_id=task.user_id,
            start_time=start_time,
            end_time=end_time
        )
        
        db.add(time_log)
        print(f"   ✅ Created time log for task: {task.title}")
    
    db.commit()


def main():
    """Main seeding function"""
    print("🌱 Starting ClockKo Database Seeding")
    print("=====================================")
    
    try:
        # Get database session
        db = next(get_db())
        
        # Create test data
        users = create_test_users(db)
        create_user_settings(db, users)
        tasks = create_test_tasks(db, users)
        create_test_time_logs(db, tasks)
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   👥 Users: {len(users)}")
        print(f"   📋 Tasks: {len(tasks)}")
        print(f"   ⏰ Time logs: 3")
        
        print("\n🔐 Test Login Credentials:")
        print("   Email: john@clockko.dev, Password: testpass123")
        print("   Email: jane@clockko.dev, Password: testpass123")
        print("   Email: admin@clockko.dev, Password: adminpass123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        return 1
    
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    exit(main())
