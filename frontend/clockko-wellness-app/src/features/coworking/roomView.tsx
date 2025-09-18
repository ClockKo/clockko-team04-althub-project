import { useEffect, useState } from 'react'
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

const EMOJIS = ['💜', '😂', '🙂', '👏', '👍', '🎉']

export default function RoomView({ roomId }: { roomId: string }) {
  const [showChat, setShowChat] = useState(false)
  const [showProgressDropdown, setShowProgressDropdown] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [emojiReactions, setEmojiReactions] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    let isMounted = true
    fetchRoom(roomId).then((data) => {
      if (isMounted) {
        setRoom(data)
        setMessages(data.messages)
        setLoading(false)
      }
        
    })
    return () => {
      isMounted = false
    }
  }, [roomId])

  if (loading || !room) return <Skeleton />

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
              <div className="mt-2">
                <ProgressCard tasksCompleted={5} tasksTotal={10} focusTime={60} focusGoal={120} />
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
          <div className="flex flex-col items-center">
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
            <div className="flex gap-4 mb-6">
              <Button variant="destructive" className="flex gap-2">
                <MicOff className="h-5 w-5" /> Mute
              </Button>
              <Button variant="outline" className="flex gap-2" onClick={() => setShowChat((prev) => !prev)}>
                <MessageSquare className="h-5 w-5" /> Chat
              </Button>
              <Button variant="outline" className="flex gap-2">
                <Smile className="h-5 w-5" /> Emoji
              </Button>
              <Button variant="destructive" className="flex gap-2">
                <Phone className="h-5 w-5" /> Leave
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
                <ProgressCard tasksCompleted={5} tasksTotal={10} focusTime={60} focusGoal={120} />
              </div>
            )}
          </div>
        )}
        {/* In-call messages: only show when chat is open */}
        {showChat && (
          <div className="mb-4 bg-white rounded-2xl p-4 shadow w-full">
            <div className="font-semibold text-lg mb-2">In-call messages</div>
            <div className="text-gray-400 text-xs mb-2">
              Messages can be seen only during the call by people in this call
            </div>
            <div className="flex flex-col gap-2 mb-2 max-h-40 overflow-y-auto">
              {messages.map((msg) => (
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
