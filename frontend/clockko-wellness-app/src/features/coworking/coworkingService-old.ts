/*
coworkingService.ts - LocalStorage-based co-working service
Handles real-time room functionality with localStorage persistence
Ready for backend API integration
*/

import type { Room, RoomSummary, Participant, Message } from '../../types/typesGlobal';

// Current user simulation with unique session ID (replace with auth context when ready)
const getCurrentUser = (): Participant => {
  const savedAvatar = localStorage.getItem('userAvatar');
  
  // Try to get user profile from auth context if available
  let userProfile: any = {};
  try {
    // Check if UserContext has stored user data
    const storedUserData = localStorage.getItem('user') || localStorage.getItem('userData');
    if (storedUserData) {
      userProfile = JSON.parse(storedUserData);
    }
  } catch {
    console.log('No user profile found in localStorage');
  }
  
  // Create unique session ID for testing across different ports
  const port = window.location.port;
  let sessionId = localStorage.getItem('coworking_session_id');
  if (!sessionId) {
    // Use port and a simple identifier for testing different users
    const identifier = port === '5173' ? 'mariam' : port === '5174' ? 'abee' : `user_${port}`;
    sessionId = `${identifier}_${Date.now().toString().slice(-6)}`;
    localStorage.setItem('coworking_session_id', sessionId);
  }
  
  // Get username from profile or use port-based fallback
  const userName = userProfile.name || userProfile.username || userProfile.full_name || 
                   (port === '5173' ? 'Mariam' : port === '5174' ? 'Abee' : `User_${port}`);
  
  return {
    id: sessionId,
    name: userName,
    avatar: savedAvatar || `https://avatar.iran.liara.run/public?username=${userName}`,
    isSpeaking: false,
    muted: true
  };
};

