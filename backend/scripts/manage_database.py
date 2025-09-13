#!/usr/bin/env python3
"""
Database management script for ClockKo backend
Provides utilities for resetting, backing up, and managing team databases
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import engine, Base, get_db
from sqlalchemy import text

def get_db_name_from_url(database_url: str) -> str:
    """Extract database name from DATABASE_URL"""
    return database_url.split('/')[-1]

def backup_database(db_name: str = None):
    """Create a backup of the database"""
    if not db_name:
        db_name = get_db_name_from_url(settings.DATABASE_URL)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path("backups")
    backup_dir.mkdir(exist_ok=True)
    
    backup_file = backup_dir / f"{db_name}_backup_{timestamp}.sql"
    
    try:
        subprocess.run([
            "pg_dump",
            "-h", "localhost",
            "-U", "postgres",
            "-d", db_name,
            "-f", str(backup_file)
        ], check=True)
        
        print(f"✅ Backup created: {backup_file}")
        return str(backup_file)
    except subprocess.CalledProcessError as e:
        print(f"❌ Backup failed: {e}")
        return None

def reset_database(db_name: str = None, with_backup: bool = True):
    """Reset database - drop all tables and recreate"""
    if not db_name:
        db_name = get_db_name_from_url(settings.DATABASE_URL)
    
    # Create backup first
    if with_backup:
        backup_file = backup_database(db_name)
        if not backup_file:
            print("❌ Backup failed, aborting reset")
            return False
    
    try:
        # Drop all tables
        print("🗑️  Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Recreate all tables
        print("🏗️  Creating all tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database reset complete")
        return True
        
    except Exception as e:
        print(f"❌ Reset failed: {e}")
        return False

def seed_test_data():
    """Seed database with test data"""
    try:
        from scripts.seed_database import seed_test_data
        seed_test_data()
        print("✅ Test data seeded successfully")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")

def check_migration_status():
    """Check current migration status"""
    try:
        result = subprocess.run(
            ["alembic", "current"],
            capture_output=True,
            text=True
        )
        print("📊 Migration Status:")
        print(result.stdout)
        
        result = subprocess.run(
            ["alembic", "history", "--verbose"],
            capture_output=True,
            text=True
        )
        print("📋 Migration History:")
        print(result.stdout)
        
    except Exception as e:
        print(f"❌ Migration check failed: {e}")

def create_developer_database(dev_name: str):
    """Create a new database for a developer"""
    db_name = f"clockko_dev_{dev_name.lower()}"
    
    try:
        # Create database
        subprocess.run([
            "createdb",
            "-h", "localhost",
            "-U", "postgres",
            db_name
        ], check=True)
        
        print(f"✅ Created database: {db_name}")
        
        # Create .env file for developer
        env_content = f"""# Database Configuration for {dev_name}
DATABASE_URL=postgresql://postgres:password@localhost:5432/{db_name}

# Copy other settings from .env.team
# SMTP settings, SECRET_KEY, etc.
"""
        env_file = f".env.dev_{dev_name.lower()}"
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"✅ Created environment file: {env_file}")
        print(f"📝 To use this database: cp {env_file} .env")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Database creation failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="ClockKo Database Management")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Backup command
    backup_parser = subparsers.add_parser('backup', help='Backup database')
    backup_parser.add_argument('--db-name', help='Database name to backup')
    
    # Reset command
    reset_parser = subparsers.add_parser('reset', help='Reset database')
    reset_parser.add_argument('--db-name', help='Database name to reset')
    reset_parser.add_argument('--no-backup', action='store_true', help='Skip backup before reset')
    reset_parser.add_argument('--with-seed', action='store_true', help='Seed test data after reset')
    
    # Seed command
    subparsers.add_parser('seed', help='Seed test data')
    
    # Status command
    subparsers.add_parser('status', help='Check migration status')
    
    # Create developer database
    create_parser = subparsers.add_parser('create-dev', help='Create developer database')
    create_parser.add_argument('dev_name', help='Developer name')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'backup':
        backup_database(args.db_name)
    
    elif args.command == 'reset':
        success = reset_database(args.db_name, not args.no_backup)
        if success and args.with_seed:
            seed_test_data()
    
    elif args.command == 'seed':
        seed_test_data()
    
    elif args.command == 'status':
        check_migration_status()
    
    elif args.command == 'create-dev':
        create_developer_database(args.dev_name)

if __name__ == "__main__":
    main()
