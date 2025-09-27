import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { BriefcaseBusiness } from 'lucide-react'
import { debugAuth } from '../../utils/authDebug'
type WorkSession = {
  session_id?: string
  start_time?: string
  end_time?: string
  type?: 'work' | 'break'
  duration_minutes?: number
  // Add other fields as needed
}

export function WorkSessionCard({
  session,
  onClockIn,
  onClockOut,
  onTestShutdown,
  // isLoading = false,
}: {
  session: WorkSession | null
  onClockIn: () => Promise<void> | void
  onClockOut: () => Promise<void> | void
  onTestShutdown?: () => void
  isLoading?: boolean
}) {
  // Calculate duration if session is active
  const [duration, setDuration] = useState('')
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)

  // Helper function to format duration
  const formatDuration = (startTime: string, endTime?: string) => {
    try {
      const start = new Date(startTime)
      const end = endTime ? new Date(endTime) : new Date()
      
      // Validate dates
      if (isNaN(start.getTime()) || (endTime && isNaN(end.getTime()))) {
        return '0m'
      }

      const diffMs = Math.max(0, end.getTime() - start.getTime())
      const totalMinutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const seconds = Math.floor((diffMs % 60000) / 1000)

      if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
    } catch (error) {
      console.error('Error formatting duration:', error)
      return '0m'
    }
  }

  useEffect(() => {
    if (session?.start_time && !session?.end_time) {
      // Active session - update every second
      const interval = setInterval(() => {
        setDuration(formatDuration(session.start_time!))
      }, 1000)
      return () => clearInterval(interval)
    } else if (session?.start_time && session?.end_time) {
      // Completed session - show final duration
      setDuration(formatDuration(session.start_time, session.end_time))
    } else {
      setDuration('')
    }
  }, [session])

  const isActiveSession = session?.start_time && !session?.end_time

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow min-h-[180px] flex flex-col justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <div className="font-semibold text-lg mb-1">Work session</div>
        <div className="text-gray-600 text-sm">
          {isActiveSession ? 'Currently working' : 'Ready for work?'}
        </div>
      </div>
      <div className="flex flex-col items-center mt-4">
        {isActiveSession ? (
          <>
            <span className="text-4xl font-bold mb-2 text-blue-600">{duration}</span>
            <div className="text-xs text-gray-500 mb-4">
              Started: {session?.start_time ? new Date(session.start_time).toLocaleTimeString() : 'Unknown'}
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-red-600 px-4 hover:bg-red-700 cursor-pointer disabled:opacity-50"
                onClick={async () => {
                  setIsClockingOut(true)
                  try {
                    await onClockOut()
                  } finally {
                    setIsClockingOut(false)
                  }
                }}
                disabled={isClockingOut}
              >
                {isClockingOut ? 'Clocking Out...' : 'Clock Out'}
              </Button>
              {onTestShutdown && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onTestShutdown}
                    title="Test shutdown modal UI"
                  >
                    Test Shutdown
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => debugAuth()}
                    title="Debug authentication status"
                  >
                    Debug Auth
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold mb-2 text-gray-400">
              <BriefcaseBusiness />
            </div>
            {session?.end_time && (
              <div className="text-sm text-gray-600 mb-2">
                Last session: {duration}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                className="bg-green-600 px-6 hover:bg-green-700 cursor-pointer disabled:opacity-50"
                onClick={async () => {
                  setIsClockingIn(true)
                  try {
                    await onClockIn()
                  } finally {
                    setIsClockingIn(false)
                  }
                }}
                disabled={isClockingIn}
              >
                {isClockingIn ? 'Clocking In...' : 'Clock In'}
              </Button>
              {onTestShutdown && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTestShutdown}
                  title="Test shutdown modal UI"
                >
                  Test Shutdown
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
