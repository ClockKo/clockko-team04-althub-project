// React hooks for Smart Notifications and Cross-Device Sync
import { useEffect, useState, useCallback } from 'react';
import { smartNotificationService } from '../services/smartNotificationService';
import { crossDeviceSyncService } from '../services/crossDeviceSyncService';
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
    smartNotificationService.updatePreferences(newPrefs);
    setPreferences(smartNotificationService.getPreferences());
  }, []);

  const startFocusSession = useCallback((plannedDuration: number) => {
    smartNotificationService.startFocusSession(plannedDuration);
  }, []);

  const endFocusSession = useCallback((actualDuration: number, plannedDuration: number) => {
    smartNotificationService.endFocusSession(actualDuration, plannedDuration);
    setWorkPattern(smartNotificationService.getWorkPatternInsights());
  }, []);

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
    monitorTaskDeadlines
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

export function useProductivityInsights(userId?: string) {
  const { metrics, updateMetrics } = useCrossDeviceSync(userId);
  const { workPattern } = useSmartNotifications();
  
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (metrics && workPattern) {
      const combinedInsights = {
        // Today's metrics
        today: metrics.today,
        
        // Weekly trends
        weeklyTrend: metrics.thisWeek,
        
        // Work patterns
        patterns: {
          averageSessionLength: workPattern.averageSessionLength,
          productivityLevel: workPattern.productivityLevel,
          recommendedBreakFrequency: workPattern.recommendedBreakFrequency,
          focusSessionCount: workPattern.focusSessionCount
        },
        
        // Device usage
        devices: metrics.devices,
        
        // Sync status
        lastSync: metrics.lastSync,
        
        // Recommendations
        recommendations: generateRecommendations(workPattern, metrics)
      };
      
      setInsights(combinedInsights);
    }
  }, [metrics, workPattern]);

  return {
    insights,
    refreshInsights: updateMetrics
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