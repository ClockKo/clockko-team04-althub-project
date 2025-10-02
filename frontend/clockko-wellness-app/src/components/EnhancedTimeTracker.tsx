// Example: Adding Real-Time Features to Your Existing TimeTracker
import React, { useEffect, useState } from 'react';
import { useRealTimeFeatures } from '../hooks/useRealTimeFeatures';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';

interface EnhancedTimeTrackerProps {
  userId: string;
}

export const EnhancedTimeTracker: React.FC<EnhancedTimeTrackerProps> = ({ userId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const realTimeFeatures = useRealTimeFeatures(userId);

  // Check for cross-device sessions on startup
  useEffect(() => {
    const activeSession = realTimeFeatures.checkForSessionContinuation();
    if (activeSession) {
      const shouldContinue = window.confirm(
        `Found an active session from ${activeSession.deviceName}. Continue?`
      );
      if (shouldContinue) {
        setIsTracking(true);
        setSessionTime(activeSession.elapsedTime);
        toast.success('📱 Continuing session from other device');
      }
    }
  }, [realTimeFeatures]);

  // Start tracking with smart features
  const startTracking = () => {
    setIsTracking(true);
    setSessionTime(0);
    
    // Your existing tracking logic here
    
    // Add smart features
    realTimeFeatures.startEnhancedFocusSession({
      taskType: 'work',
      plannedDuration: 25 * 60, // 25 minutes
      startTime: new Date()
    });
    
    toast.success('🎯 Smart focus session started!');
  };

  // Stop tracking with smart features
  const stopTracking = () => {
    setIsTracking(false);
    
    // Your existing stop logic here
    
    // Add smart features
    const sessionData = {
      duration: sessionTime,
      endTime: new Date(),
      productivity: calculateProductivity(sessionTime)
    };
    
    realTimeFeatures.endEnhancedFocusSession(sessionData);
    
    toast.success('✅ Session completed and synced!');
  };

  // Simple productivity calculation
  const calculateProductivity = (duration: number) => {
    // Your logic here - this is just an example
    return duration > 1500 ? 'high' : duration > 600 ? 'medium' : 'low';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">⏰ Enhanced Time Tracker</h2>
      
      {/* Display current session time */}
      <div className="text-4xl font-mono mb-6 text-center">
        {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-4 justify-center">
        {!isTracking ? (
          <Button onClick={startTracking} className="bg-green-500 hover:bg-green-600">
            ▶️ Start Smart Session
          </Button>
        ) : (
          <Button onClick={stopTracking} className="bg-red-500 hover:bg-red-600">
            ⏹️ Stop & Sync
          </Button>
        )}
      </div>
      
      {/* Smart features status */}
      {isTracking && (
        <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-700">
            🧠 Smart features active: Break reminders, focus protection, and auto-sync enabled
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedTimeTracker;