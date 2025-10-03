// Cross-Device Sync Service for ClockKo
// Synchronizes data across devices using localStorage with backup/restore capabilities
// Ready for backend integration when available

interface SyncData {
  userId: string;
  lastSync: number;
  version: number;
  data: {
    sessions: any[];
    tasks: any[];
    preferences: any;
    workPatterns: any;
    dailySummaries: any;
  };
}

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  lastSeen: number;
  userAgent: string;
}

class CrossDeviceSyncService {
  private userId: string = '';
  private deviceId: string = '';
  private syncInterval: number | null = null;
  private isOnline: boolean = navigator.onLine;
  private pendingChanges: Set<string> = new Set();

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.setupOnlineListener();
    this.setupBeforeUnloadListener();
  }

  // === INITIALIZATION ===
  
  initialize(userId: string) {
    this.userId = userId;
    this.loadFromBackup();
    this.startPeriodicSync();
    this.registerDevice();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('clockko_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('clockko_device_id', deviceId);
    }
    return deviceId;
  }

  private registerDevice() {
    const deviceInfo: DeviceInfo = {
      deviceId: this.deviceId,
      deviceName: this.getDeviceName(),
      lastSeen: Date.now(),
      userAgent: navigator.userAgent
    };

    const devices = this.getStoredDevices();
    const existingIndex = devices.findIndex(d => d.deviceId === this.deviceId);
    
    if (existingIndex >= 0) {
      devices[existingIndex] = deviceInfo;
    } else {
      devices.push(deviceInfo);
    }

    localStorage.setItem(`clockko_devices_${this.userId}`, JSON.stringify(devices));
  }

  private getDeviceName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Mobile') || ua.includes('Android')) {
      return `📱 Mobile Device`;
    } else if (ua.includes('Tablet') || ua.includes('iPad')) {
      return `📟 Tablet`;
    } else if (ua.includes('Mac')) {
      return `💻 Mac`;
    } else if (ua.includes('Windows')) {
      return `🖥️ Windows PC`;
    } else {
      return `💻 Desktop`;
    }
  }

  // === LIVE DATA SYNCHRONIZATION ===
  
  sync(dataType: keyof SyncData['data'], newData: any) {
    if (!this.userId) {
      console.warn('⚠️ Cannot sync: User not initialized');
      return;
    }

    // Update local storage immediately
    this.updateLocalData(dataType, newData);
    
    // Mark as pending change for next sync
    this.pendingChanges.add(dataType);
    
    // Create backup
    this.createLocalBackup();
    
    // If online, attempt immediate sync to "cloud" (localStorage simulation)
    if (this.isOnline) {
      this.performSync();
    }

    console.log(`📊 Synced ${dataType} locally, pending cloud sync`);
  }

  private updateLocalData(dataType: keyof SyncData['data'], newData: any) {
    const storageKey = `clockko_${dataType}_${this.userId}`;
    localStorage.setItem(storageKey, JSON.stringify(newData));
  }

  private performSync() {
    if (this.pendingChanges.size === 0) return;

    const syncData = this.prepareSyncData();
    
    // Simulate cloud sync with localStorage (replace with actual API when backend is ready)
    this.syncToCloud(syncData);
    
    // Clear pending changes
    this.pendingChanges.clear();
    
    console.log('☁️ Data synced to cloud storage');
  }

  private prepareSyncData(): SyncData {
    const sessionsData = this.getLocalData('sessions');
    const tasksData = this.getLocalData('tasks');
    const preferencesData = this.getLocalData('preferences');
    const workPatternsData = this.getLocalData('workPatterns');
    const dailySummariesData = this.getLocalData('dailySummaries');

    const data: SyncData['data'] = {
      sessions: Array.isArray(sessionsData) ? sessionsData : [],
      tasks: Array.isArray(tasksData) ? tasksData : [],
      preferences: preferencesData && typeof preferencesData === 'object' ? preferencesData : {},
      workPatterns: workPatternsData && typeof workPatternsData === 'object' ? workPatternsData : {},
      dailySummaries: dailySummariesData && typeof dailySummariesData === 'object' ? dailySummariesData : {}
    };

    return {
      userId: this.userId,
      lastSync: Date.now(),
      version: 1,
      data
    };
  }

  private getLocalData(dataType: keyof SyncData['data']): any {
    const storageKey = `clockko_${dataType}_${this.userId}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  // === CLOUD SYNC SIMULATION (Replace with real API) ===
  
  private syncToCloud(syncData: SyncData) {
    // Simulate cloud storage with localStorage
    // In production, this will be replaced with actual API calls
    const cloudKey = `clockko_cloud_${this.userId}`;
    
    // Get existing cloud data
    const existingCloud = localStorage.getItem(cloudKey);
    const existingData: SyncData | null = existingCloud ? JSON.parse(existingCloud) : null;
    
    // Merge data (simple last-write-wins for now, can be more sophisticated)
    const mergedData = this.mergeData(existingData, syncData);
    
    // Save to "cloud"
    localStorage.setItem(cloudKey, JSON.stringify(mergedData));
    
    // Update last sync time
    localStorage.setItem(`clockko_last_sync_${this.userId}`, Date.now().toString());
  }

  private mergeData(existing: SyncData | null, incoming: SyncData): SyncData {
    if (!existing) return incoming;
    
    // For now, use simple last-write-wins
    // In production, implement proper conflict resolution
    return incoming.lastSync > existing.lastSync ? incoming : existing;
  }

  // === LIVE BACKUP & RESTORE ===
  
  private createLocalBackup() {
    const backupData = {
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: {
        sessions: this.getLocalData('sessions'),
        tasks: this.getLocalData('tasks'),
        preferences: this.getLocalData('preferences'),
        workPatterns: this.getLocalData('workPatterns'),
        dailySummaries: this.getLocalData('dailySummaries')
      }
    };

    // Keep last 10 backups
    const backups = this.getLocalBackups();
    backups.push(backupData);
    
    if (backups.length > 10) {
      backups.shift(); // Remove oldest backup
    }

    localStorage.setItem(`clockko_backups_${this.userId}`, JSON.stringify(backups));
  }

  private getLocalBackups(): any[] {
    const stored = localStorage.getItem(`clockko_backups_${this.userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  restoreFromBackup(backupIndex: number = 0): boolean {
    const backups = this.getLocalBackups();
    
    if (backups.length === 0) {
      console.warn('⚠️ No backups available');
      return false;
    }

    const backup = backups[backups.length - 1 - backupIndex]; // Most recent first
    
    if (!backup) {
      console.warn('⚠️ Backup not found');
      return false;
    }

    // Restore data
    Object.entries(backup.data).forEach(([dataType, data]) => {
      if (data) {
        this.updateLocalData(dataType as keyof SyncData['data'], data);
      }
    });

    console.log(`✅ Restored from backup (${new Date(backup.timestamp).toLocaleString()})`);
    return true;
  }

  // === CROSS-DEVICE CONTINUATION ===
  
  saveSessionState(sessionData: any) {
    const sessionState = {
      ...sessionData,
      deviceId: this.deviceId,
      lastUpdate: Date.now()
    };

    this.sync('sessions', [sessionState]);
    
    // Also save as "active session" for cross-device pickup
    localStorage.setItem(`clockko_active_session_${this.userId}`, JSON.stringify(sessionState));
  }

  getActiveSessionFromOtherDevice(): any | null {
    const activeSession = localStorage.getItem(`clockko_active_session_${this.userId}`);
    
    if (!activeSession) return null;
    
    const session = JSON.parse(activeSession);
    
    // Check if session is from another device and still recent
    if (session.deviceId !== this.deviceId && 
        (Date.now() - session.lastUpdate) < 5 * 60 * 1000) { // 5 minutes
      return session;
    }
    
    return null;
  }

  clearActiveSession() {
    localStorage.removeItem(`clockko_active_session_${this.userId}`);
  }

  // === REAL-TIME ANALYTICS ===
  
  getProductivityMetrics(): any {
    const sessionsData = this.getLocalData('sessions');
    const sessions = Array.isArray(sessionsData) ? sessionsData : [];
    const today = new Date().toISOString().split('T')[0];
    
    const todaySessions = sessions.filter((s: any) => 
      s && s.date && s.date.startsWith(today)
    );

    const thisWeek = sessions.filter((s: any) => {
      if (!s || !s.date) return false;
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    return {
      today: {
        sessionsCompleted: todaySessions.length,
        totalFocusTime: todaySessions.reduce((acc: number, s: any) => acc + (s.actualDuration || 0), 0),
        averageSessionLength: todaySessions.length ? 
          todaySessions.reduce((acc: number, s: any) => acc + (s.actualDuration || 0), 0) / todaySessions.length : 0
      },
      thisWeek: {
        totalSessions: thisWeek.length,
        totalHours: thisWeek.reduce((acc: number, s: any) => acc + (s.actualDuration || 0), 0) / 60,
        mostProductiveDay: this.getMostProductiveDay(thisWeek)
      },
      devices: this.getStoredDevices(),
      lastSync: this.getLastSyncTime()
    };
  }

  private getMostProductiveDay(sessions: any[]): string {
    const dayTotals: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const day = new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayTotals[day] = (dayTotals[day] || 0) + (session.actualDuration || 0);
    });

    let maxDay = '';
    let maxTime = 0;
    
    Object.entries(dayTotals).forEach(([day, time]) => {
      if (time > maxTime) {
        maxDay = day;
        maxTime = time;
      }
    });

    return maxDay || 'No data';
  }

  // === DEVICE MANAGEMENT ===
  
  getStoredDevices(): DeviceInfo[] {
    const stored = localStorage.getItem(`clockko_devices_${this.userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  getCurrentDevice(): DeviceInfo {
    return {
      deviceId: this.deviceId,
      deviceName: this.getDeviceName(),
      lastSeen: Date.now(),
      userAgent: navigator.userAgent
    };
  }

  getLastSyncTime(): string {
    const lastSync = localStorage.getItem(`clockko_last_sync_${this.userId}`);
    if (!lastSync) return 'Never';
    
    const date = new Date(parseInt(lastSync));
    return date.toLocaleString();
  }

  // === PERIODIC SYNC ===
  
  private startPeriodicSync() {
    // Sync every 2 minutes when online
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && this.pendingChanges.size > 0) {
        this.performSync();
      }
    }, 2 * 60 * 1000);
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // === NETWORK STATUS ===
  
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - resuming sync');
      if (this.pendingChanges.size > 0) {
        this.performSync();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📵 Offline - data will sync when connection returns');
    });
  }

  private setupBeforeUnloadListener() {
    window.addEventListener('beforeunload', () => {
      // Final sync before page unload
      if (this.isOnline && this.pendingChanges.size > 0) {
        this.performSync();
      }
    });
  }

  // === DATA EXPORT/IMPORT ===
  
  exportData(): string {
    const exportData = {
      timestamp: Date.now(),
      deviceId: this.deviceId,
      userId: this.userId,
      data: this.prepareSyncData()
    };

    return JSON.stringify(exportData, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.data || !importData.userId) {
        throw new Error('Invalid data format');
      }

      // Import data
      Object.entries(importData.data.data).forEach(([dataType, data]) => {
        if (data) {
          this.updateLocalData(dataType as keyof SyncData['data'], data);
        }
      });

      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      return false;
    }
  }

  // === CLEANUP ===
  
  destroy() {
    this.stopPeriodicSync();
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
    window.removeEventListener('beforeunload', () => {});
  }

  // === PUBLIC STATUS ===
  
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingChanges: this.pendingChanges.size,
      lastSync: this.getLastSyncTime(),
      deviceId: this.deviceId,
      deviceName: this.getDeviceName()
    };
  }

  // === HELPER METHODS ===
  
  private loadFromBackup() {
    // Try to restore from latest backup if no data exists
    if (!this.getLocalData('sessions')) {
      this.restoreFromBackup();
    }
  }
}

// Export singleton instance
export const crossDeviceSyncService = new CrossDeviceSyncService();

// Export types
export type { SyncData, DeviceInfo };