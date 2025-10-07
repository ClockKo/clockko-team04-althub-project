import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Smartphone, BarChart3, Settings, Download, Upload, Archive } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { useRealTimeFeatures, useProductivityInsights } from '../../hooks/useRealTimeFeatures';
import { useAuth } from '../auth/authcontext';

interface RealTimeFeaturesProps {
  onClose?: () => void;
}

export default function RealTimeFeaturesPanel({ onClose }: RealTimeFeaturesProps) {
  const { authToken } = useAuth(); // Get auth token instead of user
  const userId = authToken ? 'current-user' : undefined; // Use a placeholder until we have proper user ID
  const realTimeFeatures = useRealTimeFeatures(userId);
  const { insights, refreshInsights } = useProductivityInsights(userId);
  const [activeTab, setActiveTab] = useState<'notifications' | 'sync' | 'insights'>('notifications');

  const handlePreferenceChange = (key: string, value: boolean) => {
    console.log('🔧 Toggle changed:', key, 'to', value);
    realTimeFeatures.updatePreferences({ [key]: value });
  };

  const handleExportData = () => {
    const data = realTimeFeatures.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clockko-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const success = realTimeFeatures.importData(data);
        if (success) {
          refreshInsights();
          alert('Data imported successfully!');
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Features</h2>
          <p className="text-gray-600">Smart notifications and cross-device synchronization</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'notifications', label: 'Smart Notifications', icon: Bell },
          { id: 'sync', label: 'Device Sync', icon: Smartphone },
          { id: 'insights', label: 'Analytics', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Smart Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'breakReminders', label: 'Break Reminders', desc: 'Get intelligent break suggestions based on your work patterns' },
                { key: 'taskDeadlines', label: 'Task Deadline Alerts', desc: 'Receive notifications when deadlines are approaching' },
                { key: 'focusInterruptions', label: 'Focus Protection', desc: 'Get alerts when you switch tabs or become inactive' },
                { key: 'productivityInsights', label: 'Productivity Insights', desc: 'Receive real-time feedback on your work sessions' },
                { key: 'sound', label: 'Sound Notifications', desc: 'Enable audio alerts for notifications' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{label}</h4>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                  <Switch
                    checked={Boolean(realTimeFeatures.preferences[key as keyof typeof realTimeFeatures.preferences])}
                    onCheckedChange={(checked) => handlePreferenceChange(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Pattern Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Work Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {realTimeFeatures.workPattern.focusSessionCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {realTimeFeatures.workPattern.averageSessionText}
                  </div>
                  <div className="text-sm text-gray-600">Avg Session</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {realTimeFeatures.workPattern.productivityLevel}
                  </div>
                  <div className="text-sm text-gray-600">Productivity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Device Sync Tab */}
      {activeTab === 'sync' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${realTimeFeatures.syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-medium">Connection</div>
                    <div className="text-sm text-gray-600">
                      {realTimeFeatures.syncStatus.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${realTimeFeatures.syncStatus.pendingChanges === 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <div className="font-medium">Pending Changes</div>
                    <div className="text-sm text-gray-600">
                      {realTimeFeatures.syncStatus.pendingChanges} items
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <div className="font-medium">Last Sync</div>
                    <div className="text-sm text-gray-600">
                      {realTimeFeatures.syncStatus.lastSync}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeFeatures.devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      device.deviceId === realTimeFeatures.syncStatus.deviceId
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{device.deviceName.charAt(0)}</div>
                      <div>
                        <div className="font-medium">{device.deviceName}</div>
                        <div className="text-sm text-gray-600">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {device.deviceId === realTimeFeatures.syncStatus.deviceId && (
                      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                        Current
                      </span>
                    )}
                  </div>
                ))}
                
                {realTimeFeatures.devices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No devices found. Sign in on other devices to see them here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </Button>
                
                <label className="cursor-pointer">
                  <Button variant="outline" className="flex items-center space-x-2 w-full">
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                
                <Button
                  onClick={() => realTimeFeatures.restoreFromBackup()}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Archive className="w-4 h-4" />
                  <span>Restore Backup</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {insights ? (
            <>
              {/* Today's Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Today's Performance</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={refreshInsights}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {insights.today.sessionsCompleted}
                      </div>
                      <div className="text-sm text-gray-600">Sessions Completed</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(insights.today.totalFocusTime)} min
                      </div>
                      <div className="text-sm text-gray-600">Total Focus Time</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round(insights.today.averageSessionLength)} min
                      </div>
                      <div className="text-sm text-gray-600">Avg Session Length</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="text-lg">💡</div>
                          <div className="text-sm text-gray-700">{rec}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">This Week</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Sessions:</span>
                          <span className="font-medium">{insights.weeklyTrend.totalSessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Hours:</span>
                          <span className="font-medium">{insights.weeklyTrend.totalHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Most Productive Day:</span>
                          <span className="font-medium">{insights.weeklyTrend.mostProductiveDay}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Work Patterns</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Productivity Level:</span>
                          <span className="font-medium">{insights.patterns.productivityLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Session:</span>
                          <span className="font-medium">{insights.patterns.averageSessionLength} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Break Frequency:</span>
                          <span className="font-medium">Every {insights.patterns.recommendedBreakFrequency} sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
                <p className="text-gray-600">Complete some focus sessions to see your analytics.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}