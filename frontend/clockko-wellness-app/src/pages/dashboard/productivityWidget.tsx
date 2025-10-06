import { motion } from 'framer-motion';
import { ChartNoAxesCombined } from 'lucide-react';

export function ProgressCard({ tasksCompleted, tasksTotal, focusTime, focusGoal }: { tasksCompleted: number; tasksTotal: number; focusTime: number; focusGoal: number }) {
  const hasWorkedToday = tasksTotal > 0 || focusTime > 0;
  const taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
  const focusProgress = focusTime > 0 ? (focusTime / focusGoal) * 100 : 0;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow min-h-[180px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="font-semibold text-lg mb-3">Today's Progress</div>
      
      {!hasWorkedToday ? (
        <div className="flex flex-col items-center justify-center h-24 text-gray-500">
          <div className="text-2xl mb-2"><ChartNoAxesCombined/></div>
          <div className="text-sm text-center">Start working to see your progress</div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-sm mb-1">Tasks completed</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-700 rounded-full transition-all duration-300" 
                style={{ width: `${taskProgress}%` }} 
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tasksCompleted} of {tasksTotal} tasks
            </div>
          </div>
          <div>
            <div className="text-sm mb-1">Focus Time</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-700 rounded-full transition-all duration-300" 
                style={{ width: `${focusProgress}%` }} 
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.floor(focusTime / 3600)}h {Math.floor((focusTime % 3600) / 60)}m 
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}