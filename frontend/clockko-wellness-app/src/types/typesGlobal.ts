// Authentication
export interface User {
  id: string
  username: string
  email: string
  passwordHash?: string // Store securely, never send to client!
  avatarUrl?: string
  initials?: string
  joinedAt: Date
  lastLogin?: Date
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegistrationData {
  username: string
  email: string
  password: string
}
/*************************************************************/
/*************************************************************/

// Dashboard
export interface DashboardData {
  user: User
  todaySummary: TimeLog | null
  tasks: Task[]
  productivityScore: number
  activeRoom?: Room
  wellnessReport?: WellnessReport
  points: number
  recentReflections: ShutdownReflection[]
  leaderboard?: ChallengeParticipant[]
}
/*************************************************************/

// Time Tracker
export interface TimeLog {
  id: string
  userId: string
  clockIn: Date
  clockOut: Date | null
  breaks: BreakInterval[]
  date: string // e.g. '2025-08-06'
}
export interface BreakInterval {
  start: Date
  end: Date | null
}
export interface DailySummary {
  date: string // Format: YYYY-MM-DD
  totalHours: number
  totalBreakMinutes: number
  entries: TimeLog[]
}

/*************************************************************/
// Task Tracker/Tasks Management
// Represents a single task with timer and completion status
export interface Task {
  id: string
  title: string
  description?: string
  createdAt?: Date 
  updatedAt?: Date 
  dueAt?: Date
  completed?: boolean
  startDate?: Date
  timer?: TaskTimer
  reminderSet?: boolean
  tags?: Tag[]
}
export interface Tag {
  id: string
  name: string
  color: string
}
export interface TagCreate {
  name: string
  color: string
}

// Timer details for a task
export interface TaskTimer {
  isRunning: boolean
  elapsedSeconds: number
  startedAt?: Date
}
// For reminders about incomplete tasks
export interface TaskReminder {
  taskId: string
  reminderTime: Date
  notified: boolean
}
// Daily productivity score (based on tasks completed, etc.)
export interface DailyProductivityScore {
  date: string // YYYY-MM-DD
  tasksCompleted: number
  totalTasks: number
  score: number // Calculated score (e.g., 0-100)
}
/*************************************************************/

// Guided Shutdowns
export interface ShutdownReflection {
  id: string
  userId: string
  date: string // e.g. '2025-08-06'
  logoffTime: Date
  wentWell: string
  toDoBetter: string
}
/*************************************************************/

// Virtual Co-working Rooms
export type RoomSummary = {
  id: string;
  name: string;
  description: string;
  status: string;  // "rooms" | "active"
  count: number;
  color?: string;
};

export type Participant = {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
  muted: boolean;
};

export type Message = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  participants: Participant[];
  messages: Message[];
};
/*************************************************************/

// Monthly Wellness Reports
export interface WorkHourBreakdown {
  totalHours: number
  averageDailyHours: number
  longestSession: number
  shortestSession: number
}

export interface ProductivityStat {
  date: string // e.g. '2025-08-07'
  hoursWorked: number
  tasksCompleted: number
  score: number
}

export interface WellnessStat {
  date: string
  shutdownConsistency: number // percentage
  mood: number // 1-5
  notes?: string
}

export interface WellnessReport {
  productivity: ProductivityStat[]
  wellness: WellnessStat[]
  workHourBreakdown: WorkHourBreakdown
  totalHours: number
  avgProductivity: number
  avgMood: number
  recommendations: string[]
}

/*************************************************************/
// Community & Challenges Interfaces for challenge, participant, progress, etc.
export interface Challenge {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  goal: string
  participants: ChallengeParticipant[]
}

export interface ChallengeParticipant {
  userId: string
  username: string
  avatarUrl?: string
  progress: number
  points: number
}

export interface JoinChallengePayload {
  challengeId: string
}

export interface LeaveChallengePayload {
  challengeId: string
}

/*************************************************************/
