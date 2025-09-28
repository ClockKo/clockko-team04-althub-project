import { useEffect, useState, useRef } from 'react'
import { fetchRoom } from './api'
import type { Room, Message } from '../../types/typesGlobal'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { Mic, MicOff, Smile, MessageSquare, Phone } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProgressCard } from '@/pages/dashboard'


// Avatar Images
import Ellipse6 from '../../assets/images/Ellipse6.png'
import Ellipse7 from '../../assets/images/Ellipse7.png'
import Ellipse8 from '../../assets/images/Ellipse8.png'
import Ellipse9 from '../../assets/images/Ellipse9.png'
import Ellipse10 from '../../assets/images/Ellipse10.png'

const avatars = [
  { src: Ellipse6, alt: 'Avatar 1' },
  { src: Ellipse7, alt: 'Avatar 2' },
  { src: Ellipse8, alt: 'Avatar 3' },
  { src: Ellipse9, alt: 'Avatar 4' },
  { src: Ellipse10, alt: 'Avatar 5' },
]

const EMOJIS = ['💜', '😂', '🙂', '👏', '👍', '🎉','🤣','😊']

export default function RoomView({ roomId, roomName, onLeaveRoom }: { roomId: string, roomName?: string, onLeaveRoom?: () => void }) {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isMuted) {
      // Request microphone access and play audio
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream;
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
          audioRef.current.play();
        }
      }).catch((err) => {
        // Handle error (mic denied)
        console.error('Microphone access denied:', err);
      });
    } else {
      // Stop audio stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [isMuted]);
  // Removed duplicate isMuted declaration
  const [showChat, setShowChat] = useState(false)
  const [showProgressDropdown, setShowProgressDropdown] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showEmojis, setShowEmojis] = useState(false)
  const [emojiReactions, setEmojiReactions] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [displayRoomName, setDisplayRoomName] = useState<string>(roomName || "");
  const hasFetched = useRef(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setShowSkeleton(true);
    hasFetched.current = false;
    // Set initial room name from props or demo data
    if (roomName) {
      setDisplayRoomName(roomName);
    } else {
      import('./api').then(mod => {
        const demoRoom = mod.DEMO_ROOMS?.find(r => r.id === roomId);
        if (demoRoom) setDisplayRoomName(demoRoom.name);
      });
    }
    // Always show skeleton while fetching
    fetchRoom(roomId).then((data) => {
      if (isMounted) {
        hasFetched.current = true;
        if (data && Array.isArray(data.participants) && data.participants.length > 0) {
          setRoom(data);
          setDisplayRoomName(d => data.name || d);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        } else {
          import('./api').then(mod => {
            // Use selected room name for fallback
            const fallbackRoom = mod.DEMO_ROOMS?.find(r => r.id === roomId);
            setRoom({ ...mod.DEMO_ROOM, name: fallbackRoom?.name || mod.DEMO_ROOM.name });
            setDisplayRoomName(fallbackRoom?.name || mod.DEMO_ROOM.name);
            setMessages(Array.isArray(mod.DEMO_ROOM.messages) ? mod.DEMO_ROOM.messages : []);
          });
        }
        setLoading(false);
      }
    });
    // Timer for skeleton loading (3 seconds)
    const timer = setTimeout(() => {
      if (isMounted) setShowSkeleton(false);
    }, 3000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
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
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-32 h-4 rounded bg-gray-200" />
              <Skeleton className="w-10 h-4 rounded bg-gray-200" />
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
  // when user clicks leave room button it should take them back to the rooms list page
  if (onLeaveRoom) {
    onLeaveRoom();
  }
  }


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

  // Responsive grid logic
  const isMobile = window.innerWidth < 768
  // Main speaker is first participant
  const mainSpeaker = room.participants[0]
  const otherParticipants = room.participants.slice(1)

  return (
  <div className="min-h-screen bg-powderBlue py-4 px-2 xs:px-4 flex flex-col md:flex-row gap-6">
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
          {/* Main speaker large box */}
          <motion.div
            key={mainSpeaker.id}
            className={`rounded-2xl bg-gray-100 flex flex-col items-center justify-center p-4 relative border-2 col-span-1 ${!isMobile ? 'row-span-2 col-span-2 h-full' : 'h-48'} ${mainSpeaker.isSpeaking ? 'border-green-400' : 'border-gray-300'}`}
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
          {/* Other participants smaller boxes */}
          {otherParticipants.map((p) => (
            <motion.div
              key={p.id}
              className={`rounded-2xl bg-gray-100 flex flex-col items-center justify-center p-4 relative border-2 ${p.isSpeaking ? 'border-green-400' : 'border-gray-300'} h-32`}
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
                    onClick={() => setEmojiReactions((prev) => ({ ...prev, [Date.now().toString()]: emoji }))}
                  >
                    {emoji}
                  </button>
                ))}
                <div className="flex gap-1 ml-4">
                  {Object.values(emojiReactions)
                    .slice(-4)
                    .map((emoji, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl"
                      >
                        {emoji}
                      </motion.span>
                    ))}
                </div>
              </div>
            )}
            <div className="flex gap-25 mb-6 bg-snow p-4 rounded-2xl shadow-md  w-full max-w-xl items-center justify-center">
              <Button variant="destructive" className="flex gap-2 rounded-2xl px-6 bg-errorRed" onClick={() => setIsMuted((prev) => !prev)}>
                {isMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5 text-blue-600" />}
              </Button>
              {/* Hidden audio element for local playback */}
              <audio ref={audioRef} style={{ display: 'none' }} autoPlay />
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
                  <div key={msg.id} className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={msg.avatar || 'https://avatar.iran.liara.run/public'}
                        alt={msg.user}
                        className="w-6 h-6 rounded-full"
                      />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-800 text-sm">{msg.text}</span>
                    <span className="text-gray-400 text-xs">{msg.time}</span>
                  </div>
                ))}
            </div>
            <form
              className="flex gap-2 mt-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!message.trim()) return
                const newMsg: Message = {
                  id: Date.now().toString(),
                  user: 'Jess',
                  avatar: avatars[0].src,
                  text: message,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
                setMessages((msgs) => [...msgs, newMsg])
                setMessage('')
              }}
            >
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                placeholder="Send a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" variant="default">
                Send
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile bottom bar for controls */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow flex justify-between items-center px-6 py-3 z-50">
          <Button variant="destructive" className="flex gap-2">
            <MicOff className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="flex gap-2" onClick={() => setShowChat((prev) => !prev)}>
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="flex gap-2">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="destructive" className="flex gap-2">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
