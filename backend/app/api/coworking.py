from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.room import (
    CoworkingRoomSummary,
    CoworkingRoomDetail,
    CoworkingRoomCreate,
    CoworkingRoomUpdate,
    JoinRoomResponse,
    LeaveRoomResponse,
    SendMessageRequest,
    RoomMessageResponse,
    MicToggleRequest,
    SpeakingStatusRequest,
    EmojiReactionRequest
)
from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services import coworkingservice


router = APIRouter(prefix="/coworking", tags=["Coworking"])


@router.post("/rooms", response_model=CoworkingRoomSummary, status_code=201)
def create_room(
    room_data: CoworkingRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new coworking room.
    Any authenticated user can create a room.
    """
    from app.models.room import CoworkingRoom, RoomStatus
    import uuid
    
    # Create new room
    new_room = CoworkingRoom(
        id=uuid.uuid4(),
        name=room_data.name,
        description=room_data.description,
        status=RoomStatus.active,
        max_participants=room_data.max_participants or 15,
        color=room_data.color or "bg-grayBlue"
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room


@router.get("/rooms", response_model=List[CoworkingRoomSummary])
def list_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available coworking rooms"""
    return coworkingservice.get_all_rooms(db)


@router.get("/rooms/{room_id}", response_model=CoworkingRoomDetail)
def get_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific room details"""
    room = coworkingservice.get_room_details(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.post("/rooms/{room_id}/join", response_model=JoinRoomResponse)
def join_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a coworking room"""
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    room = coworkingservice.join_room(db, room_id, user_id)
    return JoinRoomResponse(
        success=True,
        message="Joined room successfully",
        room=room
    )


@router.post("/rooms/{room_id}/leave", response_model=LeaveRoomResponse)
def leave_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Leave a coworking room"""
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    coworkingservice.leave_room(db, room_id, user_id)
    return LeaveRoomResponse(
        success=True,
        message="Left room successfully"
    )


@router.post("/rooms/{room_id}/messages", response_model=RoomMessageResponse)
def send_message(
    room_id: UUID,
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the room"""
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    return coworkingservice.send_message(
        db, room_id, user_id, request.message_text, request.message_type
    )


@router.put("/rooms/{room_id}/mic-toggle")
def toggle_microphone(
    room_id: UUID,
    request: MicToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle microphone status"""
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    coworkingservice.toggle_microphone(db, room_id, user_id, request.is_muted)
    return {"success": True, "is_muted": request.is_muted}


@router.put("/rooms/{room_id}/speaking")
def update_speaking_status(
    room_id: UUID,
    request: SpeakingStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update speaking status"""
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    coworkingservice.update_speaking_status(db, room_id, user_id, request.is_speaking)
    return {"success": True, "is_speaking": request.is_speaking}


@router.post("/rooms/{room_id}/emoji", response_model=RoomMessageResponse)
def send_emoji(
    room_id: UUID,
    request: EmojiReactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send emoji reaction"""
    user_id = current_user.id
    if not isinstance(user_id, UUID):
        try:
            user_id = UUID(str(user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID")

    return coworkingservice.send_emoji_reaction(db, room_id, user_id, request.emoji)


# Room Management Endpoints

@router.post("/rooms", response_model=CoworkingRoomSummary, status_code=201)
def create_room(
    room_data: CoworkingRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new coworking room.
    
    Any authenticated user can create a room. The room will be set to active by default.
    """
    from app.models.room import CoworkingRoom, RoomStatus
    import uuid
    
    # Create new room
    new_room = CoworkingRoom(
        id=uuid.uuid4(),
        name=room_data.name,
        description=room_data.description,
        status=RoomStatus.active,
        max_participants=room_data.max_participants or 15,
        color=room_data.color or "bg-grayBlue"
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room
