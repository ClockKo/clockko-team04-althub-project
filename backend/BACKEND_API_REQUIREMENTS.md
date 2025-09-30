# 📋 Backend API Requirements for Frontend Features

## Overview

The frontend features are fully implemented and working with localStorage/mock data. We need backend APIs to persist the data and enable full functionality. Here are the specific database fields and API endpoints needed for each feature.

---

## 🎯 Tasks Feature Enhancement

### Database Fields Needed

**Task Model** (`app/models/task.py`) - Add these fields:

- `start_date` (DateTime, nullable) - When user plans to start the task
- `due_date` (DateTime, nullable) - When the task is due
- `completed` (Boolean, default=False) - Task completion status
- `priority` (String, default='medium') - 'low', 'medium', 'high'
- `tags` (JSON, nullable) - Array of task tags for categorization

### API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/tasks/` | Create task with new fields |
| `PUT` | `/api/tasks/{task_id}` | Update task including completion status |
| `GET` | `/api/tasks/` | List tasks with filtering: ?completed=false&priority=high |

### Expected Response Format

```json
{
  "id": "uuid-here",
  "title": "Complete project",
  "description": "Finish the task management feature",
  "start_date": "2025-09-27T09:00:00Z",
  "due_date": "2025-09-29T17:00:00Z",
  "completed": false,
  "priority": "high",
  "tags": ["urgent", "development", "feature"],
  "created_at": "2025-09-26T22:00:00Z",
  "updated_at": "2025-09-26T22:00:00Z"
}
```

---

## 🌙 Shutdown Feature

### Database Fields Needed

**ShutdownReflection Model** (New table: `shutdown_reflections`):

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `productivity_rating` (String) - 'great', 'good', 'okay', 'tough'
- `reflection_note` (Text, nullable)
- `mindful_disconnect_completed` (JSON) - Array of booleans
- `created_at` (DateTime)
- `shutdown_date` (DateTime)

### API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/dashboard/shutdown-summary` | Get daily shutdown summary data |
| `POST` | `/api/dashboard/shutdown-reflection` | Submit shutdown reflection |
| `GET` | `/api/dashboard/shutdown-history` | Get reflection history |

### Expected API Responses

**Shutdown Summary:**

```json
{
  "tasksCompleted": 3,
  "tasksTotal": 5,
  "pendingTasks": 2,
  "todayTasks": [{"name": "Review PR", "completed": true}],
  "focusTime": 420,
  "focusGoal": 480,
  "shutdownStreak": 5,
  "pointsEarned": 45,
  "clockedOutTime": "18:30"
}
```

---

## 🏆 Challenge & Rewards Feature

### Database Fields Needed

**Challenge Model** (New table: `challenges`):

- `id` (UUID, primary key)
- `name` (String) - Challenge name
- `description` (Text) - Challenge description
- `points` (Integer) - Points awarded
- `challenge_type` (String) - 'shutdown', 'focus', 'task', 'break'
- `target_value` (Integer) - Target to achieve
- `duration_days` (Integer, default=7)
- `is_active` (Boolean, default=True)

**ChallengeParticipant Model** (New table: `challenge_participants`):

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `challenge_id` (UUID, foreign key)
- `progress` (Integer, default=0)
- `status` (String) - 'in_progress', 'completed'
- `points_earned` (Integer, default=0)

**UserChallengeStats Model** (New table: `user_challenge_stats`):

- `user_id` (UUID, foreign key)
- `total_points` (Integer, default=0)
- `challenges_completed` (Integer, default=0)
- `weekly_points` (Integer, default=0)
- `current_shutdown_streak` (Integer, default=0)

### API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/challenges/stats` | Get user's challenge statistics |
| `GET` | `/api/challenges/week` | Get weekly challenges with progress |
| `GET` | `/api/challenges/leaders` | Get weekly leaderboard |
| `POST` | `/api/challenges/{challenge_id}/join` | Join a challenge |
| `DELETE` | `/api/challenges/{challenge_id}/leave` | Leave a challenge |

### Expected API Responses

**Weekly Challenges:**

```json
[
  {
    "id": "uuid-here",
    "name": "Healthy Boundaries",
    "description": "Log off before 5pm for 5 days",
    "points": 75,
    "challenge_type": "shutdown",
    "target_value": 5,
    "joined_count": 145,
    "progress": 2,
    "total": 5,
    "status": "in_progress"
  }
]
```

**Leaderboard:**

```json
[
  {
    "rank": 1,
    "name": "Sophie L.",
    "avatar": "/avatars/sophie.png",
    "points": 1245,
    "is_current_user": false
  }
]
```

---

## ⏰ Time Tracker Integration

### Database Fields Needed

**TimeLog Model** (Update existing) - Add these fields:

- `planned_duration` (Integer, nullable) - Planned duration in minutes
- `session_type` (String, default="work") - "focus", "break", "work"
- `status` (String, default="active") - "active", "completed", "stopped", "paused"
- `paused_at` (DateTime, nullable) - When session was paused
- `remaining_time` (Integer, nullable) - Remaining time in seconds when paused

### API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/time-log/start` | Start focus session with duration |
| `POST` | `/api/time-log/{session_id}/complete` | Complete focus session |
| `POST` | `/api/time-log/{session_id}/stop` | Stop session early |
| `POST` | `/api/time-log/{session_id}/pause` | Pause  active session for break |
| `POST` | `/api/focus-sessions/{session_id}/resume` | Resume paused session after break |
| `GET` | `/api/time-log/daily-summary` | Get daily focus session summary |
| `GET` | `/api/current-session` | Get current active session | either break or focus
| `GET` | `/api/paused-session` | Get current paused session |


### Expected API Responses

**Start Focus Session:**

```json
{
  "session_id": "uuid-here",
  "user_id": "user-uuid",
  "start_time": "2025-09-26T14:30:00Z",
  "planned_duration": 30,
  "session_type": "focus",
  "status": "active"
}
```

**Pause Focus Session:**

```json
{
  "session_id": "uuid-here",
  "user_id": "user-uuid",
  "start_time": "2025-09-26T14:30:00Z",
  "paused_at": "2025-09-26T14:45:00Z",
  "planned_duration": 30,
  "remaining_time": 900,
  "session_type": "focus",
  "status": "paused"
}
```

**Resume Focus Session:**

```json
{
  "session_id": "uuid-here",
  "user_id": "user-uuid",
  "start_time": "2025-09-26T14:30:00Z",
  "paused_at": "2025-09-26T14:45:00Z",
  "planned_duration": 30,
  "remaining_time": 900,
  "session_type": "focus",
  "status": "active"
}
```

**Get Paused Session:**

```json
{
  "session_id": "uuid-here",
  "user_id": "user-uuid",
  "start_time": "2025-09-26T14:30:00Z",
  "paused_at": "2025-09-26T14:45:00Z",
  "planned_duration": 30,
  "remaining_time": 900,
  "session_type": "focus",
  "status": "paused"
}
```

**Daily Summary:**

```json
{
  "date": "2025-09-26T00:00:00Z",
  "total_focus_sessions": 3,
  "total_focus_time": 5400,
  "total_break_time": 900,
  "focus_sessions": [
    {
      "session_id": "uuid-1",
      "start_time": "2025-09-26T09:00:00Z",
      "end_time": "2025-09-26T09:30:00Z",
      "planned_duration": 30,
      "actual_duration": 30,
      "session_type": "focus",
      "status": "completed"
    }
  ]
}
```

### Paused Session Workflow

The time tracker supports pausing focus sessions to take breaks while preserving the original session state:

1. **User starts focus session (60 min)** → `POST /api/focus-sessions/start`
2. **User pauses after 30 min to take break** → `POST /api/focus-sessions/{id}/pause`
   - Session status changes to "paused"
   - Remaining time (30 min) is stored
   - Break session can start separately
3. **Break ends, user resumes focus** → `POST /api/focus-sessions/{id}/resume`
   - Session status changes back to "active"
   - User continues with remaining 30 minutes
4. **User completes or stops session** → `POST /api/focus-sessions/{id}/complete` or `/stop`

**Key Requirements:**

- Only one active session per user at a time
- Multiple paused sessions allowed (user can pause focus, take break, pause break, etc.)
- Paused sessions persist across browser sessions/device changes
- When resuming, session continues with exact remaining time

---

## 👤 User Avatar Management

### Database Fields Needed

**User Model** (Update existing) - Add this field:

- `avatar_url` (String, nullable) - URL or path to user's avatar image

### API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `PUT` | `/api/users/profile/avatar` | Update user's avatar |
| `GET` | `/api/users/profile/avatar` | Get user's current avatar |
| `PUT` | `/api/users/onboarding/complete` | Complete onboarding with avatar |

### Expected API Responses

**Update Avatar:**

```json
{
  "id": "user-uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "avatar_url": "/avatars/avatar-1.png",
  "created_at": "2025-09-26T10:00:00Z"
}
```

**Request Format:**

```json
{
  "avatar_url": "/avatars/avatar-1.png"
}
```

### Frontend Image Processing

The frontend automatically processes uploaded avatar images:

- **Validates**: File type (JPEG/PNG/WebP) and size (max 5MB)
- **Crops**: To perfect square (center crop)
- **Resizes**: To 256x256px for optimal display
- **Optimizes**: 90% quality JPEG format
- **Result**: Consistent, high-quality avatars under 50KB

The backend receives processed base64 data URLs ready for storage or conversion.

---

## 🎯 Priority Levels

### High Priority (Needed ASAP)

1. **Tasks Enhancement** - Task completion tracking and categorization
2. **Avatar Management** - User profile avatar persistence
3. **Time Tracker Integration** - Focus session persistence and summaries

### Medium Priority

1. **Shutdown Feature** - Reflection storage and streak tracking
2. **Challenge System** - Points and leaderboard functionality

---

## 📝 Notes for Backend Team

- All frontend components are already implemented and working with localStorage
- Frontend is ready to consume these APIs immediately once available
- No complex business logic needed - mostly CRUD operations with some aggregations
- All request/response formats match what frontend expects
- Database migrations will be needed for new fields and tables

---

## 💼 Co-working Rooms Feature

### Database Fields Needed

**CoworkingRoom Model** (New table: `coworking_rooms`):

- `id` (UUID, primary key)
- `name` (String) - Room name
- `description` (String) - Room description
- `status` (String) - 'active', 'inactive'
- `max_participants` (Integer, default=10)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**RoomParticipant Model** (New table: `room_participants`):

- `id` (UUID, primary key)
- `room_id` (UUID, foreign key to coworking_rooms)
- `user_id` (UUID, foreign key to users)
- `joined_at` (DateTime)
- `is_muted` (Boolean, default=true)
- `is_speaking` (Boolean, default=false)
- `left_at` (DateTime, nullable)

**RoomMessage Model** (New table: `room_messages`):

- `id` (UUID, primary key)
- `room_id` (UUID, foreign key to coworking_rooms)
- `user_id` (UUID, foreign key to users)
- `message_text` (Text)
- `message_type` (String) - 'text', 'system', 'emoji'
- `created_at` (DateTime)

### API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/coworking/rooms` | Get all available rooms |
| `GET` | `/api/coworking/rooms/{room_id}` | Get specific room details |
| `POST` | `/api/coworking/rooms/{room_id}/join` | Join a room |
| `POST` | `/api/coworking/rooms/{room_id}/leave` | Leave a room |
| `POST` | `/api/coworking/rooms/{room_id}/messages` | Send message to room |
| `PUT` | `/api/coworking/rooms/{room_id}/mic-toggle` | Toggle microphone status |
| `PUT` | `/api/coworking/rooms/{room_id}/speaking` | Update speaking status |
| `POST` | `/api/coworking/rooms/{room_id}/emoji` | Send emoji reaction |

### Expected API Responses

**Get Rooms:**

```json
[
  {
    "id": "room-uuid",
    "name": "Focus Zone",
    "description": "Deep work sessions",
    "status": "active",
    "participant_count": 5,
    "max_participants": 10,
    "color": "bg-grayBlue"
  }
]
```

**Get Room Details:**

```json
{
  "id": "room-uuid",
  "name": "Focus Zone",
  "description": "Deep work sessions",
  "participants": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "avatar": "/avatars/john.png",
      "is_speaking": false,
      "is_muted": true,
      "joined_at": "2025-09-30T10:00:00Z"
    }
  ],
  "messages": [
    {
      "id": "msg-uuid",
      "user": "John Doe",
      "avatar": "/avatars/john.png",
      "text": "Hello everyone!",
      "time": "10:30",
      "created_at": "2025-09-30T10:30:00Z"
    }
  ],
  "tasks_completed": 0,
  "tasks_total": 0,
  "focus_time": 0,
  "focus_goal": 480
}
```

**Join Room:**

```json
{
  "success": true,
  "message": "Joined room successfully",
  "room": { /* room details */ }
}
```

### WebSocket Events (Optional for Real-time)

For real-time functionality, consider WebSocket events:

- `user_joined` - When someone joins the room
- `user_left` - When someone leaves the room
- `message_sent` - New message in room
- `mic_toggled` - User muted/unmuted
- `speaking_changed` - User started/stopped speaking
- `emoji_reaction` - Emoji reaction sent

### Frontend Implementation

The frontend uses a `coworkingService` with localStorage that:

- ✅ Manages room state and participants
- ✅ Handles real-time message synchronization
- ✅ Manages microphone permissions and audio streams
- ✅ Provides emoji reactions and chat functionality
- ✅ Persists user session across page refreshes
- ✅ Ready for WebSocket integration when backend is available

---

**Frontend Team** 💙
