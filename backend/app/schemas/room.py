from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List


# Room Schemas
class CoworkingRoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    max_participants: int = Field(default=10, ge=1, le=50)
    color: Optional[str] = None


class CoworkingRoomCreate(CoworkingRoomBase):
    pass


class CoworkingRoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive)$")
    max_participants: Optional[int] = Field(None, ge=1, le=50)
    color: Optional[str] = None


class CoworkingRoomSummary(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    status: str
    participant_count: int
    max_participants: int
    color: Optional[str]

    class Config:
        from_attributes = True


class RoomParticipantResponse(BaseModel):
    id: UUID
    name: str
    avatar: Optional[str]
    is_speaking: bool
    is_muted: bool
    joined_at: datetime

    class Config:
        from_attributes = True


class RoomMessageResponse(BaseModel):
    id: UUID
    user: str
    avatar: Optional[str]
    text: str
    time: str
    created_at: datetime

    class Config:
        from_attributes = True


class CoworkingRoomDetail(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    participants: List[RoomParticipantResponse]
    messages: List[RoomMessageResponse]
    tasks_completed: int = 0
    tasks_total: int = 0
    focus_time: int = 0
    focus_goal: int = 480

    class Config:
        from_attributes = True


# Request/Response Schemas
class JoinRoomResponse(BaseModel):
    success: bool
    message: str
    room: Optional[CoworkingRoomDetail] = None


class LeaveRoomResponse(BaseModel):
    success: bool
    message: str


class SendMessageRequest(BaseModel):
    message_text: str = Field(..., min_length=1)
    message_type: str = Field(default="text", pattern="^(text|system|emoji)$")


class MicToggleRequest(BaseModel):
    is_muted: bool


class SpeakingStatusRequest(BaseModel):
    is_speaking: bool


class EmojiReactionRequest(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=10)
