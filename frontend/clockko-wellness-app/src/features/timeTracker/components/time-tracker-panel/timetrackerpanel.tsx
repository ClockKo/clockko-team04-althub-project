import { useState, useEffect, useRef } from 'react'
import './timeTrackerPanel.css' // Main CSS for this panel

// Koala images for different states
import koalaInitial from '../../../../assets/images/Poses.png' // Koala on tree, sleeping (Initial)
import koalaSpeechBubble from '../../../../assets/images/Koala Speech Bubble.png' // The speech bubble image
import koalaFocus from '../../../../assets/images/Poses2.png' // Koala focused (Running Focus ONLY)
import koalaHappy from '../../../../assets/images/Poses3.png' // Koala happy (Paused, Running Break, Completed)

// Imported Components
import ClockInOutButton from '../clock-in-out-button/clockInOutButton'
import BreakTracker from '../break-tracker/breaktracker'
import DailySummary from '../daily-summary/dailysummary'

// --- Time Utilities ---
import { FOCUS_DEFAULT_DURATION, BREAK_DEFAULT_DURATION, formatTime } from '../../utils/timeutils' // **UPDATED IMPORT**

// --- Time Tracker Service ---
import { timeTrackerService, type FocusSession } from '../../services/timetrackerservice'

// --- Global Timer Hook ---
import { useGlobalTimer } from '../../hooks/useGlobalTimer'

// --- Sound Service ---
import { soundService, type SoundTheme } from '../../services/soundService'

// --- Smart Real-Time Features ---
import { useRealTimeFeatures } from '../../../../hooks/useRealTimeFeatures'

function TimeTrackerPanel() {
  // TODO: Add user context integration when backend APIs are ready
  // const { user } = useAuth(); // Get user info for personalized messages
  const name = 'Focus Champion' // Placeholder name, replace with user.name when auth is ready

  // --- Smart Real-Time Features Integration ---
  const realTimeFeatures = useRealTimeFeatures('user-placeholder') // Replace with actual user ID when auth is ready

  // --- Global Timer Integration ---
  const globalTimer = useGlobalTimer()

  // Utility function to refresh UI with latest data
  const refreshDailySummary = async () => {
    try {
      const summary = await timeTrackerService.getDailySummary()
      setTotalFocusSessions(summary.totalFocusSessions)
      setTotalFocusTime(summary.totalFocusTime)
      setTotalBreakTime(summary.totalBreakTime)
      console.log('🔄 UI refreshed with latest data:', summary)
      return summary
    } catch (error) {
      console.error('Failed to refresh daily summary:', error)
      throw error
    }
  }

  // Remember, this is a debug function only - remove or disable in production
  // Debug function to manually refresh daily summary
  const forceRefreshSummary = () => {
    console.log('🔄 Force refreshing daily summary...')

    // Log current localStorage state
    const currentSession = localStorage.getItem('timetracker_current_session')
    const dailySummary = localStorage.getItem('timetracker_daily_summary')

    console.log(
      '📱 Current session in localStorage:',
      currentSession ? JSON.parse(currentSession) : null
    )
    console.log('📊 Daily summary in localStorage:', dailySummary ? JSON.parse(dailySummary) : null)

    refreshDailySummary()
  }

  // Clear all sessions function for clean slate
  const clearAllSessions = async () => {
    try {
      console.log('🧹 Clearing all timetracker sessions...')
      await timeTrackerService.clearAllSessions()

      // Reset all state to initial values
      setMode('initial')
      setTimeLeft(FOCUS_DEFAULT_DURATION)
      setIsRunning(false)
      setCurrentSession(null)
      setPausedFocusSession(null)
      setPausedFocusTimeLeft(null)
      setTotalFocusSessions(0)
      setTotalFocusTime(0)

      // Refresh the daily summary to show cleared state
      await refreshDailySummary()

      console.log('✅ All sessions cleared successfully')
      alert('All timetracker sessions cleared successfully!')
    } catch (error) {
      console.error('Failed to clear sessions:', error)
      alert('Failed to clear sessions. Please try again.')
    }
  }

  // Sound settings toggle
  const toggleSound = () => {
    const newEnabled = !soundEnabled
    setSoundEnabled(newEnabled)
    soundService.setEnabled(newEnabled)

    // Initialize audio context on user action if enabling
    if (newEnabled) {
      soundService.initializeOnUserAction()
      soundService.playTestSound() // Play test sound when enabling
    }
  }

  // Change sound theme
  const handleThemeChange = (theme: SoundTheme) => {
    setCurrentSoundTheme(theme)
    soundService.setTheme(theme)
    // Play preview of the new theme
    soundService.playThemePreview(theme)
  }

  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(FOCUS_DEFAULT_DURATION) // Current time left on the timer
  const [isRunning, setIsRunning] = useState(false) // Whether the timer is actively counting down
  const [mode, setMode] = useState<'initial' | 'focus' | 'break' | 'completed'>('initial') // Current mode of the timer
  const [focusDuration, setFocusDuration] = useState(FOCUS_DEFAULT_DURATION) // Stores the currently selected focus duration
  const [breakDuration, setBreakDuration] = useState(BREAK_DEFAULT_DURATION) // Default break duration (can be updated by dropdown)
  const timerRef = useRef<number | null>(null) // To store the interval ID for cleanup
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // For "Start" button's focus duration dropdown
  const [isBreakDropdownOpen, setIsBreakDropdownOpen] = useState(false) // For "Take a Break" button's break duration dropdown

  // --- Session Tracking State ---
  const [totalFocusSessions, setTotalFocusSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0) // in seconds
  const [totalBreakTime, setTotalBreakTime] = useState(0) // in seconds
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null) // Current active session
  const [pausedFocusSession, setPausedFocusSession] = useState<FocusSession | null>(null) // Paused focus session during break
  const [pausedFocusTimeLeft, setPausedFocusTimeLeft] = useState<number | null>(null) // Time left on paused focus session
  const [isDataLoaded] = useState(false) // Track if data has been loaded (read-only for now)

  // --- Sound Settings State ---
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentSoundTheme, setCurrentSoundTheme] = useState<SoundTheme>('upbeat')

  // --- Koala State ---
  const [currentKoalaImage, setCurrentKoalaImage] = useState(koalaInitial)
  const [currentSpeechBubbleText, setCurrentSpeechBubbleText] = useState(
    'Wake me up when it’s time to get serious'
  )

  // Effect for the timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        // Using window.setInterval for browser context
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current) // Using window.clearInterval
      }
      handleTimerCompletion() // Handle what happens after completion
    }

    // Cleanup function: Clear the interval when the component unmounts or dependencies change
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current) // Using window.clearInterval
      }
    }
  }, [isRunning, timeLeft]) // Rerun effect when isRunning or timeLeft changes

  // Effect for updating Koala Image and Speech Bubble text based on mode and running status
  useEffect(() => {
    if (mode === 'initial') {
      setCurrentKoalaImage(koalaInitial)
      setCurrentSpeechBubbleText('Wake me up when it’s time to get serious')
    } else if (isRunning && mode === 'focus') {
      // Timer is running and it's a FOCUS session
      setCurrentKoalaImage(koalaFocus)
      setCurrentSpeechBubbleText(`You're locked in, ${name}. Let's do this!`)
    } else {
      // All other states:
      // - Paused (focus or break)
      // - Completed Focus (transitioning to break)
      // - Running Break Session
      setCurrentKoalaImage(koalaHappy)
      setCurrentSpeechBubbleText(`Hey ${name}. Great Job! Need a break?`)
    }
  }, [mode, isRunning, name]) // Rerun when mode, isRunning, or name changes

  // Effect for initializing sound settings on mount
  useEffect(() => {
    // Initialize sound service with saved preferences
    setSoundEnabled(soundService.getEnabled())
    setCurrentSoundTheme(soundService.getTheme())

    // --- Smart Features: Check for cross-device sessions ---
    const activeSession = realTimeFeatures.checkForSessionContinuation()
    if (activeSession) {
      // Use confirm dialog for seamless UX
      const shouldContinue = window.confirm(
        `📱 Found active session from ${activeSession.deviceName}\nElapsed: ${Math.floor(activeSession.elapsedTime / 60)}:${(activeSession.elapsedTime % 60).toString().padStart(2, '0')}\n\nContinue this session?`
      )
      if (shouldContinue) {
        // Continue the session seamlessly
        setMode('focus')
        setTimeLeft(Math.max(0, activeSession.plannedDuration - activeSession.elapsedTime))
        setFocusDuration(activeSession.plannedDuration)
        setIsRunning(true)

        // Use your existing koala speech system for notification
        setCurrentSpeechBubbleText(`Welcome back, ${name}! Continuing from your other device`)

        console.log('📱 Continuing cross-device session:', activeSession)
      }
    }
  }, []) // Run once on mount

  // Effect for loading daily summary on component mount
  useEffect(() => {
    console.log('🔄 Loading daily summary on component mount...')
    refreshDailySummary().catch((error) => {
      console.error('Failed to load daily summary on mount:', error)
    })
  }, []) // Run once on mount

  // Effect for handling global timer completion events
  useEffect(() => {
    console.log('🔍 Global timer state changed:', {
      mode: globalTimer.mode,
      timeLeft: globalTimer.timeLeft,
      isRunning: globalTimer.isRunning,
      currentSession: globalTimer.currentSession
    })

    // Handle when global timer completes a focus session (shows completion UI)
    if (globalTimer.mode === 'completed') {
      console.log('⏰ Focus session completed - showing completion UI!')
      
      // Set local mode to completed for UI consistency
      setMode('completed')
      
      // Refresh daily summary to show updated stats (this will get the correct totals from API)
      refreshDailySummary().catch((error) => {
        console.error('Failed to refresh daily summary after completion:', error)
      })
      
      // Clear current session
      setCurrentSession(null)
    }
    
    // Handle when global timer goes back to initial state (either from completion or manual stop)
    else if (globalTimer.mode === 'initial' && !globalTimer.isRunning) {
      console.log('⏰ Timer reset to initial state!')
      
      // Set local mode back to initial
      setMode('initial')
      setCurrentSession(null)
      
      // Refresh daily summary
      refreshDailySummary().catch((error) => {
        console.error('Failed to refresh daily summary after reset:', error)
      })
    }
  }, [globalTimer.mode, globalTimer.timeLeft, globalTimer.isRunning, globalTimer.currentSession])

  // --- Timer Control Functions ---

  // Resumes a paused timer
  const resumeCurrentTimer = () => {
    setIsRunning(true)
    setIsDropdownOpen(false) // Ensure start dropdown is closed
    setIsBreakDropdownOpen(false) // Ensure break dropdown is closed

    // Play resume sound
    soundService.playSessionResumed()
  }

  // Pauses the current timer
  const pauseTimer = () => {
    setIsRunning(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current) // Using window.clearInterval
    }

    // Play pause sound
    soundService.playSessionPaused()
  }

  // Stops the timer and resets it to the initial state with default focus duration
  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current) // Using window.clearInterval
    }

    // Stop active session if it exists
    if (currentSession) {
      // For API-only testing, we're not implementing stop functionality
      console.log(
        '🛑 Would stop session:',
        currentSession.id,
        'but stop functionality disabled for API-only testing'
      )
      setCurrentSession(null)

      // Refresh daily summary to show updated stats
      refreshDailySummary().catch((error) => {
        console.error('Failed to refresh daily summary:', error)
      })
    }

    // If there's a paused focus session, clear it (for API-only testing)
    if (pausedFocusSession) {
      console.log('🛑 Clearing paused focus session for API-only testing:', pausedFocusSession)

      // Clear paused session storage
      localStorage.removeItem('timetracker_paused_session')

      // Refresh daily summary to show updated stats
      refreshDailySummary().catch((error) => {
        console.error('Failed to refresh daily summary:', error)
      })
    }

    // Clear all session state
    setIsRunning(false)
    setMode('initial')
    setTimeLeft(FOCUS_DEFAULT_DURATION) // Always reset to default focus duration
    setFocusDuration(FOCUS_DEFAULT_DURATION) // Also reset focus duration state
    setPausedFocusSession(null) // Clear paused session
    setPausedFocusTimeLeft(null) // Clear paused time
    setIsDropdownOpen(false) // Close start dropdown
    setIsBreakDropdownOpen(false) // Close break dropdown
  }

  // Helper function to resume a paused focus session
  const resumePausedFocusSession = (pausedSession: FocusSession, remainingTimeSeconds: number) => {
    timeTrackerService
      .resumeFocusSession(pausedSession.id)
      .then((resumedSession) => {
        setCurrentSession(resumedSession)

        // Restore focus mode and remaining time
        setMode('focus')
        setTimeLeft(remainingTimeSeconds)
        setFocusDuration(pausedSession.plannedDuration * 60) // plannedDuration is in minutes, convert to seconds for UI
        setIsRunning(true) // Resume the timer automatically

        // Clear the paused session state
        setPausedFocusSession(null)
        setPausedFocusTimeLeft(null)

        console.log(
          '✅ Focus session resumed with',
          remainingTimeSeconds,
          'seconds remaining, auto-starting timer'
        )
      })
      .catch((error) => {
        console.error('Failed to resume focus session:', error)
        // Fallback: go to initial state
        setMode('initial')
        setTimeLeft(FOCUS_DEFAULT_DURATION)
        setPausedFocusSession(null)
        setPausedFocusTimeLeft(null)
      })
  }

  // Handler for when the timer reaches 0
  const handleTimerCompletion = () => {
    if (mode === 'focus') {
      setMode('completed') // Set to completed after focus, to prompt for break
      console.log('Focus session completed!')

      // Play focus completion sound
      soundService.playFocusComplete()

      // Complete the session in localStorage service
      if (currentSession) {
        timeTrackerService
          .completeFocusSession(currentSession.id)
          .then((completedSession) => {
            console.log('✅ Focus session completed and saved:', completedSession)
            setCurrentSession(null)

            // --- Smart Features: End enhanced focus session ---
            realTimeFeatures.endEnhancedFocusSession({
              duration: focusDuration,
              endTime: new Date(),
              productivity: focusDuration > 1500 ? 'high' : focusDuration > 600 ? 'medium' : 'low',
              sessionId: completedSession.id,
            })

            // Update UI with fresh data
            return refreshDailySummary()
          })
          .catch((error) => {
            console.error('Failed to complete focus session:', error)
          })
      }

      // Legacy state updates (still needed for UI)
      setTotalFocusSessions((prev) => prev + 1) // Increment session count
      setTotalFocusTime((prev) => prev + focusDuration) // Add completed focus duration
    } else if (mode === 'break') {
      console.log('Break session completed!')

      // Play break completion sound
      soundService.playBreakComplete()

      // Complete the break session in localStorage service
      if (currentSession) {
        timeTrackerService
          .completeFocusSession(currentSession.id)
          .then((completedSession) => {
            console.log('🌴✅ Break session completed and saved:', completedSession)
            setCurrentSession(null)

            // Update UI with fresh data
            return refreshDailySummary()
          })
          .then(() => {
            // AFTER break session is fully completed, check for paused focus sessions
            console.log(
              '📋 Break session fully completed, now checking for paused focus sessions...'
            )

            // Check if there's a paused focus session to resume
            // First check component state, then check backend for paused sessions
            if (pausedFocusSession && pausedFocusTimeLeft !== null) {
              console.log(
                '🔄 Resuming paused focus session from component state:',
                pausedFocusSession
              )
              resumePausedFocusSession(pausedFocusSession, pausedFocusTimeLeft)
            } else {
              // Check backend for any paused focus sessions
              console.log('🔍 Checking backend for paused focus sessions...')
              timeTrackerService
                .getCurrentSessionFromAPI()
                .then((backendSession) => {
                  if (
                    backendSession &&
                    backendSession.status === 'paused' &&
                    backendSession.sessionType === 'focus'
                  ) {
                    console.log('🔄 Found paused focus session in backend:', backendSession)
                    // Calculate remaining time based on planned duration and elapsed time
                    const elapsedMinutes = backendSession.actualDuration || 0
                    const remainingSeconds = Math.max(
                      0,
                      (backendSession.plannedDuration - elapsedMinutes) * 60
                    )
                    resumePausedFocusSession(backendSession, remainingSeconds)
                  } else {
                    // No paused focus session, go back to initial state
                    setMode('initial')
                    setTimeLeft(FOCUS_DEFAULT_DURATION)
                    console.log('ℹ️ No paused focus session found, returning to initial state')
                  }
                })
                .catch((error) => {
                  console.error('Failed to check for paused sessions:', error)
                  setMode('initial')
                  setTimeLeft(FOCUS_DEFAULT_DURATION)
                })
            }
          })
          .catch((error) => {
            console.error('Failed to complete break session:', error)
          })
      } else {
        // If no current break session to complete, directly check for paused focus sessions
        if (pausedFocusSession && pausedFocusTimeLeft !== null) {
          console.log('🔄 Resuming paused focus session from component state:', pausedFocusSession)
          resumePausedFocusSession(pausedFocusSession, pausedFocusTimeLeft)
        } else {
          setMode('initial')
          setTimeLeft(FOCUS_DEFAULT_DURATION)
        }
      }

      setTotalBreakTime((prev) => prev + breakDuration) // Add completed break duration (legacy)
    }
    setIsRunning(false) // Ensure timer is not running
    setIsBreakDropdownOpen(false) // Close break dropdown if open
  }

  // Starts a break timer with a specified duration
  // Supports two scenarios:
  // 1. Standalone break (independent of focus sessions)
  // 2. Paused focus break (pause active focus, take break, then can resume focus)
  const startBreak = (minutes: number) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current) // Using window.clearInterval
    }

    // Scenario 2: If there's an active focus session, pause it for the break
    if (currentSession && currentSession.sessionType === 'focus' && mode === 'focus') {
      console.log('💾 Pausing focus session for break:', currentSession)

      // Pause the focus session using the service (it will handle storage)
      timeTrackerService
        .pauseFocusSession(currentSession.id)
        .then((pausedSession) => {
          setPausedFocusSession(pausedSession)
          setPausedFocusTimeLeft(timeLeft) // Save the remaining time for UI
          setCurrentSession(null) // Clear from UI state
          console.log('⏸️ Focus session paused in service for break:', pausedSession)
        })
        .catch((error) => {
          console.error('Failed to pause focus session:', error)
          // Fallback to old method if service fails
          setPausedFocusSession(currentSession)
          setPausedFocusTimeLeft(timeLeft)
          setCurrentSession(null)
        })
    }
    // Scenario 1: Standalone break (no active focus session to pause)
    else {
      console.log('🌴 Starting standalone break session (no active focus to pause)')
    }

    const duration = minutes * 60 // Convert minutes to seconds
    setIsRunning(true)
    setMode('break')
    setTimeLeft(duration)
    setBreakDuration(duration) // Update current break duration state
    setIsDropdownOpen(false) // Close any open dropdowns
    setIsBreakDropdownOpen(false)

    // Start break session tracking - works for both standalone and paused-focus breaks
    timeTrackerService
      .startFocusSession(minutes, 'break')
      .then((session) => {
        setCurrentSession(session)
        console.log('🌴 Break session started:', session)
      })
      .catch((error) => {
        console.error('Failed to start break session:', error)

        // If there's a stuck session, clear it and retry
        if (error.message.includes('Active') && error.message.includes('session already exists')) {
          console.log('🔄 Clearing stuck session for break...')
          localStorage.removeItem('timetracker_current_session')

          // Retry starting break session
          timeTrackerService
            .startFocusSession(minutes, 'break')
            .then((session) => {
              setCurrentSession(session)
              console.log('✅ Break session started after cleanup:', session)
            })
            .catch((retryError) => {
              console.error('❌ Still failed to start break after cleanup:', retryError)
            })
        }
      })
  }

  // Selects a focus preset duration and starts the timer
  const selectFocusPresetAndStart = (minutes: number) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current) // Using window.clearInterval
    }
    const duration = minutes * 60 // Convert minutes to seconds
    setFocusDuration(duration) // Set the selected duration as the new focus duration
    setTimeLeft(duration)
    setMode('focus') // Always starts a focus session
    setIsRunning(true)
    setIsDropdownOpen(false) // Close dropdown after selection
    setIsBreakDropdownOpen(false) // Close break dropdown if open

    // Start session tracking with localStorage service
    timeTrackerService
      .startFocusSession(minutes, 'focus')
      .then((session) => {
        setCurrentSession(session)
        console.log('🚀 Focus session started:', session)

        // --- Smart Features: Start enhanced focus session ---
        realTimeFeatures.startEnhancedFocusSession({
          taskType: 'focus',
          plannedDuration: duration,
          startTime: new Date(),
          sessionId: session.id,
        })
      })
      .catch((error) => {
        console.error('Failed to start session:', error)

        // If there's a stuck active session, try to clean it up and retry
        if (error.message.includes('Active') && error.message.includes('session already exists')) {
          console.log('🔄 Attempting to clean up stuck session and retry...')
          // For API-only testing, we'll just clear localStorage and retry
          localStorage.removeItem('timetracker_current_session')
          console.log('🧹 Cleared stuck session from localStorage, retrying...')

          // Retry starting the session
          timeTrackerService
            .startFocusSession(minutes, 'focus')
            .then((session) => {
              setCurrentSession(session)
              console.log('✅ Focus session started after cleanup:', session)
            })
            .catch((retryError) => {
              console.error('❌ Still failed after cleanup:', retryError)
            })
        }
      })
  }

  return (
    <>
      <div className="panel">
        <div className="main-panel">
          {/* body ui */}
          <div className="panel-body">
            <div className="panel-header">
              <h1>Focus Timer</h1>
              <p>Ready to get into deep work?</p>

              {/* Smart Features Status - subtle indicator */}
              {isRunning && mode === 'focus' && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ color: '#10b981' }}>●</span>
                  Smart features active: Focus protection & auto-sync
                </div>
              )}
              {/* Temporary debug buttons - remove in production */}
              <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button
                  onClick={toggleSound}
                  style={{
                    background: soundEnabled ? '#4caf50' : '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
                </button>
                <select
                  value={currentSoundTheme}
                  onChange={(e) => handleThemeChange(e.target.value as SoundTheme)}
                  style={{
                    background: '#6d84d6ff',
                    border: '1px solid #ddd',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  {Object.entries(soundService.getThemes()).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name} - {config.description}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    fontSize: '12px',
                    color: isDataLoaded ? '#4caf50' : '#ff9800',
                    alignSelf: 'center',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isDataLoaded ? '#e8f5e8' : '#fff3e0',
                  }}
                >
                  {isDataLoaded ? '✅ Data Loaded' : '⏳ Loading...'}
                </span>
                {pausedFocusSession && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#ff9800',
                      alignSelf: 'center',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#fff3e0',
                    }}
                  >
                    ⏸️ Focus Paused ({Math.floor((pausedFocusTimeLeft || 0) / 60)}:
                    {String((pausedFocusTimeLeft || 0) % 60).padStart(2, '0')})
                  </span>
                )}
              </div>
            </div>
            <div className="panel-main">
              <div className="panel-timer">
                <h1 className="timer-display">{formatTime(globalTimer.timeLeft > 0 ? globalTimer.timeLeft : timeLeft)}</h1>
                {/* Global Timer Status Indicator */}
                {/* <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                  Global Timer: {globalTimer.mode} | {formatTime(globalTimer.timeLeft)} | {globalTimer.isRunning ? 'Running' : 'Paused'}
                </p> */}
                <div className="timer-controls-group">
                  {/* ClockInOutButton handles rendering based on mode and isRunning */}
                  <ClockInOutButton
                    mode={globalTimer.mode !== 'initial' ? globalTimer.mode : mode}
                    isRunning={globalTimer.timeLeft > 0 ? globalTimer.isRunning : isRunning}
                    isDropdownOpen={isDropdownOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                    BREAK_DEFAULT_DURATION={BREAK_DEFAULT_DURATION} // Passed constant
                  />

                  {/* BreakTracker only shows when paused during a focus/break session */}
                  {!isRunning && mode !== 'initial' && mode !== 'completed' && (
                    <BreakTracker
                      isBreakDropdownOpen={isBreakDropdownOpen}
                      setIsBreakDropdownOpen={setIsBreakDropdownOpen}
                      startBreak={startBreak}
                    />
                  )}
                </div>
              </div>
              <div className="panel-timer-images">
                <img src={currentKoalaImage} alt="Koala" className="koala-image" />
                <div
                  className={`koola-box ${mode === 'initial' ? 'koola-box-initial-position' : ''}`}
                >
                  {' '}
                  {/* Dynamic class for koola-box */}
                  <img src={koalaSpeechBubble} alt="koola speech bubble" />
                  <p>{currentSpeechBubbleText}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Temporary Debug/Clear Buttons */}
          <div
            style={{ display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'center' }}
          >
            <button
              onClick={forceRefreshSummary}
              style={{
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              🔄 Refresh Summary
            </button>
            <button
              onClick={() => {
                console.log('🔴 Clear button clicked!')
                alert('Clear button clicked!')
                clearAllSessions()
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              🧹 Clear All Sessions
            </button>
          </div>
          {/* Daily Summary Component */}
          <DailySummary
            totalFocusSessions={totalFocusSessions}
            totalFocusTime={totalFocusTime}
            totalBreakTime={totalBreakTime}
          />
        </div>
      </div>
    </>
  )
}

export default TimeTrackerPanel