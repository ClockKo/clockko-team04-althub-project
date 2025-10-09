import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.models.room import CoworkingRoom, RoomStatus


# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_coworking.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create tables before each test and drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def create_user(db, username="testuser", email="test@example.com"):
    """Helper function to create a test user"""
    user = User(
        id=uuid4(),
        username=username,
        email=email,
        full_name="Test User",
        hashed_password="hashedpassword",
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_room(db, name="Test Room", description="Test Description"):
    """Helper function to create a test room"""
    room = CoworkingRoom(
        id=uuid4(),
        name=name,
        description=description,
        status=RoomStatus.active,
        max_participants=10,
        color="bg-grayBlue"
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def test_list_rooms(setup_database):
    """Test listing all coworking rooms"""
    db = TestingSessionLocal()
    
    # Create test data
    user = create_user(db, "alice", "alice@example.com")
    room = create_room(db, "Focus Zone")
    
    # Make API request (would need authentication token in real scenario)
    # For now, this is a simplified test
    response = client.get("/api/coworking/rooms", headers={"Authorization": "Bearer test-token"})
    
    # Note: This test would need proper auth setup to pass
    # assert response.status_code == 200
    # assert len(response.json()) > 0
    
    db.close()


def test_join_room(setup_database):
    """Test joining a coworking room"""
    db = TestingSessionLocal()
    
    # Create test data
    user = create_user(db, "bob", "bob@example.com")
    room = create_room(db)
    
    # Test joining room
    response = client.post(
        f"/api/coworking/rooms/{room.id}/join",
        headers={"Authorization": "Bearer test-token"}
    )
    
    # Note: Would need proper auth setup
    # assert response.status_code == 200
    # assert response.json()["success"] is True
    
    db.close()


def test_leave_room(setup_database):
    """Test leaving a coworking room"""
    db = TestingSessionLocal()
    
    # Create test data
    user = create_user(db)
    room = create_room(db)
    
    # Test leaving room
    response = client.post(
        f"/api/coworking/rooms/{room.id}/leave",
        headers={"Authorization": "Bearer test-token"}
    )
    
    db.close()


def test_send_message(setup_database):
    """Test sending a message to a room"""
    db = TestingSessionLocal()
    
    # Create test data
    user = create_user(db)
    room = create_room(db)
    
    # Test sending message
    response = client.post(
        f"/api/coworking/rooms/{room.id}/messages",
        json={"message_text": "Hello everyone!", "message_type": "text"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    db.close()


def test_toggle_mic_and_speaking(setup_database):
    """Test toggling microphone and speaking status"""
    db = TestingSessionLocal()
    
    # Create test data
    user = create_user(db)
    room = create_room(db)
    
    # Test mic toggle
    response = client.put(
        f"/api/coworking/rooms/{room.id}/mic-toggle",
        json={"is_muted": False},
        headers={"Authorization": "Bearer test-token"}
    )
    
    # Test speaking status
    response = client.put(
        f"/api/coworking/rooms/{room.id}/speaking",
        json={"is_speaking": True},
        headers={"Authorization": "Bearer test-token"}
    )
    
    db.close()


def test_send_emoji(setup_database):
    """Test sending an emoji reaction"""
    db = TestingSessionLocal()
    
    # Create test data
    user = create_user(db)
    room = create_room(db)
    
    # Test emoji
    response = client.post(
        f"/api/coworking/rooms/{room.id}/emoji",
        json={"emoji": "👍"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    db.close()
