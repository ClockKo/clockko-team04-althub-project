import React, { useState } from 'react'
import type { Task } from '@/types'
import TaskList from './taskList'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import CollapsibleHeader from './CollapsibleHeader'
import clsx from 'clsx'

interface TaskColumnProps {
  status: string
  tasks: Task[]
  type: 'list' | 'board'
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, type }) => {
  const [open, setOpen] = useState(true)

  return (
      <div
        className={clsx(
          'p-6 bg-white shadow-md rounded-3xl font-poppins',
          {
            'w-full': type === 'list',
            // Responsive board column width for mobile
            'flex-1 min-w-0': type === 'board',
          }
        )}
        style={
          type === 'board'
            ? {
                minWidth: '280px', // fallback for desktop
                width: '100%',
                maxWidth: '420px',
                // Mobile: wider columns
                ...(window.innerWidth < 768
                  ? { minWidth: '80vw', maxWidth: '90vw' }
                  : {}),
              }
            : undefined
        }
      >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleHeader
          title={status}
          count={tasks.length}
          open={open}
          onToggle={() => setOpen(!open)}
        />

        <CollapsibleContent>
          {tasks.length > 0 ? (
            <TaskList tasks={tasks} listType={type} />
          ) : (
            <p className="text-sm text-gray-400 italic">No tasks here</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default TaskColumn
