// taskService.ts
import api from './api'
import type { Task, Tag, TagCreate } from '../../../types'

interface TaskCreateRequest {
  title: string
  description?: string | null
  start_date?: string | null
  due_at?: string | null
  tag_ids: string[]
  new_tags?: TagCreate[]
}

interface TaskUpdateRequest {
  title?: string
  description?: string | null
  start_date?: string | null
  due_at?: string | null
  completed?: boolean
  tag_ids?: string[]
  new_tags?: TagCreate[]
}

interface TaskResponse {
  id: string
  title: string
  description?: string
  completed: boolean
  start_date?: string
  due_at?: string
  tags: Tag[]
  created_at: string
  updated_at: string
}

// Transform server response to frontend format
const transformTaskResponse = (task: TaskResponse): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  startDate: task.start_date ? new Date(task.start_date) : undefined,
  dueAt: task.due_at ? new Date(task.due_at) : undefined,
  tags: task.tags,
  createdAt: new Date(task.created_at),
  updatedAt: new Date(task.updated_at),
})

// Transform frontend task to server format
const transformTaskRequest = (task: Task): TaskCreateRequest => {
  const existingTagIds: string[] = []
  const newTags: TagCreate[] = []
  
  if (task.tags) {
    task.tags.forEach((tag: Tag) => {
      if (tag.id.startsWith('temp-') || tag.id.startsWith('tag-')) {
        newTags.push({
          name: tag.name,
          color: tag.color
        })
      } else {
        existingTagIds.push(tag.id)
      }
    })
  }
  
  const requestData: TaskCreateRequest = {
    title: task.title,
    description: task.description || null,
    start_date: task.startDate ? (task.startDate instanceof Date ? task.startDate.toISOString() : task.startDate) : null,
    due_at: task.dueAt ? (task.dueAt instanceof Date ? task.dueAt.toISOString() : task.dueAt) : null,
    tag_ids: existingTagIds,
  }
  
  if (newTags.length > 0) {
    requestData.new_tags = newTags
  }
  
  return requestData
}


const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get<TaskResponse[]>('/tasks/')
    return response.data.map(transformTaskResponse)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

const createTask = async (taskData: Task): Promise<Task> => {
  try {
    const requestData = transformTaskRequest(taskData)
    const response = await api.post<TaskResponse>('/tasks/', requestData)
    return transformTaskResponse(response.data)
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }
}

const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  try {
    const requestData: TaskUpdateRequest = {}
    
    if (updates.title !== undefined) requestData.title = updates.title
    if (updates.description !== undefined) requestData.description = updates.description || null
    if (updates.startDate !== undefined) {
      requestData.start_date = updates.startDate 
        ? (updates.startDate instanceof Date ? updates.startDate.toISOString() : updates.startDate)
        : null
    }
    if (updates.dueAt !== undefined) {
      requestData.due_at = updates.dueAt 
        ? (updates.dueAt instanceof Date ? updates.dueAt.toISOString() : updates.dueAt)
        : null
    }
    if (updates.completed !== undefined) requestData.completed = updates.completed
    
    if (updates.tags !== undefined) {
      const existingTagIds: string[] = []
      const newTags: TagCreate[] = []
      
      if (updates.tags) {
        updates.tags.forEach((tag: Tag) => {
          if (tag.id.startsWith('temp-') || tag.id.startsWith('tag-')) {
            newTags.push({
              name: tag.name,
              color: tag.color
            })
          } else {
            existingTagIds.push(tag.id)
          }
        })
      }
      
      requestData.tag_ids = existingTagIds
      if (newTags.length > 0) {
        requestData.new_tags = newTags
      }
    }

    const response = await api.put<TaskResponse>(`/tasks/${id}`, requestData)
    return transformTaskResponse(response.data)
  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }
}

const deleteTask = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${id}`)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}

export { fetchTasks, createTask, updateTask, deleteTask }
