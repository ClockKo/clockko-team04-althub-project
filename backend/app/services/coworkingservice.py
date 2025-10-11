from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.models.room import CoworkingRoom, RoomStatus
  # from app.models.room_participant import RoomParticipant
from app.models.coworking import RoomParticipant, RoomMessage, RoomMessageType
from app.models.user import User
from app.schemas.room import (
    CoworkingRoomCreate,
    CoworkingRoomUpdate,
    CoworkingRoomSummary,
    CoworkingRoomDetail,
    RoomParticipantResponse,
    RoomMessageResponse
)


def get_all_rooms(db: Session) -> List[CoworkingRoomSummary]:
    """Get all active coworking rooms with participant counts"""
    rooms = db.query(CoworkingRoom).filter(
        CoworkingRoom.status == RoomStatus.active
    ).all()

    room_summaries = []
    for room in rooms:
        # Count active participants (those who haven't left)
        participant_count = db.query(func.count(RoomParticipant.id)).filter(
            and_(
                RoomParticipant.room_id == room.id,
                RoomParticipant.left_at.is_(None)
            )
        ).scalar()

        room_summaries.append(CoworkingRoomSummary(
            id=room.id,
            name=room.name,
            description=room.description,
            status=room.status.value,
            participant_count=participant_count or 0,
            max_participants=room.max_participants,
            color=room.color
        ))

    return room_summaries


def get_room_details(db: Session, room_id: UUID) -> Optional[CoworkingRoomDetail]:
    """Get detailed information about a specific room"""
    room = db.query(CoworkingRoom).filter(CoworkingRoom.id == room_id).first()
    if not room:
        return None

    # Get active participants
    participants_data = db.query(RoomParticipant, User).join(
        User, RoomParticipant.user_id == User.id
    ).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.left_at.is_(None)
        )
    ).all()

    participants = []
    for participant, user in participants_data:
        participants.append(RoomParticipantResponse(
            id=user.id,
            name=user.full_name or user.username,
            avatar=getattr(user, 'avatar_url', None),
            is_speaking=participant.is_speaking,
            is_muted=participant.is_muted,
            joined_at=participant.joined_at
        ))

    # Get recent messages (last 50)
    messages_data = db.query(RoomMessage, User).outerjoin(
        User, RoomMessage.user_id == User.id
    ).filter(
        RoomMessage.room_id == room_id
    ).order_by(RoomMessage.created_at.desc()).limit(50).all()

    messages = []
    for message, user in reversed(messages_data):
        messages.append(RoomMessageResponse(
            id=message.id,
            user=user.full_name or user.username if user else "System",
            avatar=getattr(user, 'avatar_url', None) if user else None,
            text=message.message_text,
            time=message.created_at.strftime("%H:%M"),
            created_at=message.created_at
        ))

    return CoworkingRoomDetail(
        id=room.id,
        name=room.name,
        description=room.description,
        participants=participants,
        messages=messages,
        tasks_completed=0,
        tasks_total=0,
        focus_time=0,
        focus_goal=480
    )


def join_room(db: Session, room_id: UUID, user_id: UUID) -> CoworkingRoomDetail:
    """Add a user to a coworking room"""
    # Check if room exists and is active
    room = db.query(CoworkingRoom).filter(CoworkingRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if room.status != RoomStatus.active:
        raise HTTPException(status_code=400, detail="Room is not active")

    # Check room capacity
    current_participants = db.query(func.count(RoomParticipant.id)).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.left_at.is_(None)
        )
    ).scalar()

    if current_participants >= room.max_participants:
        raise HTTPException(status_code=400, detail="Room is full")

    # Check if user has any existing participation record (active or not)
    existing_participant = db.query(RoomParticipant).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == user_id
        )
    ).first()

    if existing_participant:
        # If user already has a record, check if they're currently active
        if existing_participant.left_at is None:
            raise HTTPException(status_code=400, detail="Already in this room")
        
        # If they previously left, reactivate their participation
        print(f"Reactivating participant {user_id} in room {room_id}")
        existing_participant.left_at = None
        existing_participant.is_muted = True
        existing_participant.is_speaking = False
        existing_participant.joined_at = func.now()
        participant = existing_participant
    else:
        # Create new participant record
        print(f"Creating new participant {user_id} in room {room_id}")
        participant = RoomParticipant(
            room_id=room_id,
            user_id=user_id,
            is_muted=True,
            is_speaking=False
        )
        db.add(participant)

    # Add system message
    user = db.query(User).filter(User.id == user_id).first()
    system_message = RoomMessage(
        room_id=room_id,
        user_id=user_id,
        message_text=f"{user.full_name or user.username} joined the room",
        message_type=RoomMessageType.system
    )
    db.add(system_message)

    db.commit()
    db.refresh(participant)

    return get_room_details(db, room_id)


def leave_room(db: Session, room_id: UUID, user_id: UUID) -> bool:
    """Remove a user from a coworking room"""
    participant = db.query(RoomParticipant).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == user_id,
            RoomParticipant.left_at.is_(None)
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Not in this room")

    # Mark as left
    participant.left_at = datetime.utcnow()
    participant.is_speaking = False

    # Add system message
    user = db.query(User).filter(User.id == user_id).first()
    system_message = RoomMessage(
        room_id=room_id,
        user_id=user_id,
        message_text=f"{user.full_name or user.username} left the room",
        message_type=RoomMessageType.system
    )
    db.add(system_message)

    db.commit()
    return True


def send_message(
    db: Session,
    room_id: UUID,
    user_id: UUID,
    message_text: str,
    message_type: str = "text"
) -> RoomMessageResponse:
    """Send a message to a room"""
    # Verify user is in the room
    participant = db.query(RoomParticipant).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == user_id,
            RoomParticipant.left_at.is_(None)
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=403, detail="Must be in room to send messages")

    # Create message
    message = RoomMessage(
        room_id=room_id,
        user_id=user_id,
        message_text=message_text,
        message_type=RoomMessageType[message_type]
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Get user for response
    user = db.query(User).filter(User.id == user_id).first()

    return RoomMessageResponse(
        id=message.id,
        user=user.full_name or user.username,
        avatar=getattr(user, 'avatar_url', None),
        text=message.message_text,
        time=message.created_at.strftime("%H:%M"),
        created_at=message.created_at
    )


def toggle_microphone(db: Session, room_id: UUID, user_id: UUID, is_muted: bool) -> bool:
    """Toggle user's microphone status"""
    participant = db.query(RoomParticipant).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == user_id,
            RoomParticipant.left_at.is_(None)
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Not in this room")

    participant.is_muted = is_muted
    # If muting, also stop speaking
    if is_muted:
        participant.is_speaking = False

    db.commit()
    return True


def update_speaking_status(db: Session, room_id: UUID, user_id: UUID, is_speaking: bool) -> bool:
    """Update user's speaking status"""
    participant = db.query(RoomParticipant).filter(
        and_(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == user_id,
            RoomParticipant.left_at.is_(None)
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Not in this room")

    # Can only speak if not muted
    if is_speaking and participant.is_muted:
        raise HTTPException(status_code=400, detail="Cannot speak while muted")

    participant.is_speaking = is_speaking
    db.commit()
    return True


def send_emoji_reaction(db: Session, room_id: UUID, user_id: UUID, emoji: str) -> RoomMessageResponse:
    """Send an emoji reaction to the room"""
    return send_message(db, room_id, user_id, emoji, "emoji")
