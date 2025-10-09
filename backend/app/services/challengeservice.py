from sqlalchemy.orm import Session
from uuid import UUID
from app.models.challenge import Challenge, ChallengeParticipant, UserChallengeStats
from app.models.user import User
from app.schemas.challenge import WeeklyChallenge, LeaderboardUser
from typing import List
from fastapi import HTTPException

def get_user_stats(db: Session, user_id: UUID) -> UserChallengeStats:
    stats = db.query(UserChallengeStats).filter(UserChallengeStats.user_id == user_id).first()
    if not stats:
        stats = UserChallengeStats(user_id=user_id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats

def get_weekly_challenges(db: Session, user_id: UUID) -> List[WeeklyChallenge]:
    active_challenges = db.query(Challenge).filter(Challenge.is_active == True).all()
    
    weekly_challenges = []
    for challenge in active_challenges:
        participant_count = db.query(ChallengeParticipant).filter(ChallengeParticipant.challenge_id == challenge.id).count()
        
        user_participation = db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == challenge.id,
            ChallengeParticipant.user_id == user_id
        ).first()
        
        progress = 0
        status = "not_joined"
        if user_participation:
            progress = user_participation.progress
            status = user_participation.status.value
            
        weekly_challenges.append(
            WeeklyChallenge(
                id=challenge.id,
                name=challenge.name,
                description=challenge.description,
                points=challenge.points,
                challenge_type=challenge.challenge_type.value,
                target_value=challenge.target_value,
                joined_count=participant_count,
                progress=progress,
                total=challenge.target_value, # Assuming target_value is the total
                status=status,
            )
        )
        
    return weekly_challenges

def get_leaderboard(db: Session, current_user_id: UUID) -> List[LeaderboardUser]:
    leaderboard_data = db.query(
        User,
        UserChallengeStats.total_points
    ).join(
        UserChallengeStats, User.id == UserChallengeStats.user_id
    ).order_by(
        UserChallengeStats.total_points.desc()
    ).all()
    
    leaderboard = []
    for rank, (user, total_points) in enumerate(leaderboard_data, start=1):
        leaderboard.append(
            LeaderboardUser(
                rank=rank,
                name=user.full_name or user.username,
                avatar=user.avatar_url,
                points=total_points,
                is_current_user=(user.id == current_user_id)
            )
        )
        
    return leaderboard

def join_challenge(db: Session, challenge_id: UUID, user_id: UUID):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id, Challenge.is_active == True).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or is not active")
        
    participant = db.query(ChallengeParticipant).filter(
        ChallengeParticipant.challenge_id == challenge_id,
        ChallengeParticipant.user_id == user_id
    ).first()
    
    if participant:
        raise HTTPException(status_code=400, detail="User has already joined this challenge")
        
    new_participant = ChallengeParticipant(
        challenge_id=challenge_id,
        user_id=user_id
    )
    db.add(new_participant)
    db.commit()
    
    return {"message": "Successfully joined challenge"}

def leave_challenge(db: Session, challenge_id: UUID, user_id: UUID):
    participant = db.query(ChallengeParticipant).filter(
        ChallengeParticipant.challenge_id == challenge_id,
        ChallengeParticipant.user_id == user_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="User is not part of this challenge")
        
    db.delete(participant)
    db.commit()
    
    return {"message": "Successfully left challenge"}
