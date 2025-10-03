// Onboarding API functions for saving user preferences during onboarding flow
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with auth token
const createApiInstance = () => {
  const token = localStorage.getItem('authToken');  // Fixed: Use 'authToken' instead of 'token'
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// Types for onboarding data structure
export interface OnboardingSettings {
  // Work schedule from WorkDaysModal and ClockOutModal
  work_start_time?: string;
  work_end_time?: string;
  max_daily_hours?: number;
  
  // Break and focus settings from FocusModal
  break_reminder_interval?: number;
  pomodoro_work_duration?: number;
  max_continuous_work?: number;
  
  // Notification preferences from ReminderModal
  shutdown_reminders_enabled?: boolean;
  break_reminders_enabled?: boolean;
  overwork_notifications_enabled?: boolean;
  wellness_check_enabled?: boolean;
  
  // Profile settings from AvatarModal (if needed later)
  profile_visibility?: string;
}

// Convert onboarding form data to backend API format
export function convertOnboardingToSettings(onboardingData: {
  selectedDays: string[];
  clockOut: { hour: string; minute: string };
  ampm: 'AM' | 'PM';
  focusTimer: { hour: string; minute: string };
  reminders: {
    shutdown: boolean;
    break: boolean;
    tasks: boolean;
  };
}): OnboardingSettings {
  // Convert clock out time to 24-hour format
  const clockOutHour = parseInt(onboardingData.clockOut.hour);
  const clockOutMinute = parseInt(onboardingData.clockOut.minute);
  const is24Hour = onboardingData.ampm === 'PM' && clockOutHour !== 12 ? clockOutHour + 12 : clockOutHour;
  const formattedClockOut = `${is24Hour.toString().padStart(2, '0')}:${clockOutMinute.toString().padStart(2, '0')}`;
  
  // Convert focus timer to minutes for break reminder interval
  const focusHours = parseInt(onboardingData.focusTimer.hour) || 0;
  const focusMinutes = parseInt(onboardingData.focusTimer.minute) || 30;
  const totalFocusMinutes = (focusHours * 60) + focusMinutes;
  
  // Calculate work hours based on typical 9 AM start and clock out time
  const workStartHour = 8; // Default 8 AM start
  const workEndHour = is24Hour;
  const dailyHours = workEndHour > workStartHour ? workEndHour - workStartHour : 8; // Default to 8 hours if calculation doesn't work
  
  return {
    work_start_time: "08:00", // Default 8 AM start
    work_end_time: formattedClockOut,
    max_daily_hours: Math.min(Math.max(dailyHours, 1), 16), // Ensure between 1-16 hours
    break_reminder_interval: Math.min(Math.max(totalFocusMinutes, 10), 120), // Ensure between 10-120 minutes
    pomodoro_work_duration: 25, // Default Pomodoro work duration
    max_continuous_work: totalFocusMinutes,
    shutdown_reminders_enabled: onboardingData.reminders.shutdown,
    break_reminders_enabled: onboardingData.reminders.break,
    overwork_notifications_enabled: onboardingData.reminders.tasks, // Map task reminders to overwork notifications
    wellness_check_enabled: true, // Enable wellness checks by default
    profile_visibility: "public", // Default profile visibility
  };
}

// Save onboarding settings to backend user settings API
export async function saveOnboardingSettings(settings: OnboardingSettings): Promise<void> {
  try {
    console.log('Saving onboarding settings to backend:', settings);
    
    const api = createApiInstance();
    const response = await api.put('/api/users/settings/quick', settings);
    
    if (response.status !== 200) {
      throw new Error(`Failed to save onboarding settings: ${response.status}`);
    }
    
    console.log('Onboarding settings saved successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error saving onboarding settings:', error);
    
    // Provide user-friendly error messages
    const errorMessage = error.response?.data?.detail || 
                        error.message || 
                        'Failed to save your preferences. Please try again.';
    
    throw new Error(errorMessage);
  }
}

// Complete onboarding API call - combines settings save with onboarding completion
export async function completeOnboarding(onboardingData: {
  selectedDays: string[];
  clockOut: { hour: string; minute: string };
  ampm: 'AM' | 'PM';
  focusTimer: { hour: string; minute: string };
  reminders: {
    shutdown: boolean;
    break: boolean;
    tasks: boolean;
  };
}): Promise<void> {
  try {
    // Convert onboarding data to settings format
    const settings = convertOnboardingToSettings(onboardingData);
    
    // Save settings to backend
    await saveOnboardingSettings(settings);
    
    console.log('Onboarding completed successfully with settings:', settings);
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    throw error; // Re-throw to be handled by the UI
  }
}