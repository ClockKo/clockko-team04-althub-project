/* TaskTrackerFeature.tsx          # Top-level feature entry point*/
import React, { useState } from 'react'
import { useHead } from '@unhead/react'
import { Button } from '../../components/ui/button'
import TaskTrackerPanel from './components/taskTrackerPanel'
import TabsUnderline from './components/TabsUnderline'
import ListIcon from '../../components/Icons/ListIcon'
import PlusIcon from '../../components/Icons/PlusIcon'
import AddTaskModal from './components/AddTaskModal'
import BoardIcon from '../../components/Icons/BoardIcon'
import { useTasks } from './hooks/useTasks'
import { LoadingSpinner } from '../../components/LoadingSpinner'

const TaskTrackerFeatures: React.FC = () => {
  // Set meta tags for tasks page
  useHead({
    title: 'Tasks - ClockKo | Manage Your Projects & To-Dos',
    meta: [
      {
        name: 'description',
        content: 'Organize and manage your tasks efficiently with ClockKo\'s task management system. Create, track, and complete your projects with ease.'
      },
      {
        name: 'robots',
        content: 'noindex, nofollow' // Protected pages should not be indexed
      }
    ]
  });

  const [showModal, setShowModal] = useState<boolean>(false)
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
    <div className="bg-powderBlue p-4">
      <header className="mb-4 flex justify-between p-4">
        <h1 className="text-header font-semibold font-poppins">My Tasks</h1>
        <AddTaskModal showModal={showModal} setShowModal={setShowModal} />
        <Button variant="default" onClick={() => setShowModal(true)} className="bg-blue1 hover:bg-blue-900/60 cursor-pointer text-white text-sm px-8 py-2 h-10 lg:w-[15%] rounded-4xl lg:rounded-lg font-medium">
          <PlusIcon />
          New Task
        </Button>
      </header>
      <main>{isLoading ? <LoadingSpinner /> : <TabsUnderline tabs={tabs} />}</main>
    </div>
  )
}

export default TaskTrackerFeatures
