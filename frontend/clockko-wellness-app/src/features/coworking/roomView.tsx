import { useEffect, useState, useRef } from 'react'
import { fetchRoom } from './api'
import { coworkingService } from './coworkingService'
import type { Room, Message } from '../../types/typesGlobal'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { Mic, MicOff, Smile, MessageSquare, Phone, Building2 } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProgressCard } from '@/pages/dashboard'
import toast from 'react-hot-toast'


const EMOJIS = ['💜', '😂', '🙂', '👏', '👍', '🎉','🤣','😊']

export default function RoomView({ roomId, roomName, onLeaveRoom }: { roomId: string, roomName?: string, onLeaveRoom?: () => void }) {
  const [isMuted, setIsMuted] = useState(true);
  const [showChat, setShowChat] = useState(false)
  const [showProgressDropdown, setShowProgressDropdown] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showEmojis, setShowEmojis] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string; x: number }>>([])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [displayRoomName, setDisplayRoomName] = useState<string>(roomName || "");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMicActivity, setShowMicActivity] = useState(false);
  // const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [webRTCStatus, setWebRTCStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  // const [isAudioTransmitting, setIsAudioTransmitting] = useState(false); // TODO: Set to true when backend ready


  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasFetched = useRef(false);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

// Microphone management - Mobile-friendly approach (restored working version)
useEffect(() => {
  if (!isMuted) {
    // Request microphone access with mobile-optimized settings
    navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      } 
    }).then((stream) => {
      streamRef.current = stream;
      
      // Set up audio element for both desktop and mobile
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
        // On mobile: mute local playback to prevent feedback
        // On desktop: allow playback for monitoring
        audioRef.current.muted = isMobile;
        
        // Explicitly play to activate stream (required for mobile)
        audioRef.current.play().catch((err) => {
          console.log('Audio playback activation:', err);
        });
      }
      
      console.log(`🎵 ${isMobile ? 'Mobile' : 'Desktop'}: Microphone active (local feedback)`);
      toast.success('Microphone is active');
      setShowMicActivity(true);
      setWebRTCStatus('disconnected'); // No real WebRTC connection yet
      
      // Update speaking status
      coworkingService.updateSpeakingStatus(roomId, true);
    }).catch((err) => {
      console.error('Microphone access denied:', err);
      toast.error('Microphone access denied');
      setIsMuted(true);
    });
  } else {
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.pause();
    }
    setShowMicActivity(false);
    setWebRTCStatus('disconnected');
    coworkingService.updateSpeakingStatus(roomId, false);
  }
  
  // Cleanup on unmount
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.pause();
    }
  };
}, [isMuted, roomId, isMobile]);