class CoworkingService {
  private storageKeys = {
    rooms: 'coworking_rooms',
    currentRoom: 'coworking_current_room',
    userSession: 'coworking_user_session'
  };

  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initializeDefaultRooms();
    this.setupEventListeners();
  }

  // Setup event listeners for cleanup
  private setupEventListeners() {
    // Handle beforeunload to clean up
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Cleanup method
  private cleanup() {
    // Leave current room if in one
    const session = this.getCurrentSession();
    if (session) {
      this.leaveRoom(session.roomId);
    }
  }

  // Event system for real-time updates
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  // Initialize default rooms if none exist
  private initializeDefaultRooms() {
    const existingRooms = localStorage.getItem(this.storageKeys.rooms);
    if (!existingRooms) {
      const defaultRooms: RoomSummary[] = [
        { id: "focus", name: "Focus Zone", description: "Deep Work", status: "active", count: 12, color: "bg-grayBlue" },
        { id: "pomodoro", name: "Pomodoro Power", description: "30 min Sessions", status: "active", count: 15, color: "bg-green-50" },
        { id: "casual", name: "Casual Work", description: "Light collaboration", status: "active", count: 8, color: "bg-blue-50" },
        { id: "study", name: "Study Hall", description: "Silent study time", status: "active", count: 6, color: "bg-purple-50" },
      ];
      localStorage.setItem(this.storageKeys.rooms, JSON.stringify(defaultRooms));
    }
  }

  // Get all available rooms
  async getRooms(): Promise<RoomSummary[]> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const rooms = JSON.parse(localStorage.getItem(this.storageKeys.rooms) || '[]');
      
      // Update room counts based on current participants
      rooms.forEach((room: RoomSummary) => {
        const roomData = localStorage.getItem(`coworking_room_${room.id}`);
        if (roomData) {
          const fullRoom = JSON.parse(roomData);
          room.count = fullRoom.participants ? fullRoom.participants.length : 0;
        } else {
          room.count = 0;
        }
      });
      
      // Save updated counts
      localStorage.setItem(this.storageKeys.rooms, JSON.stringify(rooms));
      
      return rooms;
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      return [];
    }
  }

  // Get specific room details
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      // Try to get room from shared storage first
      let room = sharedStorage.getRoom(roomId);
      
      if (room) {
        return room;
      }

      // Create new room if doesn't exist
      const rooms = await this.getRooms();
      const roomSummary = rooms.find(r => r.id === roomId);
      
      if (roomSummary) {
        const newRoom: Room = {
          id: roomId,
          name: roomSummary.name,
          description: roomSummary.description,
          participants: [], // Will be managed by shared storage
          messages: [],
          tasksCompleted: 0,
          tasksTotal: 0,
          focusTime: 0,
          focusGoal: 480, // 8 hours default
          lastUpdated: Date.now()
        };
        
        // Save to shared storage
        sharedStorage.updateRoom(roomId, newRoom);
        return newRoom;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch room:', error);
      return null;
    }
  }

  // Join a room
  async joinRoom(roomId: string): Promise<Room | null> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return null;

      const currentUser = getCurrentUser();
      
      // Register user in shared storage
      sharedStorage.registerActiveUser(roomId, currentUser);
      
      // Get updated room with live participants
      const updatedRoom = sharedStorage.getRoom(roomId);
      if (!updatedRoom) return null;
      
      // Update user's current room session
      localStorage.setItem(this.storageKeys.currentRoom, roomId);
      localStorage.setItem(this.storageKeys.userSession, JSON.stringify({
        roomId,
        joinedAt: new Date().toISOString(),
        isMuted: true,
        isSpeaking: false
      }));

      // Add system message
      await this.addMessage(roomId, {
        id: `system_${Date.now()}`,
        user: 'System',
        avatar: '',
        text: `${currentUser.name} joined the room`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      console.log(`${currentUser.name} joined room ${roomId}. Total participants: ${updatedRoom.participants.length}`);
      this.emit('roomJoined', { roomId, room: updatedRoom });
      return updatedRoom;
    } catch (error) {
      console.error('Failed to join room:', error);
      return null;
    }
  }

  // Leave a room
  async leaveRoom(roomId: string): Promise<void> {
    try {
      const currentUser = getCurrentUser();
      
      // Remove user from shared storage
      sharedStorage.removeActiveUser();
      
      // Clear user session
      localStorage.removeItem(this.storageKeys.currentRoom);
      localStorage.removeItem(this.storageKeys.userSession);

      // Add system message
      await this.addMessage(roomId, {
        id: `system_${Date.now()}`,
        user: 'System',
        avatar: '',
        text: `${currentUser.name} left the room`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      console.log(`${currentUser.name} left room ${roomId}`);
      this.emit('roomLeft', { roomId });
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }

  // Update user's mic status
  async toggleMute(roomId: string): Promise<boolean> {
    try {
      const currentUser = getCurrentUser();
      
      // Update user session first
      const session = JSON.parse(localStorage.getItem(this.storageKeys.userSession) || '{}');
      const newMutedState = !session.isMuted;
      session.isMuted = newMutedState;
      localStorage.setItem(this.storageKeys.userSession, JSON.stringify(session));
      
      // Update user status in shared storage
      sharedStorage.updateUserStatus({
        muted: newMutedState,
        isSpeaking: newMutedState ? false : session.isSpeaking || false
      });

      console.log(`${currentUser.name} ${newMutedState ? 'muted' : 'unmuted'} in room ${roomId}`);
      this.emit('micToggled', { roomId, muted: newMutedState });
      return newMutedState;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      return false;
    }
  }

  // Update speaking status
  async updateSpeakingStatus(roomId: string, isSpeaking: boolean): Promise<void> {
    try {
      // Update user status in shared storage
      sharedStorage.updateUserStatus({
        isSpeaking: isSpeaking
      });

      this.emit('speakingStatusChanged', { roomId, isSpeaking });
    } catch (error) {
      console.error('Failed to update speaking status:', error);
    }
  }

  // Send a message
  async addMessage(roomId: string, message: Message): Promise<void> {
    try {
      const room = sharedStorage.getRoom(roomId);
      if (!room) return;

      room.messages = room.messages || [];
      room.messages.push(message);
      
      // Keep only last 50 messages
      if (room.messages.length > 50) {
        room.messages = room.messages.slice(-50);
      }
      
      // Update room in shared storage
      sharedStorage.updateRoom(roomId, room);

      console.log(`Message added to room ${roomId}: ${message.text}`);
      this.emit('messageAdded', { roomId, message });
    } catch (error) {
      console.error('Failed to add message:', error);
    }
  }

  // Send emoji reaction
  async addEmojiReaction(roomId: string, emoji: string): Promise<void> {
    try {
      const currentUser = getCurrentUser();
      
      // Store reaction in shared storage for cross-browser sync
      const reactionKey = `coworking_reactions_${roomId}`;
      const reactions = JSON.parse(localStorage.getItem(reactionKey) || '[]');
      const newReaction = {
        id: Date.now(),
        emoji,
        user: currentUser.name,
        timestamp: Date.now()
      };
      
      reactions.push(newReaction);
      // Keep only last 10 reactions
      if (reactions.length > 10) {
        reactions.splice(0, reactions.length - 10);
      }
      localStorage.setItem(reactionKey, JSON.stringify(reactions));

      this.emit('emojiReaction', { roomId, emoji, user: currentUser.name });
      
      // Trigger storage event for cross-browser sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: reactionKey,
        newValue: JSON.stringify(reactions)
      }));
      
      console.log(`${currentUser.name} reacted with ${emoji} in room ${roomId}`);
    } catch (error) {
      console.error('Failed to add emoji reaction:', error);
    }
  }

  // Get current user's room session
  getCurrentSession(): { roomId: string; joinedAt: string; isMuted: boolean; isSpeaking: boolean } | null {
    try {
      const session = localStorage.getItem(this.storageKeys.userSession);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  // Cleanup and disconnect
  disconnect(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.leaveRoom(session.roomId);
    }
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const coworkingService = new CoworkingService();

// For testing and backend integration
export { CoworkingService };