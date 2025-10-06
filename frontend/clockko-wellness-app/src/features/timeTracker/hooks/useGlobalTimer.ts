/**
 * useGlobalTimer Hook
 * 
 * React hook that subscribes to the global timer service
 * and provides timer state and control methods to components.
 */

import { useState, useEffect, useCallback } from 'react'
import globalTimerService, { type TimerState, type TimerEvent } from '../services/globalTimerService'

export function useGlobalTimer() {
  const [timerState, setTimerState] = useState<TimerState>(globalTimerService.getState())

  useEffect(() => {
    // Subscribe to timer events
    const unsubscribe = globalTimerService.subscribe((event: TimerEvent) => {
      setTimerState(event.data as TimerState)
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  // Control methods
  const startFocusSession = useCallback(async (durationMinutes: number) => {
    return globalTimerService.startFocusSession(durationMinutes)
  }, [])

  const startBreakSession = useCallback(async (durationMinutes: number, pauseFocusSession = false) => {
    return globalTimerService.startBreakSession(durationMinutes, pauseFocusSession)
  }, [])

  const pause = useCallback(() => {
    globalTimerService.pause()
  }, [])

  const resume = useCallback(() => {
    globalTimerService.resume()
  }, [])

  const stop = useCallback(async () => {
    return globalTimerService.stop()
  }, [])

  return {
    // State
    mode: timerState.mode,
    timeLeft: timerState.timeLeft,
    isRunning: timerState.isRunning,
    focusDuration: timerState.focusDuration,
    breakDuration: timerState.breakDuration,
    currentSession: timerState.currentSession,
    pausedFocusSession: timerState.pausedFocusSession,
    pausedFocusTimeLeft: timerState.pausedFocusTimeLeft,
    
    // Control methods
    startFocusSession,
    startBreakSession,
    pause,
    resume,
    stop,
    
    // Utility methods
    getState: () => globalTimerService.getState(),
  }
}

export default useGlobalTimer