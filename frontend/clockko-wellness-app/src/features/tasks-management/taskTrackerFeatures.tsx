/* TaskTrackerFeature.tsx          # Top-level feature entry point*/
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import TaskTrackerPanel from './components/taskTrackerPanel'
import TabsUnderline from './components/TabsUnderline'
import ListIcon from '@/components/Icons/ListIcon'
import PlusIcon from '@/components/Icons/PlusIcon'
import AddTaskModal from './components/AddTaskModal'
import BoardIcon from '@/components/Icons/BoardIcon'
import { useTasks } from './hooks/useTasks'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const TaskTrackerFeatures: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const { normalizedTasks, isLoading } = useTasks()

  const tabs = [
    {
      name: 'List',
      component: <TaskTrackerPanel type="list" tasks={normalizedTasks} />,
      icon: <ListIcon />,
    },
    {
      name: 'Board',
      component: <TaskTrackerPanel type="board" tasks={normalizedTasks} />,
      icon: <BoardIcon />,
    },
  ]

  return (
    <div className="bg-blue-50 p-4">
      <header className="mb-4 flex justify-between p-4">
        <h1 className="text-header font-semibold font-poppins">My Tasks</h1>
        <AddTaskModal showModal={showModal} setShowModal={setShowModal} />
        <Button variant="default" onClick={() => setShowModal(true)} className="bg-blue-900">
          <PlusIcon />
          New Task
        </Button>
      </header>
      <main>{isLoading ? <LoadingSpinner /> : <TabsUnderline tabs={tabs} />}</main>
    </div>
  )
}

export default TaskTrackerFeatures
