/*TaskList.tsx                # Displays tasks & timers*/
import React from 'react'
import TaskItem from './taskItem'
import type { Task } from '@/types'

// Props for TaskList component
interface TaskListProps {
  tasks: Task[]
  listType?: 'list' | 'board'
}

// TaskList component to render a list of tasks
const TaskList: React.FC<TaskListProps> = ({ tasks, listType }) => {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} listType={listType} />
      ))}
    </div>
  )
}

export default TaskList
