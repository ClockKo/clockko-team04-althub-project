import { motion } from 'framer-motion';
import { ChartNoAxesCombined, CheckCircle, Clock } from 'lucide-react';

export function ProgressCard({ tasksCompleted, tasksTotal, focusTime }: { tasksCompleted: number; tasksTotal: number; focusTime: number }) {
  const hasWorkedToday = tasksTotal > 0 || focusTime > 0;

  // Format time to show hours and minutes properly
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow min-h-[180px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="font-semibold text-lg mb-4">Today's Progress</div>
      
      {!hasWorkedToday ? (
        <div className="flex flex-col items-center justify-center h-24 text-gray-500">
          <div className="text-2xl mb-2"><ChartNoAxesCombined/></div>
          <div className="text-sm text-center">Start working to see your progress</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Tasks Completed Box */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-600">Tasks</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {tasksCompleted}/{tasksTotal}
            </div>
            <div className="text-xs text-blue-600">
              Tasks completed
            </div>
          </div>

          {/* Focus Time Box */}
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">Focus</span>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {formatTime(focusTime)}
            </div>
            <div className="text-xs text-green-600">
              Focus time
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}