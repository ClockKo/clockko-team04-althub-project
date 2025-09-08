import { motion } from "framer-motion";
import { Flame } from "lucide-react";
// i need to fetch the shutdown streak from the backend and display it here

export function ShutdownStreakCard({ shutdownStreak }: { shutdownStreak: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow min-h-[180px] flex flex-col justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
    >
      <div>
        <div className="font-semibold text-lg mb-2">Shutdown Streak</div>
        {shutdownStreak === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-gray-500">
            <div className="text-2xl mb-2"><Flame/></div>
            <div className="text-sm text-center">Start your streak today!</div>
          </div>
        ) : (
          <div className="text-gray-600 text-2xl font-bold text-blue-600">
            {shutdownStreak} Days
          </div>
        )}
      </div>
      {shutdownStreak > 0 && (
        <div className="text-xs text-gray-500 text-center">
          Keep it up! 🎉
        </div>
      )}
    </motion.div>
  );
}

