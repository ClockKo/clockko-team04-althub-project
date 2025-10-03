import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, updateTask, deleteTask, createTask } from '../services/taskTrackerService'
import type { Task } from '@/types'
import { isToday, isFuture, parseISO } from 'date-fns'

// Define a constant key for tasks query
const TASKS_KEY = ['tasks']

export function useTasks() {
  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery<Task[]>({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      const tasks = await fetchTasks()
      console.log('🔍 Raw tasks from API:', tasks) // for debugging
      return Array.isArray(tasks) ? tasks : []
    },
  })

  const today: Task[] = []
  const upcoming: Task[] = []
  const done: Task[] = []

  const normalizedTasks = {
    Today: today,
    Upcoming: upcoming,
    Done: done,
  }

  tasks?.forEach((task) => {
    console.log('🔍 Processing task:', task.title, 'dueAt:', task.dueAt, 'completed:', task.completed)
    
    // Handle completed tasks
    if (task.completed) {
      done.push(task)
      return
    }

    // Parse due date if it exists
    const dueDate = task.dueAt ? 
      (typeof task.dueAt === 'string' ? parseISO(task.dueAt) : task.dueAt) : 
      null

    if (dueDate) {
      if (isToday(dueDate)) {
        today.push(task)
      } else if (isFuture(dueDate)) {
        upcoming.push(task)
      } else {
        // Past due - put in today for attention
        today.push(task)
      }
    } else {
      // No due date - put in upcoming as general tasks
      upcoming.push(task)
    }
  })

  console.log('📊 Task categorization:', {
    total: tasks.length,
    today: today.length,
    upcoming: upcoming.length,
    done: done.length
  })

  return {
    normalizedTasks,
    tasks,
    today,
    upcoming,
    done,
    isLoading,
    isError,
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}
