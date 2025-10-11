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
