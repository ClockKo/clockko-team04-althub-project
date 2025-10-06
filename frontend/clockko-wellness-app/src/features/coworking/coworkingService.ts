/*
coworkingService.ts - Enhanced co-working service with backend API integration
Handles room functionality with real-time communication through backend API
*/

import type { Room, RoomSummary, Participant, Message } from '../../types/typesGlobal';
import { webRTCService } from './webRTCService';
import * as api from './api';

// Get current user with proper name resolution (same as dashboard)
const getCurrentUser = async (): Promise<Participant> => {
  const savedAvatar = localStorage.getItem('userAvatar');
  
  // Try to get user data from the working auth endpoint
  let userData: any = null;
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Use the working auth/user endpoint
      const response = await fetch('http://localhost:8000/api/auth/user', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        userData = data; // This endpoint returns user data directly
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
  
  // Create unique session ID (for client-side reference only)
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
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private currentRoomId: string | null = null;

  constructor() {
    this.setupEventListeners();
    console.log('🏢 CoworkingService initialized with backend API integration');
  }

  // Setup event listeners for cleanup
  private setupEventListeners() {
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Cleanup method
  private cleanup() {
    if (this.currentRoomId) {
      this.leaveRoom(this.currentRoomId);
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

  // Get all available rooms using backend API
  async getRooms(): Promise<RoomSummary[]> {
    try {
      console.log('🏢 Fetching rooms from backend API...');
      const rooms = await api.fetchRooms();
      console.log('✅ Rooms fetched:', rooms);
      return rooms;
    } catch (error) {
      console.error('❌ Failed to fetch rooms:', error);
      throw error;
    }
  }

  // Get specific room details using backend API
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      console.log(`🏠 Fetching room ${roomId} from backend API...`);
      const room = await api.fetchRoom(roomId);
      console.log('✅ Room fetched:', room);
      return room;
    } catch (error) {
      console.error(`❌ Failed to fetch room ${roomId}:`, error);
      
      // Fallback to demo room creation for presentation
      console.log('🎯 Creating demo room for presentation...');
      const roomKey = `coworking_room_${roomId}`;
      let roomData = localStorage.getItem(roomKey);
      
      if (roomData) {
        return JSON.parse(roomData);
      }

      // Create demo room if doesn't exist
      const rooms = await this.getRooms();
      const roomSummary = rooms.find(r => r.id === roomId);
      
      if (roomSummary) {
        const newRoom: Room = {
          id: roomId,
          name: roomSummary.name,
          description: roomSummary.description,
          participants: [],
          messages: [
            {
              id: 'demo-msg-1',
              user: 'Demo Assistant',
              avatar: 'https://avatar.iran.liara.run/public?username=DemoAssistant',
              text: 'Welcome to the demo room! 🎉',
              time: new Date(Date.now() - 300000).toLocaleTimeString()
            }
          ],
          tasksCompleted: 3,
          tasksTotal: 8,
          focusTime: 45,
          focusGoal: 120,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(roomKey, JSON.stringify(newRoom));
        return newRoom;
      }
      
      return null;
    }
  }

  // Join a room using backend API
  async joinRoom(roomId: string): Promise<Room | null> {
    try {
      console.log(`🚪 Joining room ${roomId} via backend API...`);
      const room = await api.joinRoom(roomId);
      
      if (room) {
        this.currentRoomId = roomId;
        
        // Store current room for cleanup
        localStorage.setItem('coworking_current_room', roomId);
        
        // Initialize WebRTC for voice transmission (testing mode)
        try {
          const currentUser = await getCurrentUser();
          await webRTCService.initializeRoom(roomId, currentUser.id);
          console.log('🔗 WebRTC initialized for voice transmission');
        } catch (error) {
          console.log('⚠️ WebRTC initialization failed (continuing without voice):', error);
        }
        
        console.log(`✅ Successfully joined room "${room.name}". Total participants: ${room.participants.length}`);
        console.log('📋 Current participants:', room.participants.map(p => `${p.name} (${p.id})`));
        
        this.emit('roomJoined', { roomId, room });
      }
      
      return room;
    } catch (error) {
      console.error(`❌ Failed to join room ${roomId}:`, error);
      
      // Fallback to demo room joining for presentation
      console.log('🎯 Joining demo room for presentation...');
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
        this.currentRoomId = roomId;
        localStorage.setItem('coworking_current_room', roomId);

        console.log(`✅ ${currentUser.name} joined room "${room.name}". Total participants: ${room.participants.length}`);
        console.log('📋 Current participants:', room.participants.map(p => `${p.name} (${p.id})`));
      }

      this.emit('roomJoined', { roomId, room });
      return room;
    }
  }

  // Leave a room using backend API
  async leaveRoom(roomId: string): Promise<void> {
    try {
      console.log(`🚪 Leaving room ${roomId} via backend API...`);
      const success = await api.leaveRoom(roomId);
      
      if (success) {
        this.currentRoomId = null;
        localStorage.removeItem('coworking_current_room');
        
        console.log(`� Successfully left room ${roomId}`);
        this.emit('roomLeft', { roomId });
      }
    } catch (error) {
      console.error(`❌ Failed to leave room ${roomId}:`, error);
      
      // Fallback to demo room leaving for presentation
      console.log('🎯 Leaving demo room for presentation...');
      const room = await this.getRoom(roomId);
      if (!room) return;

      const currentUser = await getCurrentUser();
      
      // Remove user from participants
      room.participants = room.participants.filter(p => p.id !== currentUser.id);
      room.lastUpdated = Date.now();
      
      // Update room in storage
      localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));
      
      // Clear user session
      this.currentRoomId = null;
      localStorage.removeItem('coworking_current_room');

      console.log(`👋 ${currentUser.name} left room "${room.name}". Total participants: ${room.participants.length}`);
      
      this.emit('roomLeft', { roomId });
    }
  }

  // Toggle microphone mute using backend API
  async toggleMute(roomId: string): Promise<boolean> {
    try {
      console.log(`🎤 Toggling microphone in room ${roomId}...`);
      
      // Get current mute status from local state instead of searching participants
      // This avoids the name matching issue
      let currentMuteStatus = true; // Default to muted
      
      // Try to get current user's mute status from the room data
      try {
        const room = await this.getRoom(roomId);
        if (room) {
          const currentUser = await getCurrentUser();
          // Try to find participant by name or id (using properties that exist on both types)
          const participant = room.participants.find(p => 
            p.name === currentUser.name || 
            p.name === (currentUser as any).full_name ||
            p.name === (currentUser as any).username ||
            p.id === currentUser.id
          );
          if (participant) {
            currentMuteStatus = participant.muted;
            console.log(`🎯 Found participant ${participant.name}, current mute status: ${currentMuteStatus}`);
          } else {
            console.log(`⚠️ Could not find current user in participants, using default muted state`);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not get current mute status, using default:', error);
      }
      
      const newMuteStatus = !currentMuteStatus;
      console.log(`🔄 Changing mute from ${currentMuteStatus} to ${newMuteStatus}`);
      
      const resultMuteStatus = await api.toggleMicrophone(roomId, newMuteStatus);
      
      console.log(`✅ Microphone toggled: ${resultMuteStatus ? 'muted' : 'unmuted'}`);
      this.emit('micToggled', { roomId, muted: resultMuteStatus });
      return resultMuteStatus;
    } catch (error) {
      console.error(`❌ Failed to toggle microphone in room ${roomId}:`, error);
      throw error;
    }
  }

  // Update speaking status using backend API
  async updateSpeakingStatus(roomId: string, isSpeaking: boolean): Promise<void> {
    try {
      console.log(`🗣️ Updating speaking status in room ${roomId}: ${isSpeaking}`);
      const resultSpeakingStatus = await api.updateSpeakingStatus(roomId, isSpeaking);
      
      console.log(`✅ Speaking status updated: ${resultSpeakingStatus}`);
      this.emit('speakingStatusChanged', { roomId, isSpeaking: resultSpeakingStatus });
    } catch (error) {
      console.error(`❌ Failed to update speaking status in room ${roomId}:`, error);
      throw error;
    }
  }

  // Send a message using backend API
  async addMessage(roomId: string, message: Message | string): Promise<void> {
    try {
      const messageText = typeof message === 'string' ? message : message.text;
      console.log(`💬 Sending message to room ${roomId}: ${messageText}`);
      
      const result = await api.sendMessage(roomId, messageText);
      
      console.log(`✅ Message sent successfully:`, result);
      this.emit('messageAdded', { roomId, message: result });
    } catch (error) {
      console.error(`❌ Failed to send message to room ${roomId}:`, error);
      
      // Fallback to demo room messaging for presentation
      console.log('🎯 Adding message to demo room for presentation...');
      const room = await this.getRoom(roomId);
      if (!room) return;

      const currentUser = await getCurrentUser();
      const messageText = typeof message === 'string' ? message : message.text;
      
      const newMessage = {
        id: `msg-${Date.now()}`,
        user: currentUser.name,
        avatar: currentUser.avatar,
        text: messageText,
        time: new Date().toLocaleTimeString()
      };
      
      if (!room.messages) room.messages = [];
      room.messages.push(newMessage);
      room.lastUpdated = Date.now();
      
      // Update room in storage
      localStorage.setItem(`coworking_room_${roomId}`, JSON.stringify(room));
      
      console.log(`💬 Message added to demo room: ${messageText}`);
      this.emit('messageAdded', { roomId, message: newMessage });
    }
  }

  // Send emoji reaction using backend API
  async addEmojiReaction(roomId: string, emoji: string): Promise<void> {
    try {
      console.log(`😀 Sending emoji reaction to room ${roomId}: ${emoji}`);
      const result = await api.sendEmoji(roomId, emoji);
      
      console.log(`✅ Emoji sent successfully:`, result);
      this.emit('emojiReaction', { roomId, emoji, result });
    } catch (error) {
      console.error(`❌ Failed to send emoji to room ${roomId}:`, error);
      throw error;
    }
  }

  // Get current user's room session
  getCurrentSession(): { roomId: string; joinedAt: string; isMuted: boolean; isSpeaking: boolean } | null {
    try {
      const roomId = localStorage.getItem('coworking_current_room');
      if (roomId) {
        return {
          roomId,
          joinedAt: new Date().toISOString(),
          isMuted: true,
          isSpeaking: false
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Cleanup and disconnect
  disconnect(): void {
    if (this.currentRoomId) {
      this.leaveRoom(this.currentRoomId);
    }
    
    // Cleanup WebRTC connections
    webRTCService.destroy();
    
    this.eventListeners.clear();
  }

  // Get WebRTC service for direct access
  getWebRTCService() {
    return webRTCService;
  }

  // Development helper: For now, just clear localStorage since we're using backend
  clearAllRoomData(): void {
    localStorage.removeItem('coworking_current_room');
    localStorage.removeItem('coworking_session_id');
    console.log('🧹 Cleared local coworking data - backend handles room state');
  }
}

// Export singleton instance
export const coworkingService = new CoworkingService();

// For testing and backend integration
export { CoworkingService };