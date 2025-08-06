// Authentication
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string; // Store securely, never send to client!
  avatarUrl?: string;
  initials?: string;
  joinedAt: Date;
  lastLogin?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}
/*************************************************************/ 

// Landing Page
export interface LandingPageContent {
  features: LandingFeature[];
  heroText: string;
  callToActionText: string;
  testimonials?: Testimonial[];
}

export interface LandingFeature {
  title: string;
  description: string;
  iconUrl?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  quote: string;
  avatarUrl?: string;
}
/*************************************************************/ 

// Dashboard
export interface DashboardData {
  user: User;
  todaySummary: TimeLog | null;
  tasks: Task[];
  productivityScore: number;
  activeRoom?: Room;
  wellnessReport?: WellnessReport;
  points: number;
  recentReflections: ShutdownReflection[];
  leaderboard?: ChallengeParticipant[];
}
/*************************************************************/ 

// Time Tracker
export interface TimeLog {
  id: string;
  userId: string;
  clockIn: Date;
  clockOut: Date | null;
  breaks: BreakInterval[];
  date: string; // e.g. '2025-08-06'
}
export interface BreakInterval {
  start: Date;
  end: Date | null;
}
export interface DailySummary {
  date: string; // Format: YYYY-MM-DD
  totalHours: number;
  totalBreakMinutes: number;
  entries: TimeLog[];
}

/*************************************************************/ 
// Task Tracker/Tasks Management
// Represents a single task with timer and completion status
export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  dueAt?: Date;
  completed: boolean;
  timer: TaskTimer;
  reminderSet: boolean;
}
// Timer details for a task
export interface TaskTimer {
  isRunning: boolean;
  elapsedSeconds: number;
  startedAt?: Date;
}
// For reminders about incomplete tasks
export interface TaskReminder {
  taskId: string;
  reminderTime: Date;
  notified: boolean;
}
// Daily productivity score (based on tasks completed, etc.)
export interface DailyProductivityScore {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  score: number; // Calculated score (e.g., 0-100)
}
/*************************************************************/ 

// Guided Shutdowns
export interface ShutdownReflection {
  id: string;
  userId: string;
  date: string; // e.g. '2025-08-06'
  logoffTime: Date;
  wentWell: string;
  toDoBetter: string;
}
/*************************************************************/ 

// Virtual Co-working Rooms
export interface Room {
  id: string;
  name: string;
  participants: RoomParticipant[];
  sessionStart: Date | null;
  sessionEnd: Date | null;
  silent: boolean;
}
export interface RoomParticipant {
  userId: string;
  avatarUrl?: string;
  initials?: string;
  joinedAt: Date;
}
/*************************************************************/ 

// Monthly Wellness Reports
export interface WellnessReport {
  id: string;
  userId: string;
  month: string; // e.g. '2025-08'
  workHourBreakdown: WorkHourBreakdown;
  shutdownConsistency: number; // e.g. percentage 0-100
  recommendations: string[];
}
export interface WorkHourBreakdown {
  totalHours: number;
  averageDailyHours: number;
  longestSession: number;
  shortestSession: number;
}

/*************************************************************/ 
// Community & Challenges
export interface Challenge {
  id: string;
  name: string;
  week: string; // e.g. '2025-W32'
  participants: ChallengeParticipant[];
  messages: ChallengeMessage[];
}
export interface ChallengeParticipant {
  userId: string;
  points: number;
  avatarUrl?: string;
  initials?: string;
}
export interface ChallengeMessage {
  userId: string;
  text: string;
  timestamp: Date;
}

/*************************************************************/
// Reward System
export interface Reward {
  id: string;
  userId: string;
  points: number;
  redeemed: RedeemedPerk[];
}
export interface RedeemedPerk {
  perk: string;
  date: Date;
}