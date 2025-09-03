/*TaskItem.tsx                # Individual task component with timer*/
import React, { useRef } from 'react'
import type { Task } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { MdDelete, MdEdit, MdMoreVert } from 'react-icons/md'
import { useClickOutside } from '@/hooks/useClickOutside'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EditTaskModal from './EditTaskModal'
import { useDeleteTask, useUpdateTask } from '../hooks/useTasks'

export interface TaskItemProps {
  task: Task
  listType?: 'list' | 'board'
}

const TaskItem: React.FC<TaskItemProps> = ({ task, listType }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [showOptions, setShowOptions] = React.useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask()
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()

  useClickOutside(menuRef, () => setShowOptions(false))

  const handleShowMenu = () => {
    setShowOptions(!showOptions)
  }

  const handleDelete = (id: string) => {
    deleteTask(id)
  }

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={task.completed}
            disabled={isUpdating}
            onCheckedChange={(checked) =>
              updateTask({
                id: String(task.id),
                updates: { completed: Boolean(checked) },
              })
            }
          />
          <h2>{task.title}</h2>
        </div>

        {showOptions && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
          >
            <ul className="py-1">
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Button variant="ghost" onClick={() => setIsEditOpen(true)}>
                  Edit
                </Button>
              </li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Button variant="ghost" onClick={() => handleDelete(task.id)} disabled={isDeleting}>
                  Delete
                </Button>
              </li>
            </ul>
          </div>
        )}
        {listType === 'list' ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(true)}>
              {/* Edit Icon */}
              <MdEdit />
            </Button>
            <Button variant="ghost" onClick={() => handleDelete(task.id)} disabled={isDeleting}>
              {/* Delete Icon */}
              <MdDelete />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={handleShowMenu} className="p-2">
            <MdMoreVert />
          </Button>
        )}
      </div>

      {Array.isArray(task.tags) && task.tags.length > 0 && (
        <p className="text-sm text-gray-500 rounded-full bg-amber-200 w-fit py-0.5 px-2">
          {task.tags.map((tag) => (
            <Badge key={tag} className="mr-1">
              {tag}
            </Badge>
          ))}
        </p>
      )}

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
        onSave={(updatedTask) =>
          updateTask({
            id: String(task.id),
            updates: updatedTask,
          })
        }
      />
    </div>
  )
}

export default TaskItem
