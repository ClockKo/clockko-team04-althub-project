/*TaskItem.tsx                # Individual task component with timer*/
import React, { useRef } from 'react'
import type { Task } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { MdDelete, MdEdit, MdMoreVert } from 'react-icons/md'
import { useClickOutside } from '@/hooks/useClickOutside'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EditTaskModal from './EditTaskModal'
import { useDeleteTask, useCompleteTask, useUncompleteTask, useUpdateTask } from '../hooks/useTasks'

export interface TaskItemProps {
  task: Task
  listType?: 'list' | 'board'
}

const TaskItem: React.FC<TaskItemProps> = ({ task, listType }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [showOptions, setShowOptions] = React.useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()
  const { mutate: completeTask, isPending: isCompleting } = useCompleteTask()
  const { mutate: uncompleteTask, isPending: isUncompleting } = useUncompleteTask()
  const { mutate: updateTask } = useUpdateTask()

  useClickOutside(menuRef, () => setShowOptions(false))

  const handleShowMenu = () => {
    setShowOptions(!showOptions)
  }

  const handleDelete = (id: string) => {
    deleteTask(id)
  }

  return (
    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={task.completed}
            disabled={isCompleting || isUncompleting}
            onCheckedChange={(checked) => {
              if (checked) {
                completeTask(task.id)
              } else {
                uncompleteTask(task.id)
              }
            }}
            className="mt-0.5 h-6 w-6 rounded-md border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <div className="flex-1">
            {listType === 'list' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {task.title}
                </h3>
                {Array.isArray(task.tags) && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="px-2 py-1 text-xs rounded-full border"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          borderColor: `${tag.color}40`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <h3
                  className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {task.title}
                </h3>
                {Array.isArray(task.tags) && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="px-2 py-1 text-xs rounded-full border"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          borderColor: `${tag.color}40`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-start">
          {listType === 'list' ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <MdEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(task.id)}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
              >
                <MdDelete className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowMenu}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <MdMoreVert className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showOptions && (
          <div
            ref={menuRef}
            className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
          >
            <ul className="py-1">
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditOpen(true)}
                  className="w-full justify-start p-0"
                >
                  Edit
                </Button>
              </li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(task.id)}
                  disabled={isDeleting}
                  className="w-full justify-start p-0 text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
        onSave={(updatedTask) =>
          updateTask({
            id: task.id,
            updates: updatedTask,
          })
        }
      />
    </div>
  )
}

export default TaskItem