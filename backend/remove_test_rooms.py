#!/usr/bin/env python3
"""
Remove all test coworking rooms from database
"""

import sys
import os
import uuid
from datetime import datetime, timezone

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, get_db
from app.models.room import CoworkingRoom


def remove_all_rooms(db: Session):
    """Remove all coworking rooms"""
    print("🗑️  Removing all coworking rooms...")
    
    try:
        # Get all rooms
        rooms = db.query(CoworkingRoom).all()
        room_count = len(rooms)
        
        if room_count == 0:
            print("   ℹ️  No rooms found in database")
            return 0
        
        # Delete all rooms (cascade will handle participants and messages)
        for room in rooms:
            print(f"   🗑️  Deleting room: {room.name}")
            db.delete(room)
        
        db.commit()
        print(f"\n✅ Successfully removed {room_count} rooms!")
        return room_count
        
    except Exception as e:
        print(f"❌ Error removing rooms: {str(e)}")
        db.rollback()
        return 0


def main():
    """Main function"""
    print("🗑️  Removing All Test Coworking Rooms")
    print("======================================")
    
    try:
        # Get database session
        db = next(get_db())
        
        # Remove all rooms
        removed_count = remove_all_rooms(db)
        
        if removed_count > 0:
            print(f"\n📊 Removed {removed_count} rooms from database")
            print("\n🧪 Test Result:")
            print("   - API will now return empty array []")
            print("   - Frontend should show skeletal loading or empty state")
            print("   - No rooms will be displayed in UI")
        else:
            print("\n📊 No rooms were removed (database already empty)")
        
    except Exception as e:
        print(f"❌ Error during removal: {str(e)}")
        return 1
    
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    exit(main())