// WebRTC event listeners setup (disabled until backend WebSocket is ready)
useEffect(() => {
  // TODO: Enable when backend WebSocket signaling is implemented
  /*
  const webRTCService = coworkingService.getWebRTCService();
  
  // Handle remote streams from other users
  const handleRemoteStream = ({ peerId, stream }: { peerId: string, stream: MediaStream }) => {
    console.log(`🔊 Received audio from ${peerId}`);
    setRemoteStreams(prev => new Map(prev.set(peerId, stream)));
    
    // Create audio element to play remote stream
    const audioElement = new Audio();
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.volume = 0.8;
    
    // Play remote audio (not muted unlike local audio)
    audioElement.play().catch(err => {
      console.log('Remote audio playback:', err);
    });
    
    toast.success(`Connected to ${peerId}'s audio`);
  };
  
  // Handle peer disconnection
  const handlePeerDisconnected = (peerId: string) => {
    console.log(`🔇 ${peerId} disconnected`);
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
  };
  
  // Handle connection status changes
  const handleLocalStreamReady = (stream: MediaStream) => {
    streamRef.current = stream;
    setWebRTCStatus('connected');
    
    // Set up local audio element for monitoring (muted on mobile)
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.muted = isMobile; // Prevent feedback on mobile
      audioRef.current.play().catch(err => {
        console.log('Local audio monitoring:', err);
      });
    }
  };
  
  // Set up event listeners
  webRTCService.on('remoteStreamReceived', handleRemoteStream);
  webRTCService.on('peerDisconnected', handlePeerDisconnected);
  webRTCService.on('localStreamReady', handleLocalStreamReady);
  
  // Cleanup on unmount
  return () => {
    webRTCService.off('remoteStreamReceived', handleRemoteStream);
    webRTCService.off('peerDisconnected', handlePeerDisconnected);
    webRTCService.off('localStreamReady', handleLocalStreamReady);
  };
  */
  
  console.log('⚠️ WebRTC disabled - Backend WebSocket signaling required');
  return () => {
    // Cleanup placeholder
  };
}, [roomId, isMobile]);

  // Load room data and set up real-time listeners
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setShowSkeleton(true);
    hasFetched.current = false;
    
   

    // Load room data
    const loadRoom = async () => {
      try {
        const roomData = await fetchRoom(roomId);
        if (isMounted && roomData) {
          hasFetched.current = true;
          setRoom(roomData);
          setDisplayRoomName(roomData.name);
          setMessages(Array.isArray(roomData.messages) ? roomData.messages : []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load room:', error);
        if (isMounted) {
          toast.error('Failed to load room');
          setLoading(false);
        }
      }
    };

    loadRoom();

    // Set up real-time event listeners
    const handleMessageAdded = ({ roomId: eventRoomId, message }: { roomId: string, message: Message }) => {
      if (eventRoomId === roomId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleMicToggled = ({ roomId: eventRoomId, muted }: { roomId: string, muted: boolean }) => {
      if (eventRoomId === roomId) {
        setIsMuted(muted);
        setRoom(prev => prev ? { ...prev } : null); // Trigger re-render
      }
    };

    const handleSpeakingChanged = ({ roomId: eventRoomId }: { roomId: string }) => {
      if (eventRoomId === roomId) {
        setRoom(prev => prev ? { ...prev } : null); // Trigger re-render
      }
    };

    const handleEmojiReaction = ({ roomId: eventRoomId, emoji, user }: { roomId: string, emoji: string, user: string }) => {
      if (eventRoomId === roomId) {
        // Create floating emoji for reactions from other users
        const floatingId = `floating_${Date.now()}_${Math.random()}`;
        const randomX = Math.random() * (isMobile ? 300 : 600);
        
        setFloatingEmojis(prev => [
          ...prev,
          {
            id: floatingId,
            emoji,
            x: randomX
          }
        ]);
        
        // Remove the floating emoji after animation completes
        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(item => item.id !== floatingId));
        }, 4000);
        
        toast.success(`${user} reacted with ${emoji}`, { duration: 2000 });
      }
    };

    const handleRoomUpdated = ({ roomId: eventRoomId, room: updatedRoom }: { roomId: string, room: Room }) => {
      if (eventRoomId === roomId) {
        setRoom(updatedRoom);
        setMessages(Array.isArray(updatedRoom.messages) ? updatedRoom.messages : []);
      }
    };

    coworkingService.on('messageAdded', handleMessageAdded);
    coworkingService.on('micToggled', handleMicToggled);
    coworkingService.on('speakingStatusChanged', handleSpeakingChanged);
    coworkingService.on('emojiReaction', handleEmojiReaction);
    coworkingService.on('roomUpdated', handleRoomUpdated);

    // Timer for skeleton loading (3 seconds)
    const timer = setTimeout(() => {
      if (isMounted) setShowSkeleton(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      coworkingService.off('messageAdded', handleMessageAdded);
      coworkingService.off('micToggled', handleMicToggled);
      coworkingService.off('speakingStatusChanged', handleSpeakingChanged);
      coworkingService.off('emojiReaction', handleEmojiReaction);
      coworkingService.off('roomUpdated', handleRoomUpdated);
    };
  }, [roomId, roomName]);

    // Progress skeleton bar
  function ProgressSkeleton() {
    return (
      <div className="rounded-xl bg-white p-4 shadow">
        <div className="font-semibold text-lg mb-3">Today's Progress</div>
        <div className="mb-2">
          <div className="text-sm mb-1">Tasks completed</div>
          <Skeleton className="w-full h-2 rounded-full bg-gray-200" />
        </div>
        <div>
          <div className="text-sm mb-1">Focus Time</div>
          <Skeleton className="w-full h-2 rounded-full bg-gray-200" />
        </div>
      </div>
    );
  }

  // In-call messages skeleton
  function MessagesSkeleton() {
    return (
      <div className="mb-4 bg-white rounded-2xl p-4 shadow w-full">
        <div className="font-semibold text-lg mb-2">In-call messages</div>
        <div className="text-gray-400 text-xs mb-2">
          Messages can be seen only during the call by people in this call
        </div>
        <div className="flex flex-col gap-2 mb-2 max-h-40 overflow-y-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <Skeleton className="w-16 h-3 rounded bg-gray-200" />
                  <Skeleton className="w-8 h-3 rounded bg-gray-200" />
                </div>
                <Skeleton className="w-32 h-4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Skeleton className="flex-1 h-8 rounded-lg bg-gray-200" />
          <Skeleton className="w-16 h-8 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  function leaveRoom() {
    // Leave room through service and navigate back
    coworkingService.leaveRoom(roomId).then(() => {
      toast.success('Left the room');
      if (onLeaveRoom) {
        onLeaveRoom();
      }
    }).catch((error) => {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    });
  }

  // Toggle microphone mute
  const handleMicToggle = async () => {
    try {
      const newMutedState = await coworkingService.toggleMute(roomId);
      setIsMuted(newMutedState);
      
      // Update speaking status when unmuting
      if (!newMutedState) {
        await coworkingService.updateSpeakingStatus(roomId, true);
      } else {
        await coworkingService.updateSpeakingStatus(roomId, false);
      }
      
      // Force re-render of room data to update UI
      const updatedRoom = await coworkingService.getRoom(roomId);
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
      
    } catch (error) {
      console.error('Error toggling mic:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  // Send message
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !room) return;

    // Get user info the same way as the coworking service
    let userData: any = null;
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('http://localhost:8000/api/users/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          userData = data.user || data;
        }
      }
    } catch (error) {
      console.log('Could not fetch user data from API for message:', error);
    }
    
    // Fallback to localStorage if API fails
    if (!userData) {
      try {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('userData');
        if (storedUser) {
          userData = JSON.parse(storedUser);
        }
      } catch {
        // Fallback to empty object
      }
    }
    
    const savedAvatar = localStorage.getItem('userAvatar');
    const port = window.location.port;
    
    // Use the same name resolution logic as the dashboard and coworking service
    const userName = userData?.name || userData?.username || userData?.full_name || 'User_' + port;
    
    console.log('🎯 RoomView: Using username for message:', userName);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      user: userName,
      avatar: savedAvatar || `https://avatar.iran.liara.run/public?username=${userName}`,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      await coworkingService.addMessage(roomId, newMessage);
      setMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Send emoji reaction with beautiful floating animation
  const handleEmojiClick = async (emoji: string) => {
    try {
      await coworkingService.addEmojiReaction(roomId, emoji);
      
      // Create floating emoji animation
      const floatingId = `floating_${Date.now()}_${Math.random()}`;
      const randomX = Math.random() * (isMobile ? 300 : 600); // Random horizontal position
      
      setFloatingEmojis(prev => [
        ...prev,
        {
          id: floatingId,
          emoji,
          x: randomX
        }
      ]);
      
      // Remove the floating emoji after animation completes (4 seconds)
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(item => item.id !== floatingId));
      }, 4000);
      
      console.log(`Emoji ${emoji} sent successfully with floating animation`);
      toast.success(`${emoji} reaction sent!`);
    } catch (error) {
      console.error('Error sending emoji:', error);
      toast.error('Failed to send reaction');
    }
  };


  if (loading || showSkeleton) {
    // Show skeleton for up to 3 seconds or while loading
    return (
      <div className="min-h-screen bg-powderBlue py-4 px-2 xs:px-4 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold mb-4">{displayRoomName || "Loading Room..."}</div>
          <div className="w-full max-w-md">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl px-6 py-8 bg-grayBlue shadow-lg h-24 animate-pulse mb-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!room) return (
    <div className="min-h-screen bg-powderBlue py-4 px-2 xs:px-4 flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Skeleton />
      </div>
    </div>
  );

  // Main speaker is first participant
  const getCurrentUser = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const port = window.location.port;
    const sessionId = localStorage.getItem('coworking_session_id');
    return sessionId || `${userProfile.name?.toLowerCase().replace(/\s+/g, '_') || 'anonymous'}_${port}_${Date.now().toString().slice(-6)}`;
  };
  
  const currentUserId = getCurrentUser();
  
  // Handle empty rooms gracefully
  const mainSpeaker = room.participants.length > 0 ? room.participants[0] : null;
  const otherParticipants = room.participants.length > 1 ? room.participants.slice(1) : [];

  return (
  <div className={`min-h-screen bg-powderBlue py-4 px-2 xs:px-4 flex flex-col md:flex-row gap-6 ${isMobile ? 'pb-20' : ''}`}>
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Room name for mobile */}
        {isMobile && (
          <div className="text-2xl font-bold mb-4">{room.name}</div>
        )}
        {/* Progress card with chevron dropdown (mobile top) */}
        {/* progress  */}
        {isMobile && (
          <div className="mb-4 relative">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Today's Tasks</span>
              <button
                className="ml-2 p-1 rounded hover:bg-gray-100"
                onClick={() => setShowProgressDropdown((prev) => !prev)}
                aria-label="Toggle Progress Dropdown"
              >
                <ChevronDown className={`transition-transform ${showProgressDropdown ? 'rotate-180' : ''}`} size={24} />
              </button>
            </div>
            {showProgressDropdown && (
              loading || showSkeleton ? <ProgressSkeleton /> :
              <div className="mt-2">
                {(room && typeof room.tasksCompleted === 'number' && typeof room.tasksTotal === 'number' && typeof room.focusTime === 'number' && typeof room.focusGoal === 'number')
                  ? <ProgressCard tasksCompleted={room.tasksCompleted} tasksTotal={room.tasksTotal} focusTime={room.focusTime} focusGoal={room.focusGoal} />
                  : <ProgressCard tasksCompleted={0} tasksTotal={0} focusTime={0} focusGoal={0} />
                }
              </div>
            )}
          </div>
        )}
  {/* Focus Zone grid */}
  <div className={isMobile ? "grid grid-cols-1 gap-4 mb-6" : "grid grid-cols-3 grid-rows-2 gap-4 mb-6"}>
          {/* Main speaker large box or empty state */}
          {mainSpeaker ? (
            <motion.div
              key={mainSpeaker.id}
              className={`rounded-2xl bg-gray-100 flex flex-col items-center justify-center p-4 relative border-2 col-span-1 ${!isMobile ? 'row-span-2 col-span-2 h-full' : 'h-48'} ${
                (mainSpeaker.isSpeaking && !mainSpeaker.muted) || (mainSpeaker.id === currentUserId && !isMuted && !mainSpeaker.muted) 
                  ? 'border-green-400' 
                  : 'border-gray-300'
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Avatar>
                <AvatarImage
                  src={mainSpeaker.avatar || 'https://avatar.iran.liara.run/public'}
                  alt={mainSpeaker.name}
                  className="w-8 h-8 rounded-full mb-1"
                />
                <AvatarFallback>{mainSpeaker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="font-semibold text-base mt-2">{mainSpeaker.name}</div>
              <div className="absolute bottom-2 right-2">
                {mainSpeaker.muted ? (
                  <MicOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Mic className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className={`rounded-2xl bg-gray-50 flex flex-col items-center justify-center p-4 relative border-2 border-dashed border-gray-300 col-span-1 ${!isMobile ? 'row-span-2 col-span-2 h-full' : 'h-48'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-gray-400 text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="font-medium">Room is empty</div>
                <div className="text-sm">Be the first to join!</div>
              </div>
            </motion.div>
          )}
          {/* Other participants smaller boxes */}
          {otherParticipants.map((p) => (
            <motion.div
              key={p.id}
              className={`rounded-2xl bg-gray-100 flex flex-col items-center justify-center p-4 relative border-2 ${
                (p.isSpeaking && !p.muted) || (p.id === currentUserId && !isMuted && !p.muted) 
                  ? 'border-green-400' 
                  : 'border-gray-300'
              } h-32`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Avatar>
                <AvatarImage
                  src={p.avatar || 'https://avatar.iran.liara.run/public'}
                  alt={p.name}
                  className="w-8 h-8 rounded-full mb-1"
                />
                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="font-semibold text-sm">{p.name}</div>
              <div className="absolute bottom-2 right-2">
                {p.muted ? (
                  <MicOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Mic className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emoji reactions and controls (desktop below grid, mobile bottom bar) */}
        {!isMobile && (
          <div className="flex flex-col items-center mb-6 mt-[20px]">
            {showEmojis && (
              <div className="flex gap-2 mb-4">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-2xl p-2 rounded-full hover:bg-gray-200 transition"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-25 mb-6 bg-snow p-4 rounded-2xl shadow-md  w-full max-w-xl items-center justify-center">
              <Button variant="destructive" className={`flex gap-2 rounded-2xl px-6 bg-errorRed relative ${showMicActivity && !isMuted ? 'animate-pulse' : ''}`} onClick={handleMicToggle}>
                {isMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5 text-blue-600" />}
                {/* Activity indicator for desktop */}
                {!isMobile && showMicActivity && !isMuted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                )}
                {/* WebRTC connection status indicator (currently local-only) */}
                {webRTCStatus === 'disconnected' && !isMuted && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" title="Local audio only - WebRTC requires backend"></div>
                )}
              </Button>
              {/* Audio element for microphone stream */}
              <audio ref={audioRef} style={{ display: 'none' }} autoPlay playsInline />
              <Button variant="outline" className={`flex gap-2 bg-powderBlue cursor-pointer ${showChat ? 'bg-blue1 hover:bg-blue-800/50' : 'bg-powderBlue'}`} onClick={() => setShowChat((prev) => !prev)}>
             <MessageSquare className={`h-5 w-5 ${showChat ? 'text-white hover:text-black' : ''}`} /> 
              </Button>
              <Button variant="outline" className={`flex gap-2 cursor-pointer ${showEmojis ? 'bg-blue1 hover:bg-blue-800/50' : 'bg-powderBlue'}`} onClick={() => setShowEmojis((prev) => !prev)}>
                <Smile className={`h-5 w-5 ${showEmojis ? 'text-white hover:text-black' : ''}`} /> 
              </Button>
              <Button variant="destructive" className="flex gap-2" onClick={() => leaveRoom()}>
                <Phone className="h-5 w-5" /> 
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar for desktop, stacked for mobile */}
      <div className="w-full md:w-[340px] flex flex-col gap-6">
        {/* Room name for desktop */}
        {!isMobile && (
          <div className="text-2xl font-bold mb-4">{room.name}</div>
        )}
        {/* Progress card with chevron dropdown (desktop sidebar) */}
        {!isMobile && (
          <div className="mb-4 relative">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Today's Tasks</span>
              <button
                className="ml-2 p-1 rounded hover:bg-gray-100"
                onClick={() => setShowProgressDropdown((prev) => !prev)}
                aria-label="Toggle Progress Dropdown"
              >
                <ChevronDown className={`transition-transform ${showProgressDropdown ? 'rotate-180' : ''}`} size={24} />
              </button>
            </div>
            {showProgressDropdown && (
              <div className="mt-2">
                {(room && typeof room.tasksCompleted === 'number' && typeof room.tasksTotal === 'number' && typeof room.focusTime === 'number' && typeof room.focusGoal === 'number')
                  ? <ProgressCard tasksCompleted={room.tasksCompleted} tasksTotal={room.tasksTotal} focusTime={room.focusTime} focusGoal={room.focusGoal} />
                  : <ProgressCard tasksCompleted={0} tasksTotal={0} focusTime={0} focusGoal={0} />
                }
              </div>
            )}
          </div>
        )}
        {/* In-call messages: only show when chat is open */}
        {showChat && (
          loading || showSkeleton ? <MessagesSkeleton /> :
          <div className="mb-4 bg-white rounded-2xl p-4 shadow w-full">
            <div className="font-semibold text-lg mb-2">In-call messages</div>
            <div className="text-gray-400 text-xs mb-2">
              Messages can be seen only during the call by people in this call
            </div>
            <div className="flex flex-col gap-2 mb-2 max-h-40 overflow-y-auto">
              {messages.length === 0
                ? <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-sm italic">start a conversation</div>
                : messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <Avatar>
                      <AvatarImage
                        src={msg.avatar || 'https://avatar.iran.liara.run/public'}
                        alt={msg.user}
                        className="w-6 h-6 rounded-full"
                      />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm text-gray-900">{msg.user}</span>
                        <span className="text-gray-400 text-xs">{msg.time}</span>
                      </div>
                      <div className="text-gray-700 text-sm mt-1 break-words">{msg.text}</div>
                    </div>
                  </div>
                ))}
            </div>
            <form
              className="flex gap-2 mt-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(message)
              }}
            >
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                placeholder="Send a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" variant="default" className="px-4 bg-blue1 hover:bg-blue-800/50">
                Send
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile bottom bar for controls */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg border-t flex flex-col px-6 py-4 z-50">
          {/* Emoji reactions row */}
          {showEmojis && (
            <div className="flex gap-3 mb-4 justify-center flex-wrap bg-gray-50 rounded-xl p-3">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-3xl p-3 rounded-full bg-white shadow-sm hover:bg-gray-100 active:scale-95 transition-all duration-150 border"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          
          {/* Control buttons row */}
          <div className="flex justify-between items-center">
            <Button 
              variant={isMuted ? "destructive" : "default"} 
              className={`flex gap-2 min-w-[60px] h-12 relative ${showMicActivity && !isMuted ? 'animate-pulse bg-blue1' : ''}`}
              onClick={handleMicToggle}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {/* Activity indicator for mobile */}
              {showMicActivity && !isMuted && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              )}
              {/* WebRTC connection status indicator (currently local-only) */}
              {webRTCStatus === 'disconnected' && !isMuted && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" title="Local audio only - WebRTC requires backend"></div>
              )}
            </Button>
            <Button 
              variant="outline" 
              className={`flex gap-2 min-w-[60px] ${showChat ? 'bg-blue1 text-white' : ''} h-12 hover:bg-blue-800/50`}
              onClick={() => setShowChat((prev) => !prev)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button 
              variant={showEmojis ? "default" : "outline"} 
              className={`flex gap-2 min-w-[60px] ${showEmojis ? 'bg-blue1' : ''}  h-12 hover:bg-blue-800/50`} 
              onClick={() => setShowEmojis((prev) => !prev)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button 
              variant="destructive" 
              className="flex gap-2 min-w-[60px] h-12" 
              onClick={leaveRoom}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Emoji Animations Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingEmojis.map((item) => (
          <motion.div
            key={item.id}
            initial={{ 
              y: isMobile ? window.innerHeight - 120 : window.innerHeight - 50,
              x: item.x,
              scale: 0.5,
              opacity: 0
            }}
            animate={{ 
              y: isMobile ? window.innerHeight - 500 : window.innerHeight - 400,
              scale: [0.5, 1.8, 1.5, 1.2],
              opacity: [0, 1, 1, 0],
              rotate: [0, 15, -10, 5, 0]
            }}
            transition={{ 
              duration: 4,
              ease: "easeOut",
              times: [0, 0.2, 0.7, 1]
            }}
            className="absolute text-4xl md:text-5xl select-none"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
