/*api.ts                     // API functions for fetching/joining/leaving challenges*/
import axios from 'axios'

// Types
export type Challenge = {
  id: string
  name: string
  description: string
  points: number
  joinedCount: number
  joinedAvatars: string[]
  progress?: number
  total?: number
  status?: 'not_started' | 'in_progress' | 'completed'
}

export type Leader = {
  rank: number
  name: string
  avatar: string
  points: number
  isCurrentUser?: boolean
}

export type ChallengeStats = {
  totalPoints: number
  challengesDone: number
  shutdownStreak: number
  avgShutdownTime: string
}

// API Layer
export async function fetchChallengeStats(): Promise<ChallengeStats> {
  try {
    const res = await axios.get('/api/challenges/stats', { withCredentials: true })
    return res.data
  } catch (error) {
    console.error('Error fetching challenge stats:', error)
    throw new Error('Failed to fetch challenge stats')
  }
}

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const res = await axios.get('/api/challenges/week', { withCredentials: true })
    return res.data
  } catch (error) {
    console.error('Error fetching challenges:', error)
    throw new Error('Failed to fetch challenges')
  }
}

export async function fetchLeaders(): Promise<Leader[]> {
  try {
    const res = await axios.get('/api/challenges/leaders', { withCredentials: true })
    return res.data
  } catch (error) {
    console.error('Error fetching leaders:', error)
    throw new Error('Failed to fetch leaders')
  }
}

export async function startChallenge(challengeId: string): Promise<Challenge> {
  try {
    const res = await axios.post(`/api/challenges/${challengeId}/join`, { withCredentials: true })
    return res.data
  } catch (error) {
    console.error('Error starting challenge:', error)
    throw new Error('Failed to start challenge')
  }
}
