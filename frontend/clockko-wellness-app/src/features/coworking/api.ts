import axios from 'axios';
import type { RoomSummary, Room } from "../../types/typesGlobal";
// Temporarily comment out localStorage fallback for debugging
// import { coworkingService } from "./coworkingService";

// Helper function to get auth token
const getAuthToken = (): string => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
      
      console.log(`📡 Axios Request: ${config.method?.toUpperCase()} ${config.url}`, `Token: ${token.substring(0, 20)}...`);
    } catch (error) {
      console.error('❌ Auth Token Error:', error);
      // Don't fail the request, let the server return 401
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Axios Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.detail || error.message;
    console.error(`❌ Axios Error: ${error.response?.status || 'Network'} ${error.config?.url}`, errorMsg);
    throw new Error(`API call failed: ${error.response?.status || 'Network Error'} - ${errorMsg}`);
  }
);

// API functions for co-working rooms
export async function fetchRooms(): Promise<RoomSummary[]> {
  try {
    console.log('🏢 Fetching rooms from backend API...');
    const response = await api.get('/coworking/rooms');
    const rooms = response.data;
    
    console.log('✅ Rooms fetched successfully:', rooms);
    
    // Transform backend response to frontend format
    return rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      status: room.status,
      count: room.participant_count,
      color: room.color || 'bg-blue-50' // Default color if not provided
    }));
  } catch (error) {
    console.error('❌ Failed to fetch rooms from backend:', error);
    throw error;
  }
}

export async function fetchRoom(roomId: string): Promise<Room | null> {
  try {
    console.log(`🏠 Fetching room details for ${roomId} from backend API...`);
    const response = await api.get(`/coworking/rooms/${roomId}`);
    const room = response.data;
    
    console.log('✅ Room details fetched successfully:', room);
    
    // Transform backend response to frontend format
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      participants: room.participants.map((p: any) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isSpeaking: p.is_speaking,
        muted: p.is_muted
      })),
      messages: room.messages.map((m: any) => ({
        id: m.id,
        user: m.user,
        avatar: m.avatar,
        text: m.text,
        time: m.time
      })),
      tasksCompleted: room.tasks_completed,
      tasksTotal: room.tasks_total,
      focusTime: room.focus_time,
      focusGoal: room.focus_goal,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error(`❌ Failed to fetch room ${roomId} from backend:`, error);
    throw error;
  }
}

export async function joinRoom(roomId: string): Promise<Room | null> {
  try {
    console.log(`🚪 Joining room ${roomId} via backend API...`);
    const response = await api.post(`/coworking/rooms/${roomId}/join`);
    const result = response.data;
    
    console.log('✅ Joined room successfully:', result);
    
    if (result.success && result.room) {
      // Transform backend response to frontend format
      return {
        id: result.room.id,
        name: result.room.name,
        description: result.room.description,
        participants: result.room.participants.map((p: any) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isSpeaking: p.is_speaking,
          muted: p.is_muted
        })),
        messages: result.room.messages.map((m: any) => ({
          id: m.id,
          user: m.user,
          avatar: m.avatar,
          text: m.text,
          time: m.time
        })),
        tasksCompleted: result.room.tasks_completed,
        tasksTotal: result.room.tasks_total,
        focusTime: result.room.focus_time,
        focusGoal: result.room.focus_goal,
        lastUpdated: Date.now()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Failed to join room ${roomId}:`, error);
    throw error;
  }
}

export async function leaveRoom(roomId: string): Promise<boolean> {
  try {
    console.log(`🚪 Leaving room ${roomId} via backend API...`);
    const response = await api.post(`/coworking/rooms/${roomId}/leave`);
    const result = response.data;
    
    console.log('✅ Left room successfully:', result);
    return result.success;
  } catch (error) {
    console.error(`❌ Failed to leave room ${roomId}:`, error);
    throw error;
  }
}

export async function sendMessage(roomId: string, messageText: string): Promise<any> {
  try {
    console.log(`💬 Sending message to room ${roomId}:`, messageText);
    const response = await api.post(`/coworking/rooms/${roomId}/messages`, {
      message_text: messageText,
      message_type: 'text'
    });
    const result = response.data;
    
    console.log('✅ Message sent successfully:', result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send message to room ${roomId}:`, error);
    throw error;
  }
}

export async function toggleMicrophone(roomId: string, isMuted: boolean): Promise<boolean> {
  try {
    console.log(`🎤 Toggling microphone in room ${roomId}, muted: ${isMuted}`);
    const response = await api.put(`/coworking/rooms/${roomId}/mic-toggle`, {
      is_muted: isMuted
    });
    const result = response.data;
    
    console.log('✅ Microphone toggled successfully:', result);
    return result.is_muted;
  } catch (error) {
    console.error(`❌ Failed to toggle microphone in room ${roomId}:`, error);
    throw error;
  }
}

export async function updateSpeakingStatus(roomId: string, isSpeaking: boolean): Promise<boolean> {
  try {
    console.log(`🗣️ Updating speaking status in room ${roomId}, speaking: ${isSpeaking}`);
    const response = await api.put(`/coworking/rooms/${roomId}/speaking`, {
      is_speaking: isSpeaking
    });
    const result = response.data;
    
    console.log('✅ Speaking status updated successfully:', result);
    return result.is_speaking;
  } catch (error) {
    console.error(`❌ Failed to update speaking status in room ${roomId}:`, error);
    throw error;
  }
}

export async function sendEmoji(roomId: string, emoji: string): Promise<any> {
  try {
    console.log(`😀 Sending emoji reaction to room ${roomId}:`, emoji);
    const response = await api.post(`/coworking/rooms/${roomId}/emoji`, {
      emoji
    });
    const result = response.data;
    
    console.log('✅ Emoji sent successfully:', result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send emoji to room ${roomId}:`, error);
    throw error;
  }
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting room ${roomId}...`);
    const response = await api.delete(`/coworking/rooms/${roomId}`);
    const result = response.data;
    
    console.log('✅ Room deleted successfully:', result);
    return result.success;
  } catch (error) {
    console.error(`❌ Failed to delete room ${roomId}:`, error);
    throw error;
  }
}