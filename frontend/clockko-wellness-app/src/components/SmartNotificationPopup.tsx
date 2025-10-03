// Non-disruptive popup notification component
// Alternative to enhanced toasts for even better UX

import React, { useState, useEffect } from 'react';
import { X, Clock, Brain, Target, AlertTriangle } from 'lucide-react';

interface SmartNotification {
  id: string;
  type: 'break' | 'deadline' | 'focus' | 'insight';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  autoClose?: number; // ms until auto-close, 0 = manual only
}

interface SmartNotificationPopupProps {
  notifications: SmartNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const SmartNotificationPopup: React.FC<SmartNotificationPopupProps> = ({
  notifications,
  onDismiss,
  position = 'top-right'
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<SmartNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
    
    // Handle auto-close for notifications
    notifications.forEach(notification => {
      if (notification.autoClose && notification.autoClose > 0) {
        setTimeout(() => {
          onDismiss(notification.id);
        }, notification.autoClose);
      }
    });
  }, [notifications, onDismiss]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  const getIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'break':
        return <Clock className="w-5 h-5" />;
      case 'deadline':
        return <AlertTriangle className="w-5 h-5" />;
      case 'focus':
        return <Target className="w-5 h-5" />;
      case 'insight':
        return <Brain className="w-5 h-5" />;
    }
  };

  const getNotificationStyle = (notification: SmartNotification) => {
    const baseStyle = "mb-3 p-4 rounded-lg shadow-lg border max-w-sm transition-all duration-300 transform hover:scale-105";
    
    switch (notification.type) {
      case 'break':
        return `${baseStyle} bg-green-500 text-white border-green-400`;
      case 'deadline':
        return `${baseStyle} ${notification.priority === 'high' 
          ? 'bg-red-500 border-red-400' 
          : 'bg-orange-500 border-orange-400'} text-white`;
      case 'focus':
        return `${baseStyle} bg-blue-500 text-white border-blue-400`;
      case 'insight':
        return `${baseStyle} bg-purple-500 text-white border-purple-400`;
      default:
        return `${baseStyle} bg-gray-600 text-white border-gray-500`;
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}>
      <div className="space-y-3 pointer-events-auto">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={getNotificationStyle(notification)}
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">
                    {notification.title}
                  </h4>
                  <p className="text-sm opacity-90 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs opacity-75 mt-2">
                    {notification.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-2 flex-shrink-0 rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook for managing smart notifications
export const useSmartNotificationPopups = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  const addNotification = (notification: Omit<SmartNotification, 'id' | 'timestamp'>) => {
    const newNotification: SmartNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Limit to max 3 notifications at once
    setNotifications(prev => prev.slice(-3));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Smart notification helpers
  const showBreakReminder = (duration: number = 5) => {
    addNotification({
      type: 'break',
      title: '🧠 Time for a Break!',
      message: `Your brain could use a ${duration}-minute recharge. Take a walk or grab some water!`,
      priority: 'medium',
      autoClose: 15000, // 15 seconds
    });
  };

  const showDeadlineAlert = (taskTitle: string, timeLeft: string, priority: 'low' | 'medium' | 'high') => {
    addNotification({
      type: 'deadline',
      title: priority === 'high' ? '🚨 Urgent Deadline!' : '⏰ Deadline Reminder',
      message: `"${taskTitle}" is due in ${timeLeft}`,
      priority,
      autoClose: priority === 'high' ? 0 : 20000, // High priority requires manual dismiss
    });
  };

  const showFocusInterruption = () => {
    addNotification({
      type: 'focus',
      title: '🎯 Stay Focused!',
      message: 'Noticed you switched tabs. Your goals are waiting for you!',
      priority: 'medium',
      autoClose: 12000,
    });
  };

  const showProductivityInsight = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    addNotification({
      type: 'insight',
      title: type === 'success' ? '🎉 Great Work!' : type === 'warning' ? '📈 Keep Going!' : '💡 Insight',
      message,
      priority: 'low',
      autoClose: 15000,
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    // Smart helpers
    showBreakReminder,
    showDeadlineAlert,
    showFocusInterruption,
    showProductivityInsight,
  };
};

// CSS for animations (add to your global CSS or styled-components)
export const notificationStyles = `
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

export default SmartNotificationPopup;