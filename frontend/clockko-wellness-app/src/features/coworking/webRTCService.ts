/*
WebRTC Service for Co-working Audio Streaming
Handles peer-to-peer audio connections between users in the same room
*/

interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface AudioMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  data: any;
  from: string;
  to?: string;
  roomId: string;
}

export class WebRTCService {
  private peers: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  
  // ICE servers for NAT traversal
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  constructor() {
    this.setupMessageListener();
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  // Initialize WebRTC for a room
  async initializeRoom(roomId: string, userId: string): Promise<void> {
    this.roomId = roomId;
    this.userId = userId;
    
    console.log(`🔗 WebRTC: Initializing for room ${roomId}, user ${userId}`);
    
    // Clean up any existing connections
    this.cleanup();
    
    // Get local audio stream with mobile-optimized settings
    try {
      // Mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: isMobile ? 16000 : 48000, // Lower sample rate for mobile
        channelCount: 1, // Mono for better mobile performance
        ...(isMobile && {
          // Mobile-specific optimizations
          latency: 0.2, // Reduce latency for mobile
          volume: 1.0
        })
      };
      
      console.log(`🎵 WebRTC: Requesting audio stream (${isMobile ? 'Mobile' : 'Desktop'} mode)`);
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });
      
      console.log('🎵 WebRTC: Local audio stream acquired');
      this.emit('localStreamReady', this.localStream);
      
      // Announce presence to room
      this.broadcastMessage({
        type: 'user-joined',
        data: { userId },
        from: userId,
        roomId
      });
      
    } catch (error) {
      console.error('❌ WebRTC: Failed to get local stream:', error);
      throw error;
    }
  }

  // Create peer connection for a user
  private async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log(`🔊 WebRTC: Received remote stream from ${peerId}`);
      const [remoteStream] = event.streams;
      this.emit('remoteStreamReceived', { peerId, stream: remoteStream });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendMessage({
          type: 'ice-candidate',
          data: event.candidate,
          from: this.userId!,
          to: peerId,
          roomId: this.roomId!
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 WebRTC: Connection with ${peerId} is ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === 'connected') {
        this.emit('peerConnected', peerId);
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        this.emit('peerDisconnected', peerId);
        this.removePeer(peerId);
      }
    };

    this.peers.set(peerId, {
      id: peerId,
      connection: peerConnection
    });

    return peerConnection;
  }

  // Handle incoming user joined
  private async handleUserJoined(peerId: string): Promise<void> {
    if (peerId === this.userId || this.peers.has(peerId)) return;

    console.log(`👋 WebRTC: User ${peerId} joined, creating offer`);
    
    const peerConnection = await this.createPeerConnection(peerId);
    
    // Create and send offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.sendMessage({
        type: 'offer',
        data: offer,
        from: this.userId!,
        to: peerId,
        roomId: this.roomId!
      });
    } catch (error) {
      console.error(`❌ WebRTC: Failed to create offer for ${peerId}:`, error);
    }
  }

  // Handle incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit, fromPeer: string): Promise<void> {
    if (this.peers.has(fromPeer)) return;

    console.log(`📥 WebRTC: Received offer from ${fromPeer}`);
    
    const peerConnection = await this.createPeerConnection(fromPeer);
    
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.sendMessage({
        type: 'answer',
        data: answer,
        from: this.userId!,
        to: fromPeer,
        roomId: this.roomId!
      });
    } catch (error) {
      console.error(`❌ WebRTC: Failed to handle offer from ${fromPeer}:`, error);
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit, fromPeer: string): Promise<void> {
    const peer = this.peers.get(fromPeer);
    if (!peer) return;

    console.log(`📥 WebRTC: Received answer from ${fromPeer}`);
    
    try {
      await peer.connection.setRemoteDescription(answer);
    } catch (error) {
      console.error(`❌ WebRTC: Failed to handle answer from ${fromPeer}:`, error);
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit, fromPeer: string): Promise<void> {
    const peer = this.peers.get(fromPeer);
    if (!peer) return;

    try {
      await peer.connection.addIceCandidate(candidate);
    } catch (error) {
      console.error(`❌ WebRTC: Failed to add ICE candidate from ${fromPeer}:`, error);
    }
  }

  // Handle user left
  private handleUserLeft(peerId: string): void {
    console.log(`👋 WebRTC: User ${peerId} left`);
    this.removePeer(peerId);
  }

  // Remove peer connection
  private removePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.connection.close();
      this.peers.delete(peerId);
      this.emit('peerRemoved', peerId);
    }
  }

  // Setup message listener (simulated with localStorage for demo)
  private setupMessageListener(): void {
    // In a real implementation, this would be WebSocket or Socket.IO
    // For now, we'll simulate with localStorage events
    window.addEventListener('storage', (event) => {
      if (event.key === 'webrtc_messages') {
        try {
          const messages = JSON.parse(event.newValue || '[]');
          messages.forEach((message: AudioMessage) => {
            if (message.roomId === this.roomId && message.to === this.userId) {
              this.handleMessage(message);
            }
          });
          // Clear processed messages
          localStorage.setItem('webrtc_messages', '[]');
        } catch (error) {
          console.error('Failed to process WebRTC messages:', error);
        }
      }
    });
  }

  // Handle incoming message
  private async handleMessage(message: AudioMessage): Promise<void> {
    switch (message.type) {
      case 'user-joined':
        await this.handleUserJoined(message.from);
        break;
      case 'offer':
        await this.handleOffer(message.data, message.from);
        break;
      case 'answer':
        await this.handleAnswer(message.data, message.from);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message.data, message.from);
        break;
      case 'user-left':
        this.handleUserLeft(message.from);
        break;
    }
  }

  // Send message to other peers
  private sendMessage(message: AudioMessage): void {
    // In a real implementation, this would be sent via WebSocket
    // For demo, we'll use localStorage
    try {
      const messages = JSON.parse(localStorage.getItem('webrtc_messages') || '[]');
      messages.push(message);
      localStorage.setItem('webrtc_messages', JSON.stringify(messages));
      
      // Trigger storage event for other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'webrtc_messages',
        newValue: JSON.stringify(messages)
      }));
    } catch (error) {
      console.error('Failed to send WebRTC message:', error);
    }
  }

  // Broadcast message to all peers in room
  private broadcastMessage(message: Omit<AudioMessage, 'to'>): void {
    // In a real implementation, this would broadcast to all room members
    // For demo, we'll store in a broadcast channel
    try {
      const broadcast = JSON.parse(localStorage.getItem('webrtc_broadcast') || '[]');
      broadcast.push({ ...message, timestamp: Date.now() });
      localStorage.setItem('webrtc_broadcast', JSON.stringify(broadcast));
    } catch (error) {
      console.error('Failed to broadcast WebRTC message:', error);
    }
  }

  // Mute/unmute local audio
  setMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
      console.log(`🎵 WebRTC: Local audio ${muted ? 'muted' : 'unmuted'}`);
      this.emit('localMuteChanged', muted);
    }
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get connected peers
  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys());
  }

  // Leave room and cleanup
  leaveRoom(): void {
    if (this.roomId && this.userId) {
      this.broadcastMessage({
        type: 'user-left',
        data: { userId: this.userId },
        from: this.userId,
        roomId: this.roomId
      });
    }
    
    this.cleanup();
  }

  // Cleanup all connections
  private cleanup(): void {
    // Close all peer connections
    this.peers.forEach(peer => {
      peer.connection.close();
    });
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    console.log('🧹 WebRTC: Cleanup completed');
  }

  // Destroy service
  destroy(): void {
    this.cleanup();
    this.eventListeners.clear();
    this.roomId = null;
    this.userId = null;
  }
}

// Export singleton instance
export const webRTCService = new WebRTCService();