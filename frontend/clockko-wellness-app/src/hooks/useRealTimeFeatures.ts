// React hooks for Smart Notifications and Cross-Device Sync
import { useEffect, useState, useCallback } from 'react';
import { smartNotificationService } from '../services/smartNotificationService';
import { crossDeviceSyncService } from '../services/crossDeviceSyncService';
import { soundService } from '../features/timeTracker/services/soundService';
import type { WorkPattern, NotificationPreferences } from '../services/smartNotificationService';
import type { DeviceInfo } from '../services/crossDeviceSyncService';

// === SMART NOTIFICATIONS HOOK ===

export function useSmartNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    smartNotificationService.getPreferences()
  );
  const [workPattern, setWorkPattern] = useState<WorkPattern & { 
    averageSessionText: string; 
    productivityLevel: string; 
    recommendedBreakFrequency: number;
  }>(smartNotificationService.getWorkPatternInsights());

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    // Update the service first
    smartNotificationService.updatePreferences(newPrefs);
    
    // If sound preference is being updated, sync it with soundService
    if ('sound' in newPrefs) {
      soundService.setEnabled(newPrefs.sound!);
      console.log('🔊 Sound notifications', newPrefs.sound ? 'enabled' : 'disabled');
    }
    
    // Update the state to trigger re-render
    const updatedPreferences = smartNotificationService.getPreferences();
    setPreferences(updatedPreferences);
    console.log('✅ Preferences updated:', updatedPreferences);
  }, []);

  const startFocusSession = useCallback((plannedDuration: number) => {
    smartNotificationService.startFocusSession(plannedDuration);
  }, []);

  const endFocusSession = useCallback((actualDuration: number, plannedDuration: number) => {
    smartNotificationService.endFocusSession(actualDuration, plannedDuration);
    
    // Update work pattern with real data from the dashboard
    updateWorkPatternFromAPI();
  }, []);

  // Function to fetch real session data and update work pattern
  const updateWorkPatternFromAPI = useCallback(async () => {
    try {
      // Import the dashboard API function
      const { fetchDashboardData } = await import('../pages/dashboard/api');
      const dashboardData = await fetchDashboardData();
      
      if (dashboardData && dashboardData.todaySummary) {
        const realFocusTime = dashboardData.todaySummary.duration || 0; // in seconds
        const realFocusTimeMinutes = Math.round(realFocusTime / 60); // convert to minutes
        
        // Get real session count from timetracker API
        const { timeTrackerService } = await import('../features/timeTracker/services/timetrackerservice');
        const dailySummary = await timeTrackerService.getDailySummary();
        
        const realSessionCount = dailySummary?.totalFocusSessions || 0;
        const avgSessionLength = realSessionCount > 0 ? Math.round(realFocusTimeMinutes / realSessionCount) : 25;
        
        // Get current work pattern to preserve missing fields
        const currentPattern = smartNotificationService.getWorkPatternInsights();
        
        // Update work pattern with real data
        const updatedPattern = {
          ...currentPattern,
          focusSessionCount: realSessionCount,
          averageSessionLength: avgSessionLength,
          totalWorkTime: realFocusTime,
          productivityScore: realSessionCount > 0 ? Math.min(100, Math.max(0, (realSessionCount * 15) + (avgSessionLength * 2))) : 0,
          averageSessionText: `${avgSessionLength} minutes`,
          productivityLevel: realSessionCount >= 3 ? 'High' : realSessionCount >= 1 ? 'Good' : 'Getting Started',
          recommendedBreakFrequency: Math.max(1, Math.round(avgSessionLength / 25))
        };
        
        console.log('📊 Updated work pattern with real data:', updatedPattern);
        setWorkPattern(updatedPattern);
      }
    } catch (error) {
      console.warn('Failed to update work pattern with real data:', error);
      // Fall back to smart notification service data
      setWorkPattern(smartNotificationService.getWorkPatternInsights());
    }
  }, []);

  // Load real data on initialization
  useEffect(() => {
    updateWorkPatternFromAPI();
    
    // Sync sound preference with soundService on initialization
    const currentSoundEnabled = soundService.getEnabled();
    
    // If preferences don't match, update the preferences to match soundService
    if (preferences.sound !== currentSoundEnabled) {
      updatePreferences({ sound: currentSoundEnabled });
    }
  }, [updateWorkPatternFromAPI, preferences.sound, updatePreferences]);

  const startBreak = useCallback(() => {
    smartNotificationService.startBreak();
  }, []);

  const monitorTaskDeadlines = useCallback((tasks: any[]) => {
    smartNotificationService.monitorTaskDeadlines(tasks);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      smartNotificationService.destroy();
    };
  }, []);

  return {
    preferences,
    workPattern,
    updatePreferences,
    startFocusSession,
    endFocusSession,
    startBreak,
    monitorTaskDeadlines,
    updateWorkPatternFromAPI
  };
}

