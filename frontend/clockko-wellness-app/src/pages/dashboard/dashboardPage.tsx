import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { useHead } from '@unhead/react'
import { DashboardHeader } from './headerWidget'
import { WorkSessionCard } from './workWidget'
import { ProgressCard } from './productivityWidget'
import { TaskBacklogCard } from './taskWidget'
import { ShutdownStreakCard } from './shutdownWidget'
import { useCurrentSession, useClockIn, useClockOut, useDashboardData } from './dashboardHooks'
import { ShutdownModal } from './shutdownModals/modal'
import { AuthDebugPanel } from '../../components/AuthDebugPanel'
import type { Task } from '../../types/typesGlobal'
import { Skeleton } from '../../components/ui/skeleton'

// ------------------ MAIN DASHBOARD PAGE ------------------

export default function DashboardPage() {
  // Set meta tags for dashboard
  useHead({
    title: 'Dashboard - ClockKo | Your Productivity Hub',
    meta: [
      {
        name: 'description',
        content: 'Track your work sessions, manage tasks, monitor productivity, and maintain wellness streaks all from your ClockKo dashboard.'
      },
      {
        name: 'robots',
        content: 'noindex, nofollow' // Dashboard should not be indexed
      }
    ]
  });

  const { data: session, isLoading: sessionLoading } = useCurrentSession()
  const { data: dashboardData } = useDashboardData()
  const clockInMutation = useClockIn()
  const clockOutMutation = useClockOut()
  const queryClient = useQueryClient()
  const [showShutdown, setShowShutdown] = useState<boolean>(false)

  // Handlers for clock in 
  function handleClockIn() {
    clockInMutation.mutate()
  }

  // On successful clock out, show shutdown modal after 1s
  function handleClockOut() {
    clockOutMutation.mutate(undefined, {
      onSuccess: () => {
        setTimeout(() => setShowShutdown(true), 1000) // Show modal after 1s
      },
    })
  }

  // handler to close shutdown modal
  function handleCloseShutdown() {
    setShowShutdown(false)
    // Force refresh of session data to update UI state
    queryClient.invalidateQueries({ queryKey: ["currentSession"] })
    queryClient.invalidateQueries({ queryKey: ["dashboardData"] })
    clockInMutation.reset() // Clear any pending states
    clockOutMutation.reset() // Clear any pending states
  }

  // Handler to open shutdown modal for testing
  function handleTestShutdown() {
    setShowShutdown(true)
  }

  // Use real data if available, otherwise fallback to empty/zero values
  const progressData = dashboardData
    ? {
        tasksCompleted: dashboardData.tasks?.filter((t: Task) => t.completed).length || 0,
        tasksTotal: dashboardData.tasks?.length || 0,
        focusTime: dashboardData.todaySummary?.duration || 0,
        focusGoal: 120, // This should come from user settings
        pendingTasks: dashboardData.tasks?.filter((t: Task) => !t.completed).length || 0,
        shutdownStreak: dashboardData.points || 0,
      }
    : {
        tasksCompleted: 0,
        tasksTotal: 0,
        focusTime: 0,
        focusGoal: 120,
        pendingTasks: 0,
        shutdownStreak: 0,
      }

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
            <TaskBacklogCard />
            <ShutdownStreakCard shutdownStreak={progressData.shutdownStreak} />
          </>
        )}
      </div>
      
      {/* Debug Panel - Development Only */}
      {import.meta.env.DEV && (
        <div className="mt-6">
          <AuthDebugPanel />
        </div>
      )}
      <AnimatePresence>
        {showShutdown && <ShutdownModal open={showShutdown} onClose={handleCloseShutdown} />}
      </AnimatePresence>
    </div>
  )
}
