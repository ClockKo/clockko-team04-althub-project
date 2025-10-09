from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.challenge import UserChallengeStats, WeeklyChallenge, LeaderboardUser
from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services import challengeservice

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.get("/stats", response_model=UserChallengeStats)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return challengeservice.get_user_stats(db, current_user.id)

@router.get("/week", response_model=List[WeeklyChallenge])
def get_weekly_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return challengeservice.get_weekly_challenges(db, current_user.id)

@router.get("/leaders", response_model=List[LeaderboardUser])
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return challengeservice.get_leaderboard(db, current_user.id)

@router.post("/{challenge_id}/join")
def join_challenge(
    challenge_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return challengeservice.join_challenge(db, challenge_id, current_user.id)

@router.delete("/{challenge_id}/leave")
def leave_challenge(
    challenge_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challengeservice.leave_challenge(db, challenge_id, current_user.id)
    return {"message": "Successfully left challenge"}
    raise HTTPException(status_code=501, detail="Not implemented")