// === CROSS-DEVICE SYNC HOOK ===

export function useCrossDeviceSync(userId?: string) {
  const [syncStatus, setSyncStatus] = useState(crossDeviceSyncService.getSyncStatus());
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Initialize sync service when userId is available
  useEffect(() => {
    if (userId) {
      try {
        crossDeviceSyncService.initialize(userId);
        updateSyncStatus();
        updateDevices();
        updateMetrics();
      } catch (error) {
        console.warn('Failed to initialize cross-device sync:', error);
      }
    }
  }, [userId]);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateSyncStatus();
      updateMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateSyncStatus = useCallback(() => {
    setSyncStatus(crossDeviceSyncService.getSyncStatus());
  }, []);

  const updateDevices = useCallback(() => {
    setDevices(crossDeviceSyncService.getStoredDevices());
  }, []);

  const updateMetrics = useCallback(() => {
    try {
      setMetrics(crossDeviceSyncService.getProductivityMetrics());
    } catch (error) {
      console.warn('Failed to update productivity metrics:', error);
      setMetrics({
        today: { sessions: 0, totalTime: 0, avgSessionLength: 0 },
        week: { sessions: 0, totalTime: 0, avgSessionLength: 0 },
        productivity: { score: 0, trend: 'stable' }
      });
    }
  }, []);

  const syncData = useCallback((dataType: string, data: any) => {
    crossDeviceSyncService.sync(dataType as any, data);
    updateSyncStatus();
    updateMetrics();
  }, []);

  const saveSessionState = useCallback((sessionData: any) => {
    crossDeviceSyncService.saveSessionState(sessionData);
    updateSyncStatus();
  }, []);

  const getActiveSessionFromOtherDevice = useCallback(() => {
    return crossDeviceSyncService.getActiveSessionFromOtherDevice();
  }, []);

  const clearActiveSession = useCallback(() => {
    crossDeviceSyncService.clearActiveSession();
  }, []);

  const exportData = useCallback(() => {
    return crossDeviceSyncService.exportData();
  }, []);

  const importData = useCallback((jsonData: string) => {
    const success = crossDeviceSyncService.importData(jsonData);
    if (success) {
      updateSyncStatus();
      updateDevices();
      updateMetrics();
    }
    return success;
  }, []);

  const restoreFromBackup = useCallback((backupIndex: number = 0) => {
    const success = crossDeviceSyncService.restoreFromBackup(backupIndex);
    if (success) {
      updateSyncStatus();
      updateMetrics();
    }
    return success;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      crossDeviceSyncService.destroy();
    };
  }, []);

  return {
    syncStatus,
    devices,
    metrics,
    syncData,
    saveSessionState,
    getActiveSessionFromOtherDevice,
    clearActiveSession,
    exportData,
    importData,
    restoreFromBackup,
    updateMetrics
  };
}

// === COMBINED REAL-TIME HOOK ===

export function useRealTimeFeatures(userId?: string) {
  const smartNotifications = useSmartNotifications();
  const crossDeviceSync = useCrossDeviceSync(userId);

  // Enhanced session management that combines both services
  const startEnhancedFocusSession = useCallback((sessionData: any) => {
    const { plannedDuration } = sessionData;
    
    // Start smart notifications
    smartNotifications.startFocusSession(plannedDuration);
    
    // Save session state for cross-device sync
    crossDeviceSync.saveSessionState(sessionData);
    
    console.log('🚀 Enhanced focus session started with smart features');
  }, [smartNotifications, crossDeviceSync]);

  const endEnhancedFocusSession = useCallback((sessionData: any) => {
    const { actualDuration, plannedDuration } = sessionData;
    
    // End smart notifications (triggers insights)
    smartNotifications.endFocusSession(actualDuration, plannedDuration);
    
    // Sync final session data
    crossDeviceSync.syncData('sessions', sessionData);
    
    // Clear active session
    crossDeviceSync.clearActiveSession();
    
    console.log('✅ Enhanced focus session completed');
  }, [smartNotifications, crossDeviceSync]);

  const startEnhancedBreak = useCallback(() => {
    // Notify smart notification service
    smartNotifications.startBreak();
    
    console.log('☕ Break started with smart tracking');
  }, [smartNotifications]);

  // Check for session continuation from other devices
  const checkForSessionContinuation = useCallback(() => {
    const activeSession = crossDeviceSync.getActiveSessionFromOtherDevice();
    
    if (activeSession) {
      console.log('📱 Found active session from another device:', activeSession);
      return activeSession;
    }
    
    return null;
  }, [crossDeviceSync]);

  return {
    // Smart Notifications
    ...smartNotifications,
    
    // Cross-Device Sync
    ...crossDeviceSync,
    
    // Enhanced Combined Features
    startEnhancedFocusSession,
    endEnhancedFocusSession,
    startEnhancedBreak,
    checkForSessionContinuation
  };
}

