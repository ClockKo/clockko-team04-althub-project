// taskService.ts
import type { Task } from '../../../types'

// Utility to add days to today
const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// Mock data store
let mockTasks: Task[] = [
  {
    id: '1',
    title: 'Finish React project',
    description: 'Complete the React todo app for AltSchool exam',
    completed: false,
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    dueAt: addDays(0), // today
    tags: ['school', 'coding', 'urgent'],
  },
  {
    id: '2',
    title: 'Write documentation',
    description: 'Prepare documentation for the API service',
    completed: false,
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    dueAt: addDays(3), // upcoming
    tags: ['work', 'writing'],
  },
  {
    id: '3',
    title: 'Morning workout',
    description: '30 minutes of exercise',
    completed: true,
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    dueAt: addDays(-1), // yesterday but done
    tags: ['fitness', 'health'],
  },
  {
    id: '4',
    title: 'Team meeting',
    description: 'Stand-up meeting with the dev team',
    completed: false,
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    dueAt: addDays(0), // today
    tags: ['work', 'meeting'],
  },
  {
    id: '5',
    title: 'Plan weekend trip',
    description: 'Look up destinations and book accommodation',
    completed: false,
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    dueAt: addDays(5), // upcoming
    tags: ['personal', 'leisure', 'travel'],
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const fetchTasks = async (): Promise<Task[]> => {
  await delay(500) // simulate network delay
  return [...mockTasks]
}

const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  await delay(500)
  const newTask: Task = {
    ...task,
    id: (mockTasks.length + 1).toString(),
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    completed: false,
  }
  mockTasks.push(newTask)
  return newTask
}

const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  await delay(500)
  const idx = mockTasks.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Task not found')
  mockTasks[idx] = {
    ...mockTasks[idx],
    ...updates,
    updatedAt: new Date().toISOString() as unknown as Date,
  }
  return mockTasks[idx]
}

const deleteTask = async (id: string): Promise<void> => {
  await delay(500)
  mockTasks = mockTasks.filter((t) => t.id !== id)
}

export { fetchTasks, createTask, updateTask, deleteTask }
