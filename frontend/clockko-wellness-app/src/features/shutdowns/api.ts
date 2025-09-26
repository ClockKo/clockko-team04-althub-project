import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Types for shutdown data
export type ProductivityRating = 'great' | 'good' | 'okay' | 'tough'

export type ShutdownReflection = {
  productivity_rating: ProductivityRating
  reflection_note?: string
  mindful_disconnect_completed: boolean[]
  session_id?: string
}

export type ShutdownSummary = {
  tasksCompleted: number
  tasksTotal: number
  focusTime: number
  focusGoal: number
  pendingTasks: number
  shutdownStreak: number
  pointsEarned: number
  clockedOutTime?: string
  todayTasks: Array<{
    name: string
    completed: boolean
  }>
}

/**
 * Fetch shutdown summary data for the modal
 */
export const fetchShutdownSummary = async (): Promise<ShutdownSummary> => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get(`${API_URL}/dashboard/shutdown-summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch shutdown summary:', error)
    // Return fallback data
    return {
      tasksCompleted: 0,
      tasksTotal: 0,
      focusTime: 0,
      focusGoal: 0,
      pendingTasks: 0,
      shutdownStreak: 0,
      pointsEarned: 0,
      todayTasks: [],
    }
  }
}

/**
 * Submit shutdown reflection data
 */
export const submitShutdownReflection = async (reflection: ShutdownReflection): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken')
    await axios.post(`${API_URL}/dashboard/shutdown-reflection`, reflection, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('Failed to submit shutdown reflection:', error)
    throw error
  }
}

/**
 * Calculate points earned based on session data
 */
export const calculateShutdownPoints = (summary: ShutdownSummary): number => {
  let points = 0
  
  // Base points for completing a work session
  points += 10
  
  // Points for task completion
  points += summary.tasksCompleted * 5
  
  // Points for meeting focus goal
  if (summary.focusTime >= summary.focusGoal) {
    points += 15
  }
  
  // Bonus points for shutdown streak
  if (summary.shutdownStreak > 0) {
    points += Math.min(summary.shutdownStreak * 2, 20) // Max 20 bonus points
  }
  
  return points
}