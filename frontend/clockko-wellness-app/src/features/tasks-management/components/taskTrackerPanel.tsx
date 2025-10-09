import React from 'react'
import type { Task } from '@/types'
import clsx from 'clsx'
import TaskColumn from './TaskColumn'

// TaskTrackerPanel component to display tasks in columns based on their status
const TaskTrackerPanel: React.FC<{
  tasks: { [key: string]: Task[] }
  type: 'list' | 'board'
}> = ({ tasks, type }) => {
  return (
    <div
      className={clsx('gap-4 p-4', {
        'flex-col flex': type === 'list',
        'flex-row items-start flex': type === 'board',
      })}
      style={
        type === 'board'
          ? {
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              // Only enable horizontal scroll on mobile
              ...(window.innerWidth < 1024
                ? { display: 'flex', flexWrap: 'nowrap' }
                : {}),
            }
          : undefined
      }
    >
      {Object.entries(tasks).map(([status, tasksList]) => (
        <TaskColumn key={status} status={status} tasks={tasksList} type={type} />
      ))}
    </div>
  )
}

export default TaskTrackerPanel
