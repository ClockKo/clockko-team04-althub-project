"""
Seed script to create default coworking rooms
Run with: python seed_coworking_rooms.py
"""

import uuid
from app.core.database import SessionLocal
from app.models.room import CoworkingRoom, RoomStatus


def create_default_rooms():
    """Create default coworking rooms"""
    db = SessionLocal()
    
    try:
        # Check if rooms already exist
        existing_rooms = db.query(CoworkingRoom).count()
        if existing_rooms > 0:
            print(f"✓ Found {existing_rooms} existing coworking rooms. Skipping seed.")
            return
        
        # Define default rooms based on frontend requirements
        default_rooms = [
            {
                "name": "Focus Zone",
                "description": "Deep work sessions - minimal distractions",
                "color": "bg-grayBlue",
                "max_participants": 10
            },
            {
                "name": "Creative Studio",
                "description": "Collaborative creative work and brainstorming",
                "color": "bg-purple",
                "max_participants": 15
            },
            {
                "name": "Study Hall",
                "description": "Quiet study and learning sessions",
                "color": "bg-green",
                "max_participants": 20
            },
            {
                "name": "Coffee Break",
                "description": "Casual conversations and networking",
                "color": "bg-orange",
                "max_participants": 12
            },
            {
                "name": "Sprint Room",
                "description": "Pomodoro and timed work sprints",
                "color": "bg-red",
                "max_participants": 8
            }
        ]
        
        # Create rooms
        for room_data in default_rooms:
            room = CoworkingRoom(
                id=uuid.uuid4(),
                name=room_data["name"],
                description=room_data["description"],
                status=RoomStatus.active,
                max_participants=room_data["max_participants"],
                color=room_data["color"]
            )
            db.add(room)
            print(f"✓ Created room: {room.name}")
        
        db.commit()
        print(f"\n✅ Successfully created {len(default_rooms)} default coworking rooms!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating rooms: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding default coworking rooms...\n")
    create_default_rooms()
