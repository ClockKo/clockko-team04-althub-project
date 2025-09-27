// taskService.ts
import api from './api'
import type { Task } from '../../../types'
// import type { Tag, TagCreate } from '../../../types'

interface TaskCreateRequest {
  title: string
  description?: string | null
  // TODO: Uncomment when backend implements these fields
  // start_date?: string | null
  // due_date?: string | null
  // priority?: string
  // tags?: string[]
  reminder_enabled?: boolean
  reminder_time?: string | null
}

interface TaskUpdateRequest {
  title?: string
  description?: string | null
  // TODO: Uncomment when backend implements these fields
  // start_date?: string | null
  // due_date?: string | null
  // completed?: boolean
  // priority?: string
  // tags?: string[]
  reminder_enabled?: boolean
  reminder_time?: string | null
}

interface TaskResponse {
  id: string
  title: string
  description?: string | null
  created_at: string
  updated_at: string
  // TODO: Uncomment when backend implements these fields
  // start_date?: string | null
  // due_date?: string | null
  // completed?: boolean
  // priority?: string
  // tags?: string[]
  reminder_enabled?: boolean
  reminder_time?: string | null
}

// Transform server response to frontend format
const transformTaskResponse = (task: TaskResponse): Task => {
  console.log('🔄 Transforming task response:', task)

  const transformed: Task = {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    // TODO: Uncomment when backend implements these fields
    completed: false, // TODO: task.completed ?? false,
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
    // TODO: Uncomment when backend implements these fields
    startDate: undefined, // TODO: task.start_date ? new Date(task.start_date) : undefined,
    dueAt: undefined, // TODO: task.due_date ? new Date(task.due_date) : undefined,
    tags: [], // TODO: task.tags ?? [],
    // TODO: Uncomment when backend implements priority field
    // priority: task.priority ?? 'medium',
  }

  console.log('✅ Transformed task:', transformed)
  return transformed
}

// Transform frontend task to server format
const transformTaskRequest = (task: Task): TaskCreateRequest => {
  console.log('🔄 Transforming task request:', task)

  const requestData: TaskCreateRequest = {
    title: task.title,
    description: task.description || null,
    // TODO: Uncomment when backend implements these fields
    // start_date: task.startDate?.toISOString() || null,
    // due_date: task.dueAt?.toISOString() || null,
    // priority: task.priority || 'medium',
    // tags: task.tags || [],
    reminder_enabled: false, // Default for now
    reminder_time: null, // Default for now
  }

  console.log('✅ Transformed request:', requestData)
  return requestData
}

const fetchTasks = async (): Promise<Task[]> => {
  try {
    console.log('🚀 Fetching tasks...')
    const token = localStorage.getItem('authToken')
    console.log('🔑 Token exists:', !!token)
    console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'null')

    const response = await api.get<TaskResponse[]>('/tasks/')
    console.log('✅ Tasks fetched successfully:', response.data)
    return response.data.map(transformTaskResponse)
  } catch (error: any) {
    console.error('❌ Error fetching tasks:', error)
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized - Token might be expired or invalid')
      console.error('🚫 Response data:', error.response?.data)
    }
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

    // TODO: Uncomment when backend implements these fields
    // if (updates.startDate !== undefined) requestData.start_date = updates.startDate?.toISOString() || null
    // if (updates.dueAt !== undefined) requestData.due_date = updates.dueAt?.toISOString() || null
    // if (updates.completed !== undefined) requestData.completed = updates.completed
    // if (updates.priority !== undefined) requestData.priority = updates.priority
    // if (updates.tags !== undefined) requestData.tags = updates.tags

    console.log('🔄 Updating task with:', requestData)

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
