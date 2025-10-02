import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Bell, Smartphone, BarChart3 } from 'lucide-react';
import { useRealTimeFeatures } from '../hooks/useRealTimeFeatures';

interface SmartFeaturesWidgetProps {
  className?: string;
}

export const SmartFeaturesWidget: React.FC<SmartFeaturesWidgetProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const realTimeFeatures = useRealTimeFeatures('user-placeholder');
  
  // Get current status
  const syncStatus = realTimeFeatures.syncStatus;
  const workPattern = realTimeFeatures.workPattern;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Compact Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Smart Features</h3>
              <p className="text-sm text-gray-600">
                AI-powered productivity insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Indicators */}
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} 
                   title={syncStatus.isOnline ? 'Online' : 'Offline'} />
              <div className={`w-2 h-2 rounded-full ${workPattern.focusSessionCount > 0 ? 'bg-blue-400' : 'bg-gray-300'}`} 
                   title="Smart tracking active" />
            </div>
            
            {isExpanded ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 mt-4">
            
            {/* Smart Notifications Summary */}
            <div className="text-center">
              <div className="p-2 bg-orange-100 rounded-lg mx-auto w-fit mb-2">
                <Bell className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-xs text-gray-600 mb-1">Smart Notifications</div>
              <div className="text-sm font-medium text-gray-800">
                {workPattern.focusSessionCount} sessions tracked
              </div>
            </div>

            {/* Cross-Device Sync Summary */}
            <div className="text-center">
              <div className="p-2 bg-green-100 rounded-lg mx-auto w-fit mb-2">
                <Smartphone className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-xs text-gray-600 mb-1">Device Sync</div>
              <div className="text-sm font-medium text-gray-800">
                {syncStatus.isOnline ? 'Connected' : 'Offline'}
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="text-center">
              <div className="p-2 bg-purple-100 rounded-lg mx-auto w-fit mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xs text-gray-600 mb-1">Productivity</div>
              <div className="text-sm font-medium text-gray-800">
                {workPattern.productivityLevel}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Quick Actions:</span>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    realTimeFeatures.startBreak();
                  }}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Start Break
                </button>
                <a 
                  href="/smart-features"
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Full Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartFeaturesWidget;