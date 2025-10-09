from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import logging
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user_websocket
from app.models.room import CoworkingRoom
from app.models.coworking import RoomParticipant
from app.services.websocket_manager import websocket_manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/rooms/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    room_id: str,
    token: str,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for WebRTC signaling in coworking rooms"""
    
    try:
        # Authenticate user from token
        user = await get_current_user_websocket(token, db)
        if not user:
            await websocket.close(code=4001, reason="Authentication failed")
            return
            
        user_id = str(user.id)
        
        # Verify user is in the room
        room_uuid = UUID(room_id)
        participant = db.query(RoomParticipant).filter(
            RoomParticipant.room_id == room_uuid,
            RoomParticipant.user_id == user.id,
            RoomParticipant.left_at.is_(None)
        ).first()
        
        if not participant:
            await websocket.close(code=4003, reason="Not a room participant")
            return
        
        # Connect to WebSocket
        await websocket_manager.connect(websocket, room_id, user_id)
        
        try:
            while True:
                # Receive WebRTC signaling messages
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Validate message structure
                if not all(key in message for key in ["type", "from", "roomId"]):
                    logger.warning(f"Invalid message structure from {user_id}")
                    continue
                
                # Handle different message types
                message_type = message["type"]
                
                if message_type in ["offer", "answer", "ice-candidate"]:
                    # WebRTC signaling messages - forward to target user
                    target_user = message.get("to")
                    if target_user:
                        await websocket_manager.send_to_user(target_user, message)
                    else:
                        # Broadcast to all other users in room
                        await websocket_manager.broadcast_to_room(
                            room_id, message, exclude_user=user_id
                        )
                
                elif message_type == "user-joined":
                    # New user announcement - broadcast to room
                    await websocket_manager.broadcast_to_room(
                        room_id, message, exclude_user=user_id
                    )
                
                else:
                    logger.warning(f"Unknown message type: {message_type}")
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user {user_id}")
        except Exception as e:
            logger.error(f"WebSocket error for user {user_id}: {e}")
        finally:
            await websocket_manager.disconnect(websocket)
            
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        await websocket.close(code=4000, reason="Connection error")
