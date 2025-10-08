from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any
from uuid import UUID
import json
from app.core.security import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
from app.core.database import SessionLocal
from app.models.room import CoworkingRoom
import os
import asyncio
try:
    from redis.asyncio import Redis  # type: ignore
except Exception:
    Redis = None  # optional


router = APIRouter()


class RoomHub:
    """In-memory signaling hub per room.
    rooms: room_id -> { user_id: websocket }
    """

    def __init__(self):
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, room_id: str, user_id: str, ws: WebSocket):
        await ws.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = {}
        self.rooms[room_id][user_id] = ws

    def disconnect(self, room_id: str, user_id: str):
        try:
            self.rooms.get(room_id, {}).pop(user_id, None)
            if room_id in self.rooms and not self.rooms[room_id]:
                self.rooms.pop(room_id, None)
        except KeyError:
            pass

    async def send_to(self, room_id: str, user_id: str, payload: dict):
        target = self.rooms.get(room_id, {}).get(user_id)
        if target:
            await target.send_text(json.dumps(payload))

    async def broadcast(self, room_id: str, payload: dict, exclude: str | None = None):
        peers = self.rooms.get(room_id, {})
        for uid, ws in peers.items():
            if exclude and uid == exclude:
                continue
            await ws.send_text(json.dumps(payload))


REDIS_URL = os.getenv("REDIS_URL", "")
if Redis and REDIS_URL:
    # Lazy import and define a Redis-backed hub wrapper
    class RedisHub(RoomHub):
        def __init__(self, redis):
            super().__init__()
            self.redis = redis
            self.sub_tasks: Dict[str, asyncio.Task] = {}

        async def ensure_subscription(self, room_id: str):
            if room_id in self.sub_tasks:
                return
            async def consume():
                pubsub = self.redis.pubsub()
                channel = f"room:{room_id}"
                await pubsub.subscribe(channel)
                try:
                    async for msg in pubsub.listen():
                        if msg.get("type") != "message":
                            continue
                        data = json.loads(msg.get("data", "{}"))
                        targets = self.rooms.get(room_id, {})
                        to = data.get("to")
                        if to and to in targets:
                            await targets[to].send_text(json.dumps(data))
                        elif not to:
                            for uid, ws in targets.items():
                                if uid != data.get("from"):
                                    await ws.send_text(json.dumps(data))
                finally:
                    await pubsub.unsubscribe(channel)
                    await pubsub.close()
            self.sub_tasks[room_id] = asyncio.create_task(consume())

        async def connect(self, room_id: str, user_id: str, ws: WebSocket):
            await super().connect(room_id, user_id, ws)
            await self.ensure_subscription(room_id)

        def disconnect(self, room_id: str, user_id: str):
            super().disconnect(room_id, user_id)
            if room_id in self.rooms:
                return
            task = self.sub_tasks.pop(room_id, None)
            if task:
                task.cancel()

        async def publish(self, room_id: str, payload: dict):
            await self.redis.publish(f"room:{room_id}", json.dumps(payload))

    hub = RedisHub(Redis.from_url(REDIS_URL, decode_responses=True))
else:
    hub = RoomHub()


def verify_token(token: str | None) -> str | None:
    """Return user_id (str) if token is valid; otherwise None (anonymous)."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        return str(sub) if sub else None
    except JWTError:
        return None


def room_exists(room_id: str) -> bool:
    try:
        uuid = UUID(room_id)
    except Exception:
        return False
    db = SessionLocal()
    try:
        room = db.query(CoworkingRoom).filter(CoworkingRoom.id == uuid).first()
        return room is not None
    finally:
        db.close()


@router.websocket("/ws/rooms/{room_id}")
async def ws_room(websocket: WebSocket, room_id: str):
    """WebSocket signaling endpoint for coworking rooms.
    Protocol: JSON messages with fields:
      - type: "join" | "offer" | "answer" | "candidate" | "leave" | "presence"
      - from: sender user id
      - to:   target user id (optional; if omitted, broadcast to room)
      - data: payload (SDP/ICE or misc)

    Auth: optional `token` query parameter with a valid JWT (sub as user id).
    If absent/invalid, a temporary anonymous id MUST be provided in the first message.
    """
    token = websocket.query_params.get("token")
    claimed_uid = verify_token(token)

    # Basic room validation (fails fast if room doesn't exist)
    if not room_exists(room_id):
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "error": "room_not_found"}))
        await websocket.close(code=4404)
        return

    user_id: str | None = None
    try:
        # Expect a join message first to establish identity if token didn't have one
        await websocket.accept()
        # Read first message (join)
        raw = await websocket.receive_text()
        msg = json.loads(raw)
        if msg.get("type") != "join":
            await websocket.send_text(json.dumps({"type": "error", "error": "expected_join_first"}))
            await websocket.close(code=4400)
            return

        # Resolve user id: token > message.from > random
        user_id = claimed_uid or str(msg.get("from") or "")
        if not user_id:
            await websocket.send_text(json.dumps({"type": "error", "error": "missing_user_id"}))
            await websocket.close(code=4401)
            return

        await hub.connect(room_id, user_id, websocket)
        # Inform others this user joined
        if hasattr(hub, "publish"):
            await hub.publish(room_id, {"type": "user_joined", "from": user_id})
        else:
            await hub.broadcast(room_id, {"type": "user_joined", "userId": user_id}, exclude=user_id)

        # Acknowledge join to the client and share current peers
        peers = [uid for uid in hub.rooms.get(room_id, {}).keys() if uid != user_id]
        await websocket.send_text(json.dumps({"type": "joined", "roomId": room_id, "peers": peers}))

        # Main loop: route messages
        while True:
            raw = await websocket.receive_text()
            data: Dict[str, Any] = json.loads(raw)
            mtype = data.get("type")
            target = data.get("to")
            payload = {k: v for k, v in data.items() if k not in ("type", "to")}
            payload.update({"type": mtype, "from": user_id})

            if mtype in {"offer", "answer", "candidate"}:
                if hasattr(hub, "publish"):
                    await hub.publish(room_id, {**payload, "to": target} if target else payload)
                else:
                    if target:
                        await hub.send_to(room_id, str(target), payload)
                    else:
                        await hub.broadcast(room_id, payload, exclude=user_id)
            elif mtype == "presence":
                if hasattr(hub, "publish"):
                    await hub.publish(room_id, {"type": "presence", "from": user_id, **payload})
                else:
                    await hub.broadcast(room_id, {"type": "presence", "userId": user_id, **payload}, exclude=user_id)
            elif mtype == "leave":
                if hasattr(hub, "publish"):
                    await hub.publish(room_id, {"type": "user_left", "from": user_id})
                else:
                    await hub.broadcast(room_id, {"type": "user_left", "userId": user_id}, exclude=user_id)
                await websocket.close()
                break
            else:
                await websocket.send_text(json.dumps({"type": "error", "error": "unknown_type"}))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"type": "error", "error": str(e)}))
        except Exception:
            pass
    finally:
        if user_id:
            hub.disconnect(room_id, user_id)
            # Notify others
            if hasattr(hub, "publish"):
                await hub.publish(room_id, {"type": "user_left", "from": user_id})
            else:
                await hub.broadcast(room_id, {"type": "user_left", "userId": user_id}, exclude=user_id)
