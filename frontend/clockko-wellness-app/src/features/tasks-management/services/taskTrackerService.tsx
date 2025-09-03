import axios from 'axios'
import type { Task } from '@/types'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/tasks`

const fetchTasks = async (): Promise<Task[]> => {
  const response = await axios.get(API_BASE_URL)
  return response.data
}

const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const response = await axios.post(API_BASE_URL, task)
  return response.data
}

const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, updates)
  return response.data
}

const deleteTask = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`)
}

export { fetchTasks, createTask, updateTask, deleteTask }
