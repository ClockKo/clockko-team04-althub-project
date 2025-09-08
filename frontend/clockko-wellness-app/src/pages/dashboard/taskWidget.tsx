import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { CircleCheckBig } from 'lucide-react'
import AddTaskModal from '@/features/tasks-management/components/AddTaskModal'
import { useState } from 'react'



export function TaskBacklogCard({ pendingTasks }: { pendingTasks: number }) {
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleTaskModalOpen = () => {
    setShowTaskModal(true);
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
            <div className="text-gray-600 text-sm mb-4">{pendingTasks} tasks pending</div>
          )}
        </div>
        <Button onClick={handleTaskModalOpen}  className="w-full lg:w-fit bg-blue1 mx-auto hover:bg-blue-800/80 cursor-pointer">
          Create a task
        </Button>
      </motion.div>
      <AddTaskModal showModal={showTaskModal} setShowModal={setShowTaskModal} />
    </>
  )
}

// Additional components related to task management can be added here and the modal to create tasks can be implemented as needed.
