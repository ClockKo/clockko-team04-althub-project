/*
timeTrackerService.ts        # API calls or local storage logic
*/ 

// Time Tracker API Service - Prepared for Backend Integration
// Currently uses localStorage, ready to switch to real API calls

interface FocusSession {
  id: string
  startTime: Date
  endTime?: Date
  plannedDuration: number // in minutes
  actualDuration?: number // in minutes
  sessionType: 'focus' | 'break'
  status: 'active' | 'completed' | 'stopped'
}

interface DailySummary {
  date: string // YYYY-MM-DD format
  totalFocusSessions: number
  totalFocusTime: number // in seconds
  totalBreakTime: number // in seconds
  sessions: FocusSession[]
}

class TimeTrackerService {
  private readonly STORAGE_KEYS = {
    DAILY_SUMMARY: 'timetracker_daily_summary',
    CURRENT_SESSION: 'timetracker_current_session',
    USER_SESSIONS: 'timetracker_user_sessions'
  }

  // TODO: Replace with real API calls when backend is ready
  async startFocusSession(durationMinutes: number, sessionType: 'focus' | 'break' = 'focus'): Promise<FocusSession> {
    console.log('🚀 Starting focus session:', { durationMinutes, sessionType })
    
    // Check for existing active session
    const currentSession = this.getCurrentSession()
    if (currentSession) {
      throw new Error(`Active ${currentSession.sessionType} session already exists`)
    }

    const session: FocusSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      plannedDuration: durationMinutes,
      sessionType,
      status: 'active'
    }

    // Store current session
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session))
    
    console.log('✅ Focus session started:', session)
    return session
  }

  async completeFocusSession(sessionId: string): Promise<FocusSession> {
    console.log('🏁 Completing focus session:', sessionId)
    
    const currentSession = this.getCurrentSession()
    if (!currentSession || currentSession.id !== sessionId) {
      throw new Error('Active session not found')
    }

    const now = new Date()
    const completedSession: FocusSession = {
      ...currentSession,
      endTime: now,
      actualDuration: Math.round((now.getTime() - currentSession.startTime.getTime()) / 60000),
      status: 'completed'
    }

    // Clear current session
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION)
    
    // Add to daily summary
    this.addSessionToDailySummary(completedSession)
    
    console.log('✅ Focus session completed:', completedSession)
    return completedSession
  }

  async stopFocusSession(sessionId: string): Promise<FocusSession> {
    console.log('⏹️ Stopping focus session:', sessionId)
    
    const currentSession = this.getCurrentSession()
    if (!currentSession || currentSession.id !== sessionId) {
      throw new Error('Active session not found')
    }

    const now = new Date()
    const stoppedSession: FocusSession = {
      ...currentSession,
      endTime: now,
      actualDuration: Math.round((now.getTime() - currentSession.startTime.getTime()) / 60000),
      status: 'stopped'
    }

    // Clear current session
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION)
    
    // Add to daily summary
    this.addSessionToDailySummary(stoppedSession)
    
    console.log('⏹️ Focus session stopped:', stoppedSession)
    return stoppedSession
  }

  getCurrentSession(): FocusSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION)
      if (!stored) return null
      
      const session = JSON.parse(stored)
      // Convert date strings back to Date objects
      session.startTime = new Date(session.startTime)
      if (session.endTime) session.endTime = new Date(session.endTime)
      
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  async getDailySummary(date?: string): Promise<DailySummary> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    console.log('📊 Getting daily summary for:', targetDate)
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.DAILY_SUMMARY)
      const allSummaries: Record<string, DailySummary> = stored ? JSON.parse(stored) : {}
      
      let summary = allSummaries[targetDate] || {
        date: targetDate,
        totalFocusSessions: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        sessions: []
      }
      
      // Recalculate totals from sessions to ensure data integrity
      if (summary.sessions.length > 0) {
        summary.totalFocusSessions = 0;
        summary.totalFocusTime = 0;
        summary.totalBreakTime = 0;
        
        summary.sessions.forEach(session => {
          if ((session.status === 'completed' || session.status === 'stopped') && session.actualDuration) {
            if (session.sessionType === 'focus') {
              summary.totalFocusSessions += 1;
              summary.totalFocusTime += session.actualDuration * 60; // convert to seconds
            } else if (session.sessionType === 'break') {
              summary.totalBreakTime += session.actualDuration * 60; // convert to seconds
            }
          }
        });
        
        console.log('🔄 Recalculated totals from sessions:', {
          sessions: summary.sessions.length,
          focusSessions: summary.totalFocusSessions,
          focusTime: summary.totalFocusTime,
          breakTime: summary.totalBreakTime
        });
      }
      
      console.log('📊 Daily summary:', summary)
      return summary
    } catch (error) {
      console.error('Error getting daily summary:', error)
      return {
        date: targetDate,
        totalFocusSessions: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        sessions: []
      }
    }
  }

  private addSessionToDailySummary(session: FocusSession) {
    // Ensure startTime is a Date object for proper date extraction
    const startTime = typeof session.startTime === 'string' ? new Date(session.startTime) : session.startTime;
    const date = startTime.toISOString().split('T')[0]
    
    console.log('💾 Adding session to daily summary:', { sessionId: session.id, date, sessionType: session.sessionType, status: session.status });
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.DAILY_SUMMARY)
      const allSummaries: Record<string, DailySummary> = stored ? JSON.parse(stored) : {}
      
      if (!allSummaries[date]) {
        allSummaries[date] = {
          date,
          totalFocusSessions: 0,
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessions: []
        }
      }
      
      const summary = allSummaries[date]
      summary.sessions.push(session)
      
      // Count both completed and stopped sessions (stopped still counts as productive time)
      if ((session.status === 'completed' || session.status === 'stopped') && session.actualDuration) {
        if (session.sessionType === 'focus') {
          summary.totalFocusSessions += 1
          summary.totalFocusTime += session.actualDuration * 60 // convert to seconds
        } else if (session.sessionType === 'break') {
          summary.totalBreakTime += session.actualDuration * 60 // convert to seconds
        }
        console.log(`📊 Updated totals: ${session.sessionType} sessions: ${summary.totalFocusSessions}, focus time: ${summary.totalFocusTime}s`);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.DAILY_SUMMARY, JSON.stringify(allSummaries))
      console.log('💾 Session added to daily summary:', { date, session })
      
    } catch (error) {
      console.error('Error adding session to daily summary:', error)
    }
  }

  // Helper method to clear all data (for testing)
  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('🗑️ All time tracker data cleared')
  }
}

// Export singleton instance
export const timeTrackerService = new TimeTrackerService()

// Export types for use in components
export type { FocusSession, DailySummary }