// === PRODUCTIVITY INSIGHTS HOOK ===

export function useProductivityInsights(_userId?: string) {
  const { workPattern } = useSmartNotifications();
  const [insights, setInsights] = useState<any>(null);

  const refreshInsights = useCallback(async () => {
    try {
      console.log('🔄 Refreshing productivity insights with real data...');
      
      // Get real data from dashboard and timetracker APIs
      const { fetchDashboardData } = await import('../pages/dashboard/api');
      const { timeTrackerService } = await import('../features/timeTracker/services/timetrackerservice');
      
      const [dashboardData, dailySummary] = await Promise.all([
        fetchDashboardData(),
        timeTrackerService.getDailySummary()
      ]);
      
      if (dashboardData && dailySummary) {
        const realFocusTime = dashboardData.todaySummary?.duration || 0; // in seconds
        const realFocusTimeMinutes = Math.round(realFocusTime / 60); // convert to minutes
        const realSessionCount = dailySummary.totalFocusSessions || 0;
        const avgSessionLength = realSessionCount > 0 ? Math.round(realFocusTimeMinutes / realSessionCount) : 0;
        
        const combinedInsights = {
          // Today's real metrics
          today: {
            sessionsCompleted: realSessionCount,
            totalFocusTime: realFocusTimeMinutes,
            averageSessionLength: avgSessionLength
          },
          
          // Weekly trends (simplified for now - could be enhanced with more API calls)
          weeklyTrend: {
            totalSessions: realSessionCount, // Today's sessions as placeholder
            totalHours: realFocusTimeMinutes / 60, // Keep as number so component can call toFixed
            mostProductiveDay: 'Today'
          },
          
          // Work patterns from real data
          patterns: {
            averageSessionLength: avgSessionLength,
            productivityLevel: realSessionCount >= 3 ? 'High' : realSessionCount >= 1 ? 'Good' : 'Getting Started',
            recommendedBreakFrequency: Math.max(1, Math.round(avgSessionLength / 25)),
            focusSessionCount: realSessionCount
          },
          
          // Recommendations based on real data
          recommendations: generateRecommendations({
            averageSessionLength: avgSessionLength,
            focusSessionCount: realSessionCount,
            productivityScore: realSessionCount > 0 ? Math.min(100, (realSessionCount * 20) + (avgSessionLength * 2)) : 0
          }, {
            today: { sessionsCompleted: realSessionCount }
          })
        };
        
        console.log('📊 Real productivity insights:', combinedInsights);
        setInsights(combinedInsights);
      }
    } catch (error) {
      console.warn('Failed to refresh real productivity insights:', error);
      
      // Fallback to mock data
      setInsights({
        today: {
          sessionsCompleted: 0,
          totalFocusTime: 0,
          averageSessionLength: 0
        },
        weeklyTrend: {
          totalSessions: 0,
          totalHours: 0.0, // Keep as number, not string
          mostProductiveDay: 'None yet'
        },
        patterns: {
          averageSessionLength: 0,
          productivityLevel: 'Getting Started',
          recommendedBreakFrequency: 1,
          focusSessionCount: 0
        },
        recommendations: ['🚀 Start your first focus session to see insights!']
      });
    }
  }, []);

  // Load real insights on initialization and when workPattern changes
  useEffect(() => {
    refreshInsights();
  }, [refreshInsights, workPattern]);

  return {
    insights,
    refreshInsights
  };
}

// Helper function to generate productivity recommendations
function generateRecommendations(workPattern: any, metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (workPattern.averageSessionLength < 15) {
    recommendations.push("💡 Try longer focus sessions (20-25 minutes) for deeper work");
  }
  
  if (workPattern.averageSessionLength > 45) {
    recommendations.push("🧠 Consider shorter sessions to maintain focus quality");
  }
  
  if (workPattern.productivityScore < 60) {
    recommendations.push("🎯 Start with 15-minute sessions to build momentum");
  }
  
  if (metrics?.today?.sessionsCompleted === 0) {
    recommendations.push("🚀 Start your first focus session of the day!");
  }
  
  if (workPattern.focusSessionCount > 5 && workPattern.productivityScore > 80) {
    recommendations.push("🔥 You're on fire! Keep this momentum going");
  }
  
  return recommendations;
}