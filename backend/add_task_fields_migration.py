#!/usr/bin/env python3
"""
Add enhanced task tracking fields to existing Task table
"""

import sys
import os
from datetime import datetime, timezone

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine, get_db


def add_task_fields():
    """Add new fields to the tasks table"""
    print("🔄 Adding enhanced task tracking fields to tasks table...")
    
    # SQL commands to add new columns
    add_columns_sql = [
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;",
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;", 
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE;",
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'medium';",
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSON;",
    ]
    
    # SQL commands to create indexes
    create_indexes_sql = [
        "CREATE INDEX IF NOT EXISTS idx_task_completed ON tasks(completed);",
        "CREATE INDEX IF NOT EXISTS idx_task_priority ON tasks(priority);", 
        "CREATE INDEX IF NOT EXISTS idx_task_due_date ON tasks(due_date);",
    ]
    
    try:
        with engine.connect() as conn:
            # Add columns
            for sql in add_columns_sql:
                print(f"   Executing: {sql}")
                conn.execute(text(sql))
            
            # Create indexes
            for sql in create_indexes_sql:
                print(f"   Executing: {sql}")
                conn.execute(text(sql))
                
            # Commit the transaction
            conn.commit()
            
        print("✅ Successfully added enhanced task tracking fields!")
        
        # Verify the changes
        print("\n📊 Verifying table structure...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' 
                ORDER BY ordinal_position;
            """))
            
            print("   Table structure:")
            for row in result:
                nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                default = f"DEFAULT {row[3]}" if row[3] else ""
                print(f"     {row[0]} - {row[1]} {nullable} {default}")
                
    except Exception as e:
        print(f"❌ Error adding task fields: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


def main():
    """Main function"""
    print("🚀 Task Enhancement Migration")
    print("============================")
    
    try:
        return add_task_fields()
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return 1


if __name__ == "__main__":
    exit(main())