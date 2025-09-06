import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardHeader } from "./headerWidget";
import { WorkSessionCard } from "./workWidget";
import { ProgressCard } from "./productivityWidget";
import { TaskBacklogCard } from "./taskWidget";
import { ShutdownStreakCard } from "./shutdownWidget";
import { useCurrentSession, useClockIn, useClockOut, useDashboardData } from "./dashboardHooks";
import { ShutdownModal } from "./shutdownModals/modal";
import type { Task } from "../../types/typesGlobal";
import { Skeleton } from "../../components/ui/skeleton";



// ------------------ MAIN DASHBOARD PAGE ------------------

export default function DashboardPage() {
  const { data: session, isLoading: sessionLoading } = useCurrentSession();
  const { data: dashboardData } = useDashboardData();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const [showShutdown, setShowShutdown] = useState(false);


  function handleClockIn() {
    clockInMutation.mutate();
  }
  
  function handleClockOut() {
    clockOutMutation.mutate(undefined, {
      onSuccess: () => {
        setTimeout(() => setShowShutdown(true), 1000); // Show modal after 1s
      },
    });
  }
  
  function handleCloseShutdown() {
    setShowShutdown(false);
  }

  function handleTestShutdown() {
    setShowShutdown(true);
  }

  // Use real data if available, otherwise fallback to empty/zero values
  const progressData = dashboardData ? {
    tasksCompleted: dashboardData.tasks?.filter((t: Task) => t.completed).length || 0,
    tasksTotal: dashboardData.tasks?.length || 0,
    focusTime: dashboardData.todaySummary?.duration || 0,
    focusGoal: 120, // This should come from user settings
    pendingTasks: dashboardData.tasks?.filter((t: Task) => !t.completed).length || 0,
    shutdownStreak: dashboardData.points || 0,
  } : {
    tasksCompleted: 0,
    tasksTotal: 0,
    focusTime: 0,
    focusGoal: 120,
    pendingTasks: 0,
    shutdownStreak: 0,
  };

  return (
    <div className="w-full min-h-screen px-8 xs:px-4 py-2 bg-powderBlue">
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessionLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            <WorkSessionCard
              session={session}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onTestShutdown={handleTestShutdown}
            />
            <ProgressCard
              tasksCompleted={progressData.tasksCompleted}
              tasksTotal={progressData.tasksTotal}
              focusTime={progressData.focusTime}
              focusGoal={progressData.focusGoal}
            />
            <TaskBacklogCard pendingTasks={progressData.pendingTasks} />
            <ShutdownStreakCard shutdownStreak={progressData.shutdownStreak} />
          </>
        )}
      </div>
      <AnimatePresence>
        {showShutdown && (
          <ShutdownModal open={showShutdown} onClose={handleCloseShutdown} />
        )}
      </AnimatePresence>
    </div>
  );
}