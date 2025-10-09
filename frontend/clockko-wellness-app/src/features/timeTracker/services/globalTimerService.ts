/**
 * Global Timer Service - Persistent Timer that survives navigation
 * 
 * This service manages the timer independently of React components,
 * ensuring timers continue running even when users navigate away
 * from the TimeTracker feature.
 */

import { timeTrackerService, type FocusSession } from './timetrackerservice'
import { soundService } from './soundService'

type TimerMode = 'initial' | 'focus' | 'break' | 'completed'

interface TimerState {
  mode: TimerMode
  timeLeft: number // seconds
  isRunning: boolean
  focusDuration: number // seconds
  breakDuration: number // seconds
  currentSession: FocusSession | null
  pausedFocusSession: FocusSession | null
  pausedFocusTimeLeft: number | null
}

type TimerEventType = 'tick' | 'complete' | 'start' | 'pause' | 'stop' | 'modeChange'

interface TimerEvent {
  type: TimerEventType
  data: Partial<TimerState>
}

type TimerEventListener = (event: TimerEvent) => void

class GlobalTimerService {
  private timerInterval: number | null = null
  private state: TimerState = {
    mode: 'initial',
    timeLeft: 25 * 60, // 25 minutes default
    isRunning: false,
    focusDuration: 25 * 60,
    breakDuration: 5 * 60,
    currentSession: null,
    pausedFocusSession: null,
    pausedFocusTimeLeft: null,
  }
  
  private listeners: Set<TimerEventListener> = new Set()
  private isInitialized = false

  constructor() {
    this.initializeFromStorage()
    
    // Request notification permission on startup
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission)
      })
    }
  }

  // === INITIALIZATION ===
  
  private async initializeFromStorage() {
    if (this.isInitialized) return
    
    try {
      // Check for existing active session
      const currentSession = await timeTrackerService.getCurrentSessionFromAPI()
      
      if (currentSession && currentSession.status === 'active') {
        // console.log('🔄 Found active session, restoring timer state:', currentSession)
        
        // Calculate time left based on session start time and planned duration
        const startTime = new Date(currentSession.startTime)
        const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)
        const plannedSeconds = currentSession.plannedDuration * 60
        const timeLeft = Math.max(0, plannedSeconds - elapsedSeconds)
        
        this.state = {
          ...this.state,
          mode: currentSession.sessionType === 'focus' ? 'focus' : 'break',
          timeLeft,
          isRunning: true,
          focusDuration: plannedSeconds,
          breakDuration: currentSession.sessionType === 'break' ? plannedSeconds : this.state.breakDuration,
          currentSession,
        }
        
        // If time is up, complete the session
        if (timeLeft <= 0) {
          console.log('⏰ Session time expired, completing...')
          await this.handleTimerCompletion()
        } else {
          // Resume the timer
          this.startTimer()
        }
      }
      
      // Check for paused focus sessions
      const pausedSession = this.loadPausedFocusSession()
      if (pausedSession) {
        this.state.pausedFocusSession = pausedSession.session
        this.state.pausedFocusTimeLeft = pausedSession.timeLeft
        // console.log('📋 Found paused focus session:', pausedSession)
      }
      
      this.isInitialized = true
      this.emitEvent('modeChange', this.state)
      
    } catch (error) {
      console.error('Failed to initialize timer from storage:', error)
      this.isInitialized = true
    }
  }

  // === EVENT SYSTEM ===
  
  subscribe(listener: TimerEventListener): () => void {
    this.listeners.add(listener)
    // Send current state immediately
    listener({ type: 'modeChange', data: this.state })
    
    return () => {
      this.listeners.delete(listener)
    }
  }
  
  private emitEvent(type: TimerEventType, data: Partial<TimerState> = {}) {
    const event: TimerEvent = { type, data: { ...this.state, ...data } }
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in timer event listener:', error)
      }
    })
  }

  // === TIMER CONTROL ===
  
  private startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    
    this.timerInterval = window.setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.state.timeLeft -= 1
        this.emitEvent('tick', { timeLeft: this.state.timeLeft })
      } else {
        this.handleTimerCompletion()
      }
    }, 1000)
  }
  
  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }
  
  async startFocusSession(durationMinutes: number): Promise<void> {
    try {
    //   console.log('🚀 Starting focus session:', durationMinutes, 'minutes')
      
      const duration = durationMinutes * 60
      const session = await timeTrackerService.startFocusSession(durationMinutes, 'focus')
      
      this.state = {
        ...this.state,
        mode: 'focus',
        timeLeft: duration,
        isRunning: true,
        focusDuration: duration,
        currentSession: session,
      }
      
      this.startTimer()
      this.emitEvent('start', this.state)
      
    } catch (error) {
      console.error('Failed to start focus session:', error)
      throw error
    }
  }
  
  async startBreakSession(durationMinutes: number, pauseFocusSession?: boolean): Promise<void> {
    try {
    //   console.log('🌴 Starting break session:', durationMinutes, 'minutes')
      
      // If there's an active focus session and we should pause it
      if (pauseFocusSession && this.state.currentSession && this.state.mode === 'focus') {
        const pausedSession = await timeTrackerService.pauseFocusSession(this.state.currentSession.id)
        this.state.pausedFocusSession = pausedSession
        this.state.pausedFocusTimeLeft = this.state.timeLeft
        this.savePausedFocusSession(pausedSession, this.state.timeLeft)
      }
      
      const duration = durationMinutes * 60
      const session = await timeTrackerService.startFocusSession(durationMinutes, 'break')
      
      this.state = {
        ...this.state,
        mode: 'break',
        timeLeft: duration,
        isRunning: true,
        breakDuration: duration,
        currentSession: session,
      }
      
      this.startTimer()
      this.emitEvent('start', this.state)
      
    } catch (error) {
      console.error('Failed to start break session:', error)
      throw error
    }
  }
  
  pause(): void {
    this.state.isRunning = false
    this.stopTimer()
    this.emitEvent('pause', { isRunning: false })
    
    // Play pause sound
    soundService.playSessionPaused()
  }
  
  resume(): void {
    this.state.isRunning = true
    this.startTimer()
    this.emitEvent('start', { isRunning: true })
    
    // Play resume sound
    soundService.playSessionResumed()
  }
  
  async stop(): Promise<void> {
    try {
      this.stopTimer()
      
      if (this.state.currentSession) {
        // console.log('🛑 Stopping session:', this.state.currentSession.id)
        // Note: timeTrackerService doesn't have a stop method yet, so we'll just clear local state
      }
      
      // Clear paused session if any
      if (this.state.pausedFocusSession) {
        this.clearPausedFocusSession()
      }
      
      // Reset to initial state
      this.state = {
        mode: 'initial',
        timeLeft: 25 * 60,
        isRunning: false,
        focusDuration: 25 * 60,
        breakDuration: 5 * 60,
        currentSession: null,
        pausedFocusSession: null,
        pausedFocusTimeLeft: null,
      }
      
      this.emitEvent('stop', this.state)
      
    } catch (error) {
      console.error('Failed to stop session:', error)
      throw error
    }
  }
  
  private async handleTimerCompletion(): Promise<void> {
    this.stopTimer()
    
    const completedMode = this.state.mode
    // console.log(`⏰ ${completedMode} session completed!`)
    
    try {
      if (this.state.currentSession) {
        await timeTrackerService.completeFocusSession(this.state.currentSession.id)
      }
      
      // Play completion sound and show notification
      if (completedMode === 'focus') {
        soundService.playFocusComplete()
        this.showNotification('Focus Session Complete!', 'Great job! Time for a break?')
        this.state.mode = 'completed'
      } else if (completedMode === 'break') {
        soundService.playBreakComplete()
        this.showNotification('Break Complete!', 'Ready to get back to work?')
        
        // Check if there's a paused focus session to resume BEFORE changing state
        if (this.state.pausedFocusSession && this.state.pausedFocusTimeLeft !== null) {
          await this.resumePausedFocusSession()
          // Return early to avoid setting isRunning = false, since focus session is now active
          return
        } else {
          this.state.mode = 'initial'
          this.state.isRunning = false
          this.state.currentSession = null
          this.emitEvent('complete', this.state)
        }
      } else {
        // Focus session completed
        this.state.isRunning = false
        this.state.currentSession = null
        this.emitEvent('complete', this.state)
      }
      
    } catch (error) {
      console.error('Failed to complete session:', error)
    }
  }
  
  private async resumePausedFocusSession(): Promise<void> {
    if (!this.state.pausedFocusSession || this.state.pausedFocusTimeLeft === null) {
      return
    }
    
    try {
    //   console.log('🔄 Resuming paused focus session')
      
      const resumedSession = await timeTrackerService.resumeFocusSession(this.state.pausedFocusSession.id)
      
      this.state = {
        ...this.state,
        mode: 'focus',
        timeLeft: this.state.pausedFocusTimeLeft,
        isRunning: true,
        currentSession: resumedSession,
        pausedFocusSession: null,
        pausedFocusTimeLeft: null,
      }
      
      this.clearPausedFocusSession()
      this.startTimer()
      this.emitEvent('start', this.state)
      
    } catch (error) {
      console.error('Failed to resume paused focus session:', error)
      // Fall back to initial state
      this.state.mode = 'initial'
      this.state.isRunning = false
      this.emitEvent('modeChange', this.state)
    }
  }
  
  // === NOTIFICATION SYSTEM ===
  
  private showNotification(title: string, body: string): void {
    // Request permission if not already granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.createNotification(title, body)
        }
      })
    } else if (Notification.permission === 'granted') {
      this.createNotification(title, body)
    }
    
    // Also show console notification for development
    // console.log(`🔔 ${title}: ${body}`)
  }
  
  private createNotification(title: string, body: string): void {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico', // You can customize this
      tag: 'clockko-timer', // Prevents multiple notifications
    })
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)
    
    // Focus window when notification is clicked
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
  
  // === STORAGE HELPERS ===
  
  private savePausedFocusSession(session: FocusSession, timeLeft: number): void {
    const data = { session, timeLeft }
    localStorage.setItem('globalTimer_paused_focus', JSON.stringify(data))
  }
  
  private loadPausedFocusSession(): { session: FocusSession; timeLeft: number } | null {
    try {
      const data = localStorage.getItem('globalTimer_paused_focus')
      if (data) {
        const parsed = JSON.parse(data)
        // Validate the data structure
        if (parsed.session && typeof parsed.timeLeft === 'number') {
          return {
            session: {
              ...parsed.session,
              startTime: new Date(parsed.session.startTime),
              endTime: parsed.session.endTime ? new Date(parsed.session.endTime) : undefined,
            },
            timeLeft: parsed.timeLeft
          }
        }
      }
    } catch (error) {
      console.error('Failed to load paused focus session:', error)
    }
    return null
  }
  
  private clearPausedFocusSession(): void {
    localStorage.removeItem('globalTimer_paused_focus')
  }
  
  // === PUBLIC API ===
  
  getState(): TimerState {
    return { ...this.state }
  }
  
  isRunning(): boolean {
    return this.state.isRunning
  }
  
  getCurrentMode(): TimerMode {
    return this.state.mode
  }
  
  getTimeLeft(): number {
    return this.state.timeLeft
  }
  
  // === CLEANUP ===
  
  destroy(): void {
    this.stopTimer()
    this.listeners.clear()
  }
}

// Singleton instance
const globalTimerService = new GlobalTimerService()

export { globalTimerService, type TimerState, type TimerEvent, type TimerEventListener }
export default globalTimerService