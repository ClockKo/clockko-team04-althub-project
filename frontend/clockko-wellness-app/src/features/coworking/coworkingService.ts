/*
coworkingService.ts - Simple localStorage-based co-working service
Handles room functionality with proper user names and real participant counts
Ready for backend API integration
*/

import type { Room, RoomSummary, Participant, Message } from '../../types/typesGlobal';

// Get current user with proper name resolution (same as dashboard)
const getCurrentUser = async (): Promise<Participant> => {
  const savedAvatar = localStorage.getItem('userAvatar');
  
  // Try to get user data the same way the dashboard does
  let userData: any = null;
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Use the same API call as dashboard
      const response = await fetch('http://localhost:8000/api/users/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        userData = data.user || data; // Support both nested and flat response formats
        console.log('🎯 Coworking: Fetched user data from API:', userData);
      }
    }
  } catch (error) {
    console.log('Could not fetch user data from API:', error);
  }
  
  // Fallback to localStorage if API fails
  if (!userData) {
    try {
      const storedUserData = localStorage.getItem('user') || 
                            localStorage.getItem('userData') || 
                            localStorage.getItem('userProfile');
      if (storedUserData) {
        userData = JSON.parse(storedUserData);
        console.log('🎯 Coworking: Using stored user data:', userData);
      }
    } catch {
      console.log('No user profile found in localStorage');
    }
  }
  
  // Create unique session ID
  const port = window.location.port;
  let sessionId = localStorage.getItem('coworking_session_id');
  if (!sessionId) {
    sessionId = `${userData?.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}_${port}_${Date.now().toString().slice(-6)}`;
    localStorage.setItem('coworking_session_id', sessionId);
  }
  
  // Use the same name resolution logic as the dashboard
  const userName = userData?.name || userData?.username || userData?.full_name || 
                   (port === '5173' ? 'Mariam' : port === '5174' ? 'Abee' : `User_${port}`);
  
  console.log('🎯 Coworking: Final user name:', userName);
  
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
    // Force reset rooms to ensure clean state for demonstration
    this.resetAllRooms();
  }

  // Force reset all rooms to empty state
  private resetAllRooms() {
    const roomIds = ["focus", "pomodoro", "casual", "study"];
    roomIds.forEach(roomId => {
      localStorage.removeItem(`coworking_room_${roomId}`);
    });
    console.log('🔄 Reset all rooms to empty state');
  }

  // Setup event listeners for cleanup
  private setupEventListeners() {
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Cleanup method
  private cleanup() {
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
    // Always reset rooms to ensure clean state
    const defaultRooms: RoomSummary[] = [
      { id: "focus", name: "Focus Zone", description: "Deep Work", status: "active", count: 0, color: "bg-grayBlue" },
      { id: "pomodoro", name: "Pomodoro Power", description: "30 min Sessions", status: "active", count: 0, color: "bg-green-50" },
      { id: "casual", name: "Casual Work", description: "Light collaboration", status: "active", count: 0, color: "bg-blue-50" },
      { id: "study", name: "Study Hall", description: "Silent study time", status: "active", count: 0, color: "bg-purple-50" },
    ];
    
    localStorage.setItem(this.storageKeys.rooms, JSON.stringify(defaultRooms));
    
    // Clear any existing room data to ensure fresh start
    defaultRooms.forEach(room => {
      localStorage.removeItem(`coworking_room_${room.id}`);
    });
    
    console.log('🏢 Initialized clean rooms with zero participants');
  }

  // Get all available rooms with accurate counts
  async getRooms(): Promise<RoomSummary[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      
      const rooms = JSON.parse(localStorage.getItem(this.storageKeys.rooms) || '[]');
      
      // Update room counts based on actual participants
      rooms.forEach((room: RoomSummary) => {
        const roomData = localStorage.getItem(`coworking_room_${room.id}`);
        if (roomData) {
          const fullRoom = JSON.parse(roomData);
          room.count = fullRoom.participants ? fullRoom.participants.length : 0;
        } else {
          room.count = 0;
        }
      });
      
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
      const roomKey = `coworking_room_${roomId}`;
      const roomData = localStorage.getItem(roomKey);
      
      if (roomData) {
        return JSON.parse(roomData);
      }

      // Create new room if doesn't exist
      const rooms = await this.getRooms();
      const roomSummary = rooms.find(r => r.id === roomId);
      
      if (roomSummary) {
        const newRoom: Room = {
          id: roomId,
          name: roomSummary.name,
          description: roomSummary.description,
          participants: [],
          messages: [],
          tasksCompleted: 0,
          tasksTotal: 0,
          focusTime: 0,
          focusGoal: 480,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(roomKey, JSON.stringify(newRoom));
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

      const currentUser = await getCurrentUser();
      
      // Check if user is already in room
      const existingParticipant = room.participants.find(p => p.id === currentUser.id);
      if (!existingParticipant) {
        room.participants.push(currentUser);
        room.lastUpdated = Date.now();
        
        // Update room in storage
        localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));
        
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

        console.log(`✅ ${currentUser.name} joined room "${room.name}". Total participants: ${room.participants.length}`);
        
        // Log all current participants for debugging
        console.log('📋 Current participants:', room.participants.map(p => `${p.name} (${p.id})`));
      }

      this.emit('roomJoined', { roomId, room });
      return room;
    } catch (error) {
      console.error('Failed to join room:', error);
      return null;
    }
  }

  // Leave a room
  async leaveRoom(roomId: string): Promise<void> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return;

      const currentUser = await getCurrentUser();
      
      // Remove user from participants
      room.participants = room.participants.filter(p => p.id !== currentUser.id);
      room.lastUpdated = Date.now();
      
      // Update room in storage
      localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));
      
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

      console.log(`👋 ${currentUser.name} left room "${room.name}". Total participants: ${room.participants.length}`);
      
      // Log remaining participants for debugging
      if (room.participants.length > 0) {
        console.log('📋 Remaining participants:', room.participants.map(p => `${p.name} (${p.id})`));
      } else {
        console.log('📭 Room is now empty');
      }
      this.emit('roomLeft', { roomId });
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }

  // Toggle microphone mute
  async toggleMute(roomId: string): Promise<boolean> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      const currentUser = await getCurrentUser();
      const participant = room.participants.find(p => p.id === currentUser.id);
      
      if (participant) {
        participant.muted = !participant.muted;
        room.lastUpdated = Date.now();
        
        localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));
        
        // Update user session
        const session = JSON.parse(localStorage.getItem(this.storageKeys.userSession) || '{}');
        session.isMuted = participant.muted;
        localStorage.setItem(this.storageKeys.userSession, JSON.stringify(session));

        console.log(`${currentUser.name} ${participant.muted ? 'muted' : 'unmuted'} in room ${roomId}`);
        this.emit('micToggled', { roomId, muted: participant.muted });
        return participant.muted;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      return false;
    }
  }

  // Update speaking status
  async updateSpeakingStatus(roomId: string, isSpeaking: boolean): Promise<void> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return;

      const currentUser = await getCurrentUser();
      const participant = room.participants.find(p => p.id === currentUser.id);
      
      if (participant) {
        participant.isSpeaking = isSpeaking && !participant.muted;
        room.lastUpdated = Date.now();
        
        localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));
        this.emit('speakingStatusChanged', { roomId, isSpeaking: participant.isSpeaking });
      }
    } catch (error) {
      console.error('Failed to update speaking status:', error);
    }
  }

  // Send a message
  async addMessage(roomId: string, message: Message): Promise<void> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return;

      room.messages = room.messages || [];
      room.messages.push(message);
      
      // Keep only last 50 messages
      if (room.messages.length > 50) {
        room.messages = room.messages.slice(-50);
      }
      
      room.lastUpdated = Date.now();
      localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));

      console.log(`Message added to room ${roomId}: ${message.text}`);
      this.emit('messageAdded', { roomId, message });
    } catch (error) {
      console.error('Failed to add message:', error);
    }
  }

  // Send emoji reaction
  async addEmojiReaction(roomId: string, emoji: string): Promise<void> {
    try {
      const currentUser = await getCurrentUser();
      
      console.log(`${currentUser.name} reacted with ${emoji} in room ${roomId}`);
      this.emit('emojiReaction', { roomId, emoji, user: currentUser.name });
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

  // Development helper: Clear all room data
  clearAllRoomData(): void {
    const roomIds = ["focus", "pomodoro", "casual", "study"];
    roomIds.forEach(roomId => {
      localStorage.removeItem(`coworking_room_${roomId}`);
    });
    localStorage.removeItem(this.storageKeys.rooms);
    localStorage.removeItem(this.storageKeys.currentRoom);
    localStorage.removeItem(this.storageKeys.userSession);
    this.initializeDefaultRooms();
    console.log('🧹 Cleared all room data and reinitialized');
  }
}

// Export singleton instance
export const coworkingService = new CoworkingService();

// For testing and backend integration
export { CoworkingService };