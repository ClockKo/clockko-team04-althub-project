import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { CircleCheckBig } from 'lucide-react'
import AddTaskModal from '@/features/tasks-management/components/AddTaskModal'
import { useState } from 'react'
import { useTasks } from '@/features/tasks-management/hooks/useTasks'



export function TaskBacklogCard() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { tasks, today, upcoming, isLoading } = useTasks();

  const handleTaskModalOpen = () => {
    setShowTaskModal(true);
  }

  const pendingTasks = [...today, ...upcoming].length;
  const totalTasks = tasks.length;

  if (isLoading) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 shadow min-h-[180px] flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl p-6 shadow min-h-[180px] flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div>
          <div className="font-semibold text-lg mb-2">Task Backlog</div>
          {pendingTasks === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-gray-500">
              <div className="text-2xl mb-2">
                <CircleCheckBig />
              </div>
              <div className="text-sm text-center">No pending tasks</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-gray-600 text-sm">{pendingTasks} tasks pending</div>
              <div className="space-y-1">
                {today.length > 0 && (
                  <div className="text-xs text-blue-600">📅 {today.length} due today</div>
                )}
                {upcoming.length > 0 && (
                  <div className="text-xs text-orange-600">⏰ {upcoming.length} upcoming</div>
                )}
              </div>
              {totalTasks > 0 && (
                <div className="text-xs text-gray-500">
                  Total: {totalTasks} tasks
                </div>
              )}
            </div>
          )}
        </div>
        <Button onClick={handleTaskModalOpen} className="w-full lg:w-fit bg-blue1 mx-auto hover:bg-blue-800/80 cursor-pointer">
          Create a task
        </Button>
      </motion.div>
      <AddTaskModal showModal={showTaskModal} setShowModal={setShowTaskModal} />
    </>
  )
}

// Additional components related to task management can be added here and the modal to create tasks can be implemented as needed.
