import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, updateTask, deleteTask, createTask } from '../services/taskTrackerService'
import type { Task } from '../../../types'
import { isToday, isFuture, parseISO } from 'date-fns'

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
    const dueDate = typeof task.dueAt === 'string' ? parseISO(task.dueAt) : task.dueAt

    if (task.completed) {
      done.push(task)
    } else if (dueDate && isToday(dueDate)) {
      today.push(task)
    } else if (dueDate && isFuture(dueDate)) {
      upcoming.push(task)
    }
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
