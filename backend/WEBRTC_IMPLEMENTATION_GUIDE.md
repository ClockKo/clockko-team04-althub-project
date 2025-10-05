# WebRTC Voice Transmission - Backend Implementation Guide

## Overview

The frontend WebRTC service is fully implemented and ready for voice transmission in coworking rooms. The backend needs to implement WebSocket-based signaling to coordinate peer-to-peer connections between users.

## Current Status

✅ **Frontend**: Complete WebRTC implementation with mobile optimizations  
❌ **Backend**: Missing WebSocket signaling infrastructure  
🧪 **Testing**: Voice works between browser tabs (same browser only)

## Required Backend Implementation

### 1. WebSocket Signaling Server

#### Dependencies

Add these to `requirements.txt`:

```python
fastapi[websockets]
websockets>=10.4
```

#### WebSocket Manager Implementation

Create `app/services/websocket_manager.py`:

```python
from typing import Dict, Set, List
import json
import logging
from fastapi import WebSocket
from uuid import UUID

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Track active connections by room
        self.room_connections: Dict[str, Set[WebSocket]] = {}
        # Track user to websocket mapping
        self.user_connections: Dict[str, WebSocket] = {}
        # Track websocket to user mapping
        self.connection_users: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        """Connect a user to a room's WebSocket"""
        await websocket.accept()
        
        # Add to room connections
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()
        self.room_connections[room_id].add(websocket)
        
        # Track user mapping
        self.user_connections[user_id] = websocket
        self.connection_users[websocket] = user_id
        
        logger.info(f"User {user_id} connected to room {room_id}")
        
        # Notify others in room about new user
        await self.broadcast_to_room(room_id, {
            "type": "user-joined",
            "data": {"userId": user_id},
            "from": user_id,
            "roomId": room_id
        }, exclude_user=user_id)

    async def disconnect(self, websocket: WebSocket):
        """Disconnect a user from their room"""
        if websocket in self.connection_users:
            user_id = self.connection_users[websocket]
            
            # Find and remove from room
            room_id = None
            for rid, connections in self.room_connections.items():
                if websocket in connections:
                    connections.remove(websocket)
                    room_id = rid
                    break
            
            # Clean up mappings
            del self.connection_users[websocket]
            if user_id in self.user_connections:
                del self.user_connections[user_id]
            
            logger.info(f"User {user_id} disconnected from room {room_id}")
            
            # Notify others about user leaving
            if room_id:
                await self.broadcast_to_room(room_id, {
                    "type": "user-left",
                    "data": {"userId": user_id},
                    "from": user_id,
                    "roomId": room_id
                }, exclude_user=user_id)

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        """Broadcast message to all users in a room except excluded user"""
        if room_id not in self.room_connections:
            return
        
        message_json = json.dumps(message)
        disconnected = []
        
        for websocket in self.room_connections[room_id].copy():
            user_id = self.connection_users.get(websocket)
            
            # Skip excluded user
            if exclude_user and user_id == exclude_user:
                continue
                
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            await self.disconnect(ws)

    async def send_to_user(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                await self.disconnect(websocket)

# Global WebSocket manager instance
websocket_manager = WebSocketManager()
```

#### WebSocket Endpoint Implementation

Create `app/api/websocket.py`:

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import logging
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user_websocket
from app.models.room import CoworkingRoom
from app.models.room_participant import RoomParticipant
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
```

#### Authentication for WebSocket

Add to `app/core/auth.py`:

```python
from fastapi import HTTPException
from sqlalchemy.orm import Session
import jwt
from app.models.user import User
from app.core.config import settings

async def get_current_user_websocket(token: str, db: Session) -> User:
    """Authenticate user for WebSocket connection"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except jwt.PyJWTError:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user
```

#### Register WebSocket Routes

Add to `app/main.py`:

```python
from app.api import websocket

# Add WebSocket routes
app.include_router(websocket.router, prefix="/api", tags=["websocket"])
```

### 2. Enhanced Room Management

#### Update Room Participant Tracking

Modify `app/api/coworking.py` to track WebSocket connections:

```python
@router.post("/rooms/{room_id}/join")
def join_room(
    room_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a coworking room"""
    try:
        room = coworkingservice.join_room(db, room_id, current_user.id)
        
        # Return room data with WebSocket connection info
        return {
            "success": True,
            "room": room,
            "websocket_url": f"/api/ws/rooms/{room_id}",
            "message": f"Successfully joined {room['name']}"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to join room {room_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to join room")
```

### 3. Configuration Updates

#### Environment Variables

Add to `.env`:

```bash
# WebRTC Configuration
WEBSOCKET_PING_INTERVAL=20
WEBSOCKET_PING_TIMEOUT=10
WEBSOCKET_CLOSE_TIMEOUT=10

# STUN/TURN Server Configuration (Optional)
STUN_SERVER_URL=stun:stun.l.google.com:19302
TURN_SERVER_URL=turn:your-turn-server.com:3478
TURN_USERNAME=your_username
TURN_PASSWORD=your_password
```

#### Update Settings

Add to `app/core/config.py`:

```python
class Settings(BaseSettings):
    # ... existing settings ...
    
    # WebSocket settings
    WEBSOCKET_PING_INTERVAL: int = 20
    WEBSOCKET_PING_TIMEOUT: int = 10
    WEBSOCKET_CLOSE_TIMEOUT: int = 10
    
    # WebRTC servers
    STUN_SERVER_URL: str = "stun:stun.l.google.com:19302"
    TURN_SERVER_URL: Optional[str] = None
    TURN_USERNAME: Optional[str] = None
    TURN_PASSWORD: Optional[str] = None
```

### 4. Database Schema (Already Exists)

The current schema supports WebRTC signaling:

- ✅ `coworking_rooms` table exists
- ✅ `room_participants` table exists  
- ✅ `room_messages` table exists
- ✅ User authentication system ready

### 5. Testing the Implementation

#### Test WebSocket Connection

```python
# Test script: test_websocket.py
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/api/ws/rooms/test-room-id?token=your_jwt_token"
    
    async with websockets.connect(uri) as websocket:
        # Send test message
        message = {
            "type": "offer",
            "data": {"sdp": "test-offer"},
            "from": "user1",
            "to": "user2",
            "roomId": "test-room-id"
        }
        
        await websocket.send(json.dumps(message))
        response = await websocket.recv()
        print(f"Received: {response}")

# Run: python test_websocket.py
asyncio.run(test_websocket())
```

#### Frontend Connection Update

The frontend will automatically connect once WebSocket is available:

```javascript
// Frontend will connect to: ws://localhost:8000/api/ws/rooms/{roomId}?token={authToken}
```

### 6. Production Considerations

#### TURN Server Setup (Optional)

For production environments with strict firewalls:

```bash
# Install coturn TURN server
sudo apt-get install coturn

# Configure in /etc/turnserver.conf
listening-port=3478
fingerprint
use-auth-secret
static-auth-secret=your-secret-key
realm=your-domain.com
```

#### Load Balancing

For multiple backend instances:

- Use Redis for WebSocket session management
- Implement sticky sessions or message routing

#### Monitoring

Add logging for WebRTC connection metrics:

```python
# Monitor WebSocket connections
logger.info(f"Active rooms: {len(websocket_manager.room_connections)}")
logger.info(f"Total connections: {len(websocket_manager.user_connections)}")
```

## Implementation Steps

1. **Install Dependencies**: Add WebSocket packages to requirements.txt
2. **Create WebSocket Manager**: Implement connection management service
3. **Add WebSocket Endpoint**: Create signaling API endpoint
4. **Update Authentication**: Add WebSocket auth support
5. **Test Locally**: Verify WebSocket connections work
6. **Update Frontend Config**: Point to new WebSocket endpoint
7. **Test Voice Transmission**: Verify audio works between devices

## Expected Result

After implementation:

- ✅ **Voice transmission** between different devices/browsers
- ✅ **Mobile voice support** with optimized audio settings  
- ✅ **Real-time WebRTC signaling** via WebSocket
- ✅ **Room-based audio isolation** (users only hear their room)
- ✅ **Automatic connection management** (join/leave events)

## Timeline Estimate

- **Basic WebSocket**: 1-2 days
- **WebRTC Signaling**: 1 day  
- **Testing & Debugging**: 1 day
- **Total**: 3-4 days

The frontend WebRTC service will automatically utilize the new backend signaling once deployed!
