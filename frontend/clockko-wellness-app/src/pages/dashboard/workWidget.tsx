import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { BriefcaseBusiness } from 'lucide-react'
// import { debugAuth } from '../../utils/authDebug'
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
  const [forceStopTimer, setForceStopTimer] = useState(false) // Safety mechanism to stop timer
  const [forceInactiveUI, setForceInactiveUI] = useState(false) // Force show inactive UI state

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
    // Reset forced states when session data actually changes to completed OR when no session
    if (session?.end_time || !session) {
      setForceStopTimer(false)
      setForceInactiveUI(false)
      console.log('📊 Session state changed, resetting forced UI states')
    }
    
    if (session?.start_time && !session?.end_time && !forceStopTimer) {
      // Active session - update every second
      const interval = setInterval(() => {
        // Double-check: don't update if force stop is active
        if (!forceStopTimer) {
          setDuration(formatDuration(session.start_time!))
        }
      }, 1000)
      return () => clearInterval(interval)
    } else if (session?.start_time && session?.end_time) {
      // Completed session - show final duration
      setDuration(formatDuration(session.start_time, session.end_time))
    } else if (forceStopTimer) {
      // Force stopped - keep last duration but stop counting
      // Duration stays at whatever it was when stopped
    } else {
      setDuration('')
    }
  }, [session, forceStopTimer])

  const isActiveSession = session?.start_time && !session?.end_time && !forceStopTimer && !forceInactiveUI

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
                    // IMMEDIATELY stop the timer AND force inactive UI
                    setForceStopTimer(true)
                    setForceInactiveUI(true)
                    
                    // Capture the final duration before stopping
                    if (session?.start_time) {
                      const finalDuration = formatDuration(session.start_time)
                      setDuration(finalDuration)
                      console.log('⏹️ Session stopped with final duration:', finalDuration)
                    }
                    
                    await onClockOut()
                    console.log('✅ Clock-out completed successfully')
                  } catch (error) {
                    // If clock-out failed, revert the forced states
                    setForceStopTimer(false)
                    setForceInactiveUI(false)
                    console.error('❌ Clock-out failed, reverting UI state:', error)
                  } finally {
                    setIsClockingOut(false)
                  }
                }}
                disabled={isClockingOut}
              >
                {isClockingOut ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold mb-2 text-gray-400">
              <BriefcaseBusiness />
            </div>
            {/* Show last session summary if we have a completed session */}
            {(session?.end_time || (session?.start_time && forceStopTimer)) && duration && (
              <div className="text-sm text-gray-600 mb-2">
                <div className="font-medium text-green-600">✅ Session Completed</div>
                <div className="text-blue-600 font-semibold text-lg">{duration}</div>
                {session?.end_time && (
                  <div className="text-xs text-gray-500">
                    Ended: {new Date(session.end_time).toLocaleTimeString()}
                  </div>
                )}
                {!session?.end_time && forceStopTimer && (
                  <div className="text-xs text-gray-500">
                    Just completed • Data updating...
                  </div>
                )}
              </div>
            )}
            {!session?.end_time && !session?.start_time && !forceStopTimer && (
              <div className="text-sm text-gray-500 mb-2">
                Ready to start your first work session?
              </div>
            )}
            <div className="flex gap-2">
              <Button
                className="bg-green-600 px-6 hover:bg-green-700 cursor-pointer disabled:opacity-50"
                onClick={async () => {
                  setIsClockingIn(true)
                  try {
                    // Reset any forced states before clock-in
                    setForceStopTimer(false)
                    setForceInactiveUI(false)
                    console.log('🚀 Starting new work session')
                    
                    await onClockIn()
                  } finally {
                    setIsClockingIn(false)
                  }
                }}
                disabled={isClockingIn}
              >
                {isClockingIn ? 'Clocking In...' : 'Clock In'}
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
