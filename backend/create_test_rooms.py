#!/usr/bin/env python3
"""
Create test coworking rooms for development
"""

import sys
import os
import uuid
from datetime import datetime, timezone

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, get_db
from app.models.room import CoworkingRoom, RoomStatus


def create_test_rooms(db: Session) -> list[CoworkingRoom]:
    """Create test coworking rooms"""
    print("🏢 Creating test coworking rooms...")
    
    test_rooms_data = [
        {
            "name": "Focus Zone",
            "description": "A quiet space for deep work and concentration",
            "status": RoomStatus.active,
            "max_participants": 8,
            "color": "bg-blue-50"
        },
        {
            "name": "Creative Lab",
            "description": "Collaborative space for brainstorming and creative work",
            "status": RoomStatus.active,
            "max_participants": 12,
            "color": "bg-purple-50"
        },
        {
            "name": "Study Hall",
            "description": "Casual co-working environment for learning and studying",
            "status": RoomStatus.active,
            "max_participants": 15,
            "color": "bg-green-50"
        },
        {
            "name": "Coding Bootcamp",
            "description": "Development environment for programmers and coders",
            "status": RoomStatus.active,
            "max_participants": 10,
            "color": "bg-orange-50"
        },
        {
            "name": "Silent Library",
            "description": "Ultra-quiet space for reading and research",
            "status": RoomStatus.active,
            "max_participants": 6,
            "color": "bg-indigo-50"
        }
    ]
    
    created_rooms = []
    
    for room_data in test_rooms_data:
        # Check if room already exists
        existing_room = db.query(CoworkingRoom).filter(CoworkingRoom.name == room_data["name"]).first()
        if existing_room:
            print(f"   ⚠️  Room '{room_data['name']}' already exists, skipping...")
            created_rooms.append(existing_room)
            continue
            
        room = CoworkingRoom(
            id=uuid.uuid4(),
            name=room_data["name"],
            description=room_data["description"],
            status=room_data["status"],
            max_participants=room_data["max_participants"],
            color=room_data["color"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        db.add(room)
        created_rooms.append(room)
        print(f"   ✅ Created room: {room_data['name']}")
    
    db.commit()
    return created_rooms


def main():
    """Main function"""
    print("🌱 Creating Test Coworking Rooms")
    print("=================================")
    
    try:
        # Get database session
        db = next(get_db())
        
        # Create test rooms
        rooms = create_test_rooms(db)
        
        print(f"\n🎉 Successfully created {len(rooms)} coworking rooms!")
        print("\n📊 Room Summary:")
        for room in rooms:
            print(f"   🏠 {room.name} - {room.description[:50]}...")
        
    except Exception as e:
        print(f"❌ Error creating rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    finally:
        db.close()
    
    return 0


if __name__ == "__main__":
    exit(main())