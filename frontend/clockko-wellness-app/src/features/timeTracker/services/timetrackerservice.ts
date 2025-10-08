 // Time Tracker API Service 

interface FocusSession {
  id: string
  startTime: Date
  endTime?: Date
  plannedDuration: number // in minutes
  actualDuration?: number // in minutes
  sessionType: 'focus' | 'break'
  status: 'active' | 'completed' | 'stopped' | 'paused'
}

interface DailySummary {
  date: string // YYYY-MM-DD format
  totalFocusSessions: number
  totalFocusTime: number // in seconds
  totalBreakTime: number // in seconds
  sessions: FocusSession[]
}

class TimeTrackerService {
  private queryClient: any = null // Will store React Query client reference
  
  // Method to set the query client for cache invalidation
  setQueryClient(client: any) {
    this.queryClient = client
  }
  
  // Helper method to invalidate dashboard cache
  private invalidateDashboardCache() {
    if (this.queryClient) {
      // console.log('🔄 Invalidating dashboard cache after session completion')
      this.queryClient.invalidateQueries({ queryKey: ["dashboardData"] })
      // console.log('🔄 Dashboard cache invalidation call completed')
    } else {
      console.warn('⚠️ Query client not available for dashboard cache invalidation')
    }
  }

  // TODO: Replace with real API calls when backend is ready
  async startFocusSession(durationMinutes: number, sessionType: 'focus' | 'break' = 'focus'): Promise<FocusSession> {
    // console.log('🚀 Starting focus session:', { durationMinutes, sessionType })
    
    // Check for existing active session via API first (ignore errors for now)
    try {
      const currentSession = await this.getCurrentSessionFromAPI()
      if (currentSession && currentSession.sessionType === sessionType) {
        // Check if the session is stale (older than 2 hours)
        const sessionAgeHours = (new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60 * 60)
        const isStaleSession = sessionAgeHours > 2
        
        if (isStaleSession) {
          // console.log(`🕒 Detected stale ${currentSession.sessionType} session (${sessionAgeHours.toFixed(1)} hours old), auto-completing...`)
          await this.completeFocusSession(currentSession.id)
          // console.log('✅ Stale session auto-completed, continuing with new session...')
          // Continue to start new session
        } else {
          // Same session type - offer to complete the existing one
          const shouldComplete = confirm(
            `You have an active ${currentSession.sessionType} session.\n` +
            `Started: ${currentSession.startTime.toLocaleTimeString()}\n\n` +
            `Complete it and start a new ${sessionType} session?`
          )
          
          if (shouldComplete) {
            await this.completeFocusSession(currentSession.id)
            // console.log('✅ Previous session completed, starting new one...')
            // Continue to start new session
          } else {
            throw new Error(`Cannot start new ${sessionType} session - you have an active ${currentSession.sessionType} session`)
          }
        }
      } else if (currentSession && currentSession.sessionType !== sessionType) {
        // Different session type - handle based on logic
        if (sessionType === 'break' && currentSession.sessionType === 'focus') {
          // Check if focus session is stale
          const sessionAgeHours = (new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60 * 60)
          const isStaleSession = sessionAgeHours > 2
          
          if (isStaleSession) {
            // console.log(`🕒 Detected stale focus session (${sessionAgeHours.toFixed(1)} hours old), auto-completing before break...`)
            await this.completeFocusSession(currentSession.id)
            // console.log('✅ Stale focus session auto-completed, starting break...')
            // Continue to start break session
          } else {
            // Check if the focus session is already paused (paused by UI before calling this)
            if (currentSession.status === 'paused') {
              // console.log('🔄 Focus session is already paused, proceeding with break...')
              // Focus session is already paused, continue to start break
            } else {
              // User wants to take a break - pause the focus session
              const shouldPause = confirm(
                `You have an active focus session.\n` +
                `Pause it and start a break?`
              )
              
              if (shouldPause) {
                await this.pauseFocusSession(currentSession.id)
                // console.log('⏸️ Focus session paused, starting break...')
                // Continue to start break session
              } else {
                throw new Error('Cannot start break - focus session is still active')
              }
            }
          }
        } else {
          // Other combinations - check for stale sessions
          const sessionAgeHours = (new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60 * 60)
          const isStaleSession = sessionAgeHours > 2
          
          if (isStaleSession) {
            // console.log(`🕒 Detected stale ${currentSession.sessionType} session (${sessionAgeHours.toFixed(1)} hours old), auto-completing...`)
            await this.completeFocusSession(currentSession.id)
            // console.log('✅ Stale session auto-completed, continuing with new session...')
            // Continue to start new session
          } else {
            // Recent session - ask user
            throw new Error(`You have an active ${currentSession.sessionType} session. Complete it first.`)
          }
        }
      }
    } catch (error) {
      // console.log('⚠️ Could not check for existing session (backend might be starting):', error)
      // If it's our own error from above, re-throw it
      if (error instanceof Error && (error.message.includes('Cannot start') || error.message.includes('Complete it first'))) {
        throw error
      }
      // Otherwise continue - the backend will handle conflicts
    }
    // Allow different session types to coexist (work + focus)

    // Get auth token from localStorage
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('User not authenticated')
    }

    // Get user data to get user ID
  const userResponse = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to get user data')
    }
    
    const userData = await userResponse.json()
    const userId = userData.id

    // Prepare API request
    const requestData = {
      user_id: userId,
      type: sessionType,
      start_time: new Date().toISOString(),
      planned_duration: durationMinutes
    }

    // Make API call
    const endpoint = sessionType === 'focus' ? '/focus-sessions/start' : '/break-sessions/start'
  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const responseData = await response.json()
    
    // Convert backend response to frontend session format
    const session: FocusSession = {
      id: responseData.session_id,
      startTime: new Date(responseData.start_time),
      endTime: responseData.end_time ? new Date(responseData.end_time) : undefined,
      plannedDuration: responseData.planned_duration,
      actualDuration: responseData.actual_duration,
      sessionType: responseData.type as 'focus' | 'break',
      status: responseData.status as 'active' | 'completed' | 'stopped' | 'paused'
    }
    
    
    // console.log('✅ Focus session started via API:', session)
    return session
  }

  async completeFocusSession(sessionId: string): Promise<FocusSession> {
    // console.log('🏁 Completing focus session:', sessionId)
    
    // Get current session from API first
    const currentSession = await this.getCurrentSessionFromAPI()
    if (!currentSession || currentSession.id !== sessionId) {
      throw new Error('Active session not found')
    }

    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('User not authenticated')
    }

    // Prepare API request
    const now = new Date()
    const requestData = {
      session_id: sessionId,
      end_time: now.toISOString()
    }

    // console.log('📅 Completion time data:', {
    //   sessionId,
    //   localTime: now.toString(),
    //   isoTime: now.toISOString(),
    //   startTime: currentSession.startTime.toString(),
    //   startTimeISO: currentSession.startTime.toISOString()
    // })

    // Make API call to end session
    const endpoint = currentSession.sessionType === 'focus' 
      ? `/focus-sessions/${sessionId}/end` 
      : `/break-sessions/${sessionId}/end`
    
  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const responseData = await response.json()
    
    // Convert backend response to frontend session format
    const completedSession: FocusSession = {
      id: responseData.session_id,
      startTime: new Date(responseData.start_time),
      endTime: new Date(responseData.end_time),
      plannedDuration: responseData.planned_duration,
      actualDuration: responseData.actual_duration,
      sessionType: responseData.type as 'focus' | 'break',
      status: responseData.status as 'active' | 'completed' | 'stopped' | 'paused'
    }
    
    // console.log('✅ Focus session completed via API:', completedSession)
    
    // Invalidate dashboard cache to update focus time display
    // console.log('🔄 About to invalidate dashboard cache...')
    this.invalidateDashboardCache()
    // console.log('🔄 Dashboard cache invalidation completed')
    
    return completedSession
  }

  async pauseFocusSession(sessionId: string): Promise<FocusSession> {
    // console.log('⏸️ Pausing focus session:', sessionId)
    
    // Get current session from API first
    const currentSession = await this.getCurrentSessionFromAPI()
    if (!currentSession || currentSession.id !== sessionId) {
      throw new Error('Active session not found')
    }

    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('User not authenticated')
    }

    // Make API call to pause session
  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/focus-sessions/${sessionId}/pause`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        paused_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const responseData = await response.json()
    
    // Convert backend response to frontend session format
    const pausedSession: FocusSession = {
      id: responseData.session_id,
      startTime: new Date(responseData.start_time),
      endTime: responseData.end_time ? new Date(responseData.end_time) : undefined,
      plannedDuration: responseData.planned_duration,
      actualDuration: responseData.actual_duration,
      sessionType: responseData.type as 'focus' | 'break',
      status: 'paused' as const
    }
    
    // console.log('⏸️ Focus session paused via API:', pausedSession)
    return pausedSession
  }

  async resumeFocusSession(sessionId: string): Promise<FocusSession> {
    // console.log('▶️ Resuming focus session:', sessionId)
    
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('User not authenticated')
    }

    // Make API call to resume session
  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/focus-sessions/${sessionId}/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        resumed_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const responseData = await response.json()
    
    // Convert backend response to frontend session format
    const resumedSession: FocusSession = {
      id: responseData.session_id,
      startTime: new Date(responseData.start_time),
      endTime: responseData.end_time ? new Date(responseData.end_time) : undefined,
      plannedDuration: responseData.planned_duration,
      actualDuration: responseData.actual_duration,
      sessionType: responseData.type as 'focus' | 'break',
      status: 'active' as const
    }
    
    // console.log('▶️ Focus session resumed via API:', resumedSession)
    return resumedSession
  }

  async stopFocusSession(sessionId: string): Promise<FocusSession> {
    console.log('⏹️ Stopping focus session:', sessionId)
    
    // TODO: REMOVED localStorage for testing - Use API instead
    throw new Error('Stop functionality not implemented for API-only testing')
  }

  async getCurrentSessionFromAPI(): Promise<FocusSession | null> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return null

  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/time-logs/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // No active session
        }
        throw new Error(`Failed to get current session: ${response.status}`)
      }

      const responseData = await response.json()
      
      // Only return focus and break sessions (work sessions are handled by work widget)
      if (responseData.type !== 'focus' && responseData.type !== 'break') {
        return null // Not a timetracker session
      }
      
      // Convert backend response to frontend session format
      return {
        id: responseData.session_id,
        startTime: new Date(responseData.start_time),
        endTime: responseData.end_time ? new Date(responseData.end_time) : undefined,
        plannedDuration: responseData.planned_duration,
        actualDuration: responseData.actual_duration,
        sessionType: responseData.type as 'focus' | 'break',
        status: responseData.status as 'active' | 'completed' | 'stopped' | 'paused'
      }
    } catch (error) {
      console.error('Error fetching current session from API:', error)
      return null
    }
  }


  async getDailySummary(date?: string): Promise<DailySummary> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    console.log('📊 Getting daily summary for:', targetDate)
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('⚠️ No auth token found, returning empty summary')
        return {
          date: targetDate,
          totalFocusSessions: 0,
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessions: []
        }
      }

      // Fetch daily summary from API
  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/time-logs/daily-summary?date=${targetDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📊 No data found for date, returning empty summary')
          return {
            date: targetDate,
            totalFocusSessions: 0,
            totalFocusTime: 0,
            totalBreakTime: 0,
            sessions: []
          }
        }
        throw new Error(`Failed to get daily summary: ${response.status}`)
      }

      const responseData = await response.json()
      
      // Convert backend response to frontend format
      const sessions: FocusSession[] = responseData.sessions?.map((session: any) => ({
        id: session.session_id,
        startTime: new Date(session.start_time),
        endTime: session.end_time ? new Date(session.end_time) : undefined,
        plannedDuration: session.planned_duration,
        actualDuration: session.actual_duration,
        sessionType: session.type as 'focus' | 'break',
        status: session.status as 'active' | 'completed' | 'stopped' | 'paused'
      })) || []

      console.log('🔍 Raw backend response data:', {
        total_focus_time: responseData.total_focus_time,
        total_break_time: responseData.total_break_time,
        total_focus_sessions: responseData.total_focus_sessions
      })

      const summary: DailySummary = {
        date: targetDate,
        totalFocusSessions: responseData.total_focus_sessions || 0,
        totalFocusTime: responseData.total_focus_time || 0, // Don't convert yet - let's see what backend returns
        totalBreakTime: responseData.total_break_time || 0, // Don't convert yet - let's see what backend returns
        sessions: sessions
      }

      // console.log('🔍 Summary before any conversion:', summary)

      // console.log('🔄 Recalculated totals from sessions:', { 
      //   sessions: sessions.length, 
      //   focusSessions: summary.totalFocusSessions, 
      //   focusTime: summary.totalFocusTime, 
      //   breakTime: summary.totalBreakTime 
      // })
      
      // console.log('📊 Daily summary:', summary)
      return summary

    } catch (error) {
      console.error('Failed to get daily summary from API:', error)
      // Fallback to empty summary
      return {
        date: targetDate,
        totalFocusSessions: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        sessions: []
      }
    }
  }


  // Clear all timetracker sessions via API for clean slate
  async clearAllSessions(): Promise<void> {
    console.log('🧹 Clearing all timetracker sessions...')
    
    const token = localStorage.getItem('authToken')
    console.log('🔍 Token check:', { 
      exists: !!token, 
      preview: token?.substring(0, 20) + '...' 
    })
    
    if (!token) {
      const errorMsg = 'User not authenticated - no authToken found'
      console.error('❌', errorMsg)
      throw new Error(errorMsg)
    }

    try {
      console.log('📡 Making DELETE request to clear-all endpoint...')
  const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/time-logs/clear-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', { status: response.status, text: errorText })
        throw new Error(`Failed to clear sessions: ${response.status} - ${errorText}`)
      }

      const clearResult = await response.json()
      console.log('✅ Clear successful:', clearResult)
      
      // Clear any localStorage as well for complete clean slate
      // localStorage.removeItem('timetracker_current_session')
      // localStorage.removeItem('timetracker_daily_summary')
      // localStorage.removeItem('timetracker_paused_session')
      
      return clearResult
    } catch (error) {
      console.error('Failed to clear sessions:', error)
      throw error
    }
  }

}

// Export singleton instance
export const timeTrackerService = new TimeTrackerService()

// Export types for use in components
export type { FocusSession, DailySummary }