/*
SharedStorage - Cross-port communication system for co-working rooms
Simulates a shared backend using localStorage with cross-tab/cross-port synchronization
*/

import type { Room, RoomSummary, Participant } from '../../types/typesGlobal';

class SharedStorageService {
  private readonly SHARED_PREFIX = 'clockko_shared_';
  private readonly ACTIVE_USERS_KEY = 'clockko_active_users';
  private readonly SESSION_TIMEOUT = 60000; // 1 minute timeout
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private currentUserId: string | null = null;

  constructor() {
    this.startHeartbeat();
    this.cleanupInactiveUsers();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.removeActiveUser();
    });
  }

  // Generate unique user ID for this session
  generateUserId(): string {
    if (this.currentUserId) return this.currentUserId;
    
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const port = window.location.port || '3000';
    const timestamp = Date.now();
    const userName = userProfile.name || userProfile.username || 'Anonymous';
    
    this.currentUserId = `${userName.toLowerCase().replace(/\s+/g, '_')}_${port}_${timestamp}`;
    return this.currentUserId;
  }

  // Register user as active
  registerActiveUser(roomId: string, userData: Participant): void {
    const userId = this.generateUserId();
    const activeUsers = this.getActiveUsers();
    
    activeUsers[userId] = {
      ...userData,
      id: userId,
      roomId,
      lastSeen: Date.now(),
      port: window.location.port || '3000'
    };
    
    localStorage.setItem(this.ACTIVE_USERS_KEY, JSON.stringify(activeUsers));
    console.log(`Registered user ${userData.name} in room ${roomId}`);
  }

  // Remove user from active list
  removeActiveUser(): void {
    if (!this.currentUserId) return;
    
    const activeUsers = this.getActiveUsers();
    delete activeUsers[this.currentUserId];
    localStorage.setItem(this.ACTIVE_USERS_KEY, JSON.stringify(activeUsers));
    console.log(`Removed user ${this.currentUserId} from active list`);
  }

  // Get all active users
  getActiveUsers(): Record<string, Participant & { roomId: string; lastSeen: number; port: string }> {
    try {
      return JSON.parse(localStorage.getItem(this.ACTIVE_USERS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  // Get active users for a specific room
  getActiveUsersInRoom(roomId: string): Participant[] {
    const activeUsers = this.getActiveUsers();
    const now = Date.now();
    
    return Object.values(activeUsers)
      .filter(user => 
        user.roomId === roomId && 
        (now - user.lastSeen) < this.SESSION_TIMEOUT
      )
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isSpeaking: user.isSpeaking || false,
        muted: user.muted !== false // Default to muted
      }));
  }

  // Get room participant count
  getRoomParticipantCount(roomId: string): number {
    return this.getActiveUsersInRoom(roomId).length;
  }

  // Update room data with shared storage
  updateRoom(roomId: string, room: Room): void {
    const key = `${this.SHARED_PREFIX}room_${roomId}`;
    const roomData = {
      ...room,
      lastUpdated: Date.now(),
      participants: this.getActiveUsersInRoom(roomId) // Always use live participant data
    };
    
    localStorage.setItem(key, JSON.stringify(roomData));
  }

  // Get room from shared storage
  getRoom(roomId: string): Room | null {
    try {
      const key = `${this.SHARED_PREFIX}room_${roomId}`;
      const roomData = localStorage.getItem(key);
      
      if (roomData) {
        const room = JSON.parse(roomData);
        // Always refresh participants from active users
        room.participants = this.getActiveUsersInRoom(roomId);
        return room;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  // Update user status in room
  updateUserStatus(updates: Partial<Participant>): void {
    if (!this.currentUserId) return;
    
    const activeUsers = this.getActiveUsers();
    if (activeUsers[this.currentUserId]) {
      Object.assign(activeUsers[this.currentUserId], updates, {
        lastSeen: Date.now()
      });
      localStorage.setItem(this.ACTIVE_USERS_KEY, JSON.stringify(activeUsers));
    }
  }

  // Start heartbeat to keep user active
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUserId) {
        const activeUsers = this.getActiveUsers();
        if (activeUsers[this.currentUserId]) {
          activeUsers[this.currentUserId].lastSeen = Date.now();
          localStorage.setItem(this.ACTIVE_USERS_KEY, JSON.stringify(activeUsers));
        }
      }
    }, 15000); // Update every 15 seconds
  }

  // Clean up inactive users
  private cleanupInactiveUsers(): void {
    setInterval(() => {
      const activeUsers = this.getActiveUsers();
      const now = Date.now();
      let hasChanges = false;

      Object.keys(activeUsers).forEach(userId => {
        if ((now - activeUsers[userId].lastSeen) > this.SESSION_TIMEOUT) {
          delete activeUsers[userId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem(this.ACTIVE_USERS_KEY, JSON.stringify(activeUsers));
        console.log('Cleaned up inactive users');
      }
    }, 30000); // Clean up every 30 seconds
  }

  // Get all rooms with accurate participant counts
  getAllRoomsWithCounts(): RoomSummary[] {
    const defaultRooms: RoomSummary[] = [
      { id: "focus", name: "Focus Zone", description: "Deep Work", status: "active", count: 0, color: "bg-grayBlue" },
      { id: "pomodoro", name: "Pomodoro Power", description: "30 min Sessions", status: "active", count: 0, color: "bg-green-50" },
      { id: "casual", name: "Casual Work", description: "Light collaboration", status: "active", count: 0, color: "bg-blue-50" },
      { id: "study", name: "Study Hall", description: "Silent study time", status: "active", count: 0, color: "bg-purple-50" },
    ];

    // Update counts with actual active users
    return defaultRooms.map(room => ({
      ...room,
      count: this.getRoomParticipantCount(room.id)
    }));
  }

  // Cleanup method
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.removeActiveUser();
  }
}

// Export singleton instance
export const sharedStorage = new SharedStorageService();