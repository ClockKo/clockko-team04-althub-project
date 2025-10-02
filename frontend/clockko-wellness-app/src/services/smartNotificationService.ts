// Smart Notification System for ClockKo
// Intelligent break suggestions, task deadline alerts, and focus interruption detection

import toast from 'react-hot-toast';

interface WorkPattern {
  focusSessionCount: number;
  averageSessionLength: number; // in minutes
  totalWorkTime: number; // in minutes
  breakFrequency: number; // breaks per hour
  lastBreakTime: number; // timestamp
  productivityScore: number; // 0-100
}

interface TaskDeadline {
  taskId: string;
  title: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  estimatedTimeLeft: number; // in minutes
}

interface NotificationPreferences {
  breakReminders: boolean;
  taskDeadlines: boolean;
  focusInterruptions: boolean;
  productivityInsights: boolean;
  sound: boolean;
  frequency: 'low' | 'normal' | 'high';
}

class SmartNotificationService {
  private workPattern: WorkPattern = {
    focusSessionCount: 0,
    averageSessionLength: 25,
    totalWorkTime: 0,
    breakFrequency: 0,
    lastBreakTime: 0,
    productivityScore: 0
  };

  private preferences: NotificationPreferences = {
    breakReminders: true,
    taskDeadlines: true,
    focusInterruptions: true,
    productivityInsights: true,
    sound: true,
    frequency: 'normal'
  };

  private notificationQueue: Array<{ id: string; type: string; scheduled: number }> = [];
  private focusStartTime: number = 0;
  private isMonitoring: boolean = false;

  constructor() {
    this.loadPreferences();
    this.loadWorkPattern();
    this.requestNotificationPermission();
  }

  // === BREAK REMINDERS ===
  
  startFocusSession(plannedDuration: number) {
    this.focusStartTime = Date.now();
    this.isMonitoring = true;
    
    // Schedule intelligent break reminder
    const breakReminderTime = this.calculateOptimalBreakTime(plannedDuration);
    this.scheduleBreakReminder(breakReminderTime);
    
    // Monitor for focus interruptions
    this.startFocusInterruptionDetection();
    
    // Update work pattern
    this.updateWorkPattern('session_start', plannedDuration);
  }

  private calculateOptimalBreakTime(plannedDuration: number): number {
    const { averageSessionLength, breakFrequency, lastBreakTime } = this.workPattern;
    
    // Base calculation on user's historical patterns
    let optimalBreakTime = Math.min(plannedDuration * 0.8, averageSessionLength * 0.9);
    
    // Adjust based on time since last break
    const timeSinceLastBreak = (Date.now() - lastBreakTime) / (1000 * 60); // minutes
    if (timeSinceLastBreak > 120) { // More than 2 hours
      optimalBreakTime = Math.min(optimalBreakTime, 20); // Suggest break sooner
    }
    
    // Adjust based on time of day (user tends to need more breaks in afternoon)
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 16) { // 2-4 PM
      optimalBreakTime *= 0.8;
    }
    
    return Math.max(optimalBreakTime, 5); // Minimum 5 minutes before suggesting break
  }

  private scheduleBreakReminder(minutes: number) {
    const delay = minutes * 60 * 1000; // Convert to milliseconds
    
    setTimeout(() => {
      if (this.isMonitoring && this.preferences.breakReminders) {
        this.showBreakReminder();
      }
    }, delay);
  }

  private showBreakReminder() {
    const messages = [
      "🧠 Your brain could use a break! Time to recharge?",
      "☕ Perfect time for a coffee break and some fresh air",
      "🚶‍♂️ Take a 5-minute walk to boost your creativity",
      "👀 Give your eyes a rest - look at something 20 feet away",
      "🧘‍♀️ Quick breathing exercise to reset your focus?"
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Enhanced toast with longer duration and better UX
    toast(message, {
      duration: 12000, // 12 seconds - plenty of time to read
      icon: '🔔',
      style: {
        background: '#10b981',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '420px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer', // Visual hint that it's clickable
      },
      position: 'top-right',
    });

    // Show browser notification if available
    if (this.preferences.sound && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('ClockKo - Break Time!', {
        body: message,
        icon: '/favicon.ico',
        tag: 'break-reminder'
      });
    }
  }

  // === TASK DEADLINE ALERTS ===
  
  monitorTaskDeadlines(tasks: TaskDeadline[]) {
    if (!this.preferences.taskDeadlines) return;

    tasks.forEach(task => {
      const timeToDeadline = task.deadline.getTime() - Date.now();
      const hoursToDeadline = timeToDeadline / (1000 * 60 * 60);
      
      // Alert at different intervals based on priority
      let alertThresholds: number[] = [];
      
      switch (task.priority) {
        case 'high':
          alertThresholds = [24, 12, 6, 2, 1]; // hours
          break;
        case 'medium':
          alertThresholds = [48, 24, 12, 4]; // hours
          break;
        case 'low':
          alertThresholds = [72, 24, 12]; // hours
          break;
      }
      
      alertThresholds.forEach(threshold => {
        if (hoursToDeadline <= threshold && hoursToDeadline > threshold - 1) {
          this.showTaskDeadlineAlert(task, hoursToDeadline);
        }
      });
    });
  }

  private showTaskDeadlineAlert(task: TaskDeadline, hoursLeft: number) {
    const urgencyEmoji = task.priority === 'high' ? '🚨' : task.priority === 'medium' ? '⏰' : '📅';
    const timeText = hoursLeft < 1 ? 'less than an hour' : `${Math.ceil(hoursLeft)} hours`;
    
    toast(`${urgencyEmoji} "${task.title}" is due in ${timeText}!`, {
      duration: 15000, // 15 seconds for important deadlines
      style: {
        background: task.priority === 'high' ? '#ef4444' : '#f59e0b',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        maxWidth: '450px',
        boxShadow: task.priority === 'high' 
          ? '0 10px 25px rgba(239, 68, 68, 0.3)' 
          : '0 10px 25px rgba(245, 158, 11, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
      },
      position: 'top-right',
    });
  }

  // === FOCUS INTERRUPTION DETECTION ===
  
  private startFocusInterruptionDetection() {
    if (!this.preferences.focusInterruptions) return;

    // Monitor tab visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Monitor mouse/keyboard activity (simplified version)
    this.startActivityMonitoring();
  }

  private handleVisibilityChange() {
    if (document.hidden && this.isMonitoring) {
      // User switched tabs/apps during focus session
      setTimeout(() => {
        if (document.hidden) {
          toast('👀 Noticed you switched tabs. Stay focused on your goals!', {
            duration: 10000, // 10 seconds to read
            icon: '🎯',
            style: { 
              background: '#6366f1', 
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '400px',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            },
            position: 'top-right',
          });
        }
      }, 30000); // Alert after 30 seconds of being away
    }
  }

  private startActivityMonitoring() {
    let lastActivity = Date.now();
    let inactivityWarningShown = false;

    const resetActivity = () => {
      lastActivity = Date.now();
      inactivityWarningShown = false;
    };

    // Simple activity detection
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetActivity, true);
    });

    // Check for inactivity every minute
    setInterval(() => {
      if (this.isMonitoring) {
        const inactiveTime = Date.now() - lastActivity;
        const inactiveMinutes = inactiveTime / (1000 * 60);

        if (inactiveMinutes > 5 && !inactivityWarningShown) {
          toast('⚡ Still there? You\'ve been inactive for a while', {
            duration: 5000,
            style: { background: '#8b5cf6', color: 'white' }
          });
          inactivityWarningShown = true;
        }
      }
    }, 60000);
  }

  // === PRODUCTIVITY INSIGHTS ===
  
  endFocusSession(actualDuration: number, plannedDuration: number) {
    this.isMonitoring = false;
    
    // Calculate session effectiveness
    const effectiveness = Math.min((actualDuration / plannedDuration) * 100, 100);
    
    // Update work pattern
    this.updateWorkPattern('session_end', actualDuration, effectiveness);
    
    // Show productivity insight
    if (this.preferences.productivityInsights) {
      this.showProductivityInsight(effectiveness, actualDuration);
    }
  }

  private showProductivityInsight(effectiveness: number, duration: number) {
    let message = '';
    let emoji = '';
    let color = '';

    if (effectiveness >= 90) {
      emoji = '🎉';
      message = `Amazing focus! ${duration} minutes of solid work.`;
      color = '#10b981';
    } else if (effectiveness >= 75) {
      emoji = '💪';
      message = `Great session! You completed ${Math.round(effectiveness)}% of your planned time.`;
      color = '#3b82f6';
    } else if (effectiveness >= 50) {
      emoji = '📈';
      message = `Good progress! Consider shorter sessions for better focus.`;
      color = '#f59e0b';
    } else {
      emoji = '🎯';
      message = `Every step counts! Try a 15-minute focus session next.`;
      color = '#6366f1';
    }

    setTimeout(() => {
      toast(`${emoji} ${message}`, {
        duration: 12000, // 12 seconds for insights
        style: { 
          background: color, 
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          maxWidth: '450px',
          boxShadow: `0 10px 25px ${color}33`, // 20% opacity shadow
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
        },
        position: 'top-right',
        icon: emoji,
      });
    }, 1000);
  }

  // === WORK PATTERN ANALYSIS ===
  
  private updateWorkPattern(event: 'session_start' | 'session_end', duration: number, effectiveness?: number) {
    if (event === 'session_start') {
      this.workPattern.focusSessionCount++;
    } else if (event === 'session_end' && effectiveness !== undefined) {
      // Update average session length
      const totalSessions = this.workPattern.focusSessionCount;
      this.workPattern.averageSessionLength = 
        ((this.workPattern.averageSessionLength * (totalSessions - 1)) + duration) / totalSessions;
      
      // Update total work time
      this.workPattern.totalWorkTime += duration;
      
      // Update productivity score (rolling average)
      this.workPattern.productivityScore = 
        ((this.workPattern.productivityScore * 0.8) + (effectiveness * 0.2));
    }
    
    this.saveWorkPattern();
  }

  // === PREFERENCES MANAGEMENT ===
  
  updatePreferences(newPreferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  getWorkPatternInsights() {
    return {
      ...this.workPattern,
      averageSessionText: `${Math.round(this.workPattern.averageSessionLength)} minutes`,
      productivityLevel: this.workPattern.productivityScore >= 80 ? 'High' : 
                        this.workPattern.productivityScore >= 60 ? 'Good' : 'Improving',
      recommendedBreakFrequency: Math.max(1, Math.round(this.workPattern.averageSessionLength / 25))
    };
  }

  // === PERSISTENCE ===
  
  private savePreferences() {
    localStorage.setItem('clockko_notification_preferences', JSON.stringify(this.preferences));
  }

  private loadPreferences() {
    const saved = localStorage.getItem('clockko_notification_preferences');
    if (saved) {
      this.preferences = { ...this.preferences, ...JSON.parse(saved) };
    }
  }

  private saveWorkPattern() {
    localStorage.setItem('clockko_work_pattern', JSON.stringify(this.workPattern));
  }

  private loadWorkPattern() {
    const saved = localStorage.getItem('clockko_work_pattern');
    if (saved) {
      this.workPattern = { ...this.workPattern, ...JSON.parse(saved) };
    }
  }

  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // === PUBLIC API ===
  
  startBreak() {
    this.workPattern.lastBreakTime = Date.now();
    this.saveWorkPattern();
  }

  getPreferences() {
    return { ...this.preferences };
  }

  // Clean up event listeners
  destroy() {
    this.isMonitoring = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Export singleton instance
export const smartNotificationService = new SmartNotificationService();

// Export types
export type { WorkPattern, TaskDeadline, NotificationPreferences };