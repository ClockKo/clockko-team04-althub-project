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
      className={clsx('p-6 bg-white w-full shadow-md rounded-3xl font-poppins', {
        'max-w-md': type === 'board',
      })}
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
