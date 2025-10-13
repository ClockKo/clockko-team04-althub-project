from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional

class ChallengeBase(BaseModel):
    name: str
    description: Optional[str] = None
    points: int
    challenge_type: str
    target_value: int
    duration_days: int
    is_active: bool

class Challenge(ChallengeBase):
    id: UUID

    class Config:
        from_attributes = True

class ChallengeParticipantBase(BaseModel):
    user_id: UUID
    challenge_id: UUID
    progress: int
    status: str
    points_earned: int

class ChallengeParticipant(ChallengeParticipantBase):
    id: UUID

    class Config:
        from_attributes = True

class UserChallengeStatsBase(BaseModel):
    user_id: UUID
    total_points: int
    challenges_completed: int
    weekly_points: int
    current_shutdown_streak: int

class UserChallengeStats(UserChallengeStatsBase):
    class Config:
        from_attributes = True

class WeeklyChallenge(BaseModel):
    id: UUID
    name: str
    description: str
    points: int
    challenge_type: str
    target_value: int
    joined_count: int
    progress: int
    total: int
    status: str

class LeaderboardUser(BaseModel):
    rank: int
    name: str
    avatar: Optional[str]
    points: int
    is_current_user: bool
