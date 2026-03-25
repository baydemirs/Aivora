import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/tasks.service'
import type {
  Task,
  GetTasksQuery,
  GetTasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStats,
  TaskStatus
} from '../types'

// Query keys
const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (query: GetTasksQuery) => [...taskKeys.lists(), query] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
}

// Query Hooks
export const useTasks = (query: GetTasksQuery = {}) => {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => taskService.getTasks(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useTask = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTaskById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTaskStats = () => {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: () => taskService.getTaskStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation Hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(data),
    onSuccess: (newTask) => {
      // Invalidate tasks lists to refetch with new task
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() })

      // Set the new task in cache
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask)
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskService.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot previous values
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id))
      const previousTaskLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically update task detail
      if (previousTask) {
        const optimisticTask: Task = {
          ...previousTask,
          ...data,
          updatedAt: new Date().toISOString(),
          ...(data.status === TaskStatus.DONE && !previousTask.completedAt
            ? { completedAt: new Date().toISOString() }
            : {}),
          ...(data.status !== TaskStatus.DONE
            ? { completedAt: undefined }
            : {})
        }

        queryClient.setQueryData(taskKeys.detail(id), optimisticTask)

        // Update task in all lists that contain it
        previousTaskLists.forEach(([queryKey, data]) => {
          if (data && typeof data === 'object' && 'tasks' in data) {
            const listData = data as GetTasksResponse
            const updatedTasks = listData.tasks.map(task =>
              task.id === id ? optimisticTask : task
            )
            queryClient.setQueryData(queryKey, {
              ...listData,
              tasks: updatedTasks
            })
          }
        })
      }

      return { previousTask, previousTaskLists }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(variables.id), context.previousTask)
      }

      if (context?.previousTaskLists) {
        context.previousTaskLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      console.error('Failed to update task:', error)
    },
    onSuccess: (updatedTask) => {
      // Update task detail cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask)

      // Invalidate and refetch stats to update counts
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() })
    },
    onSettled: (data, error, variables) => {
      // Always refetch task details after mutation settles
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) })
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot previous values
      const previousTaskLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically remove task from all lists
      previousTaskLists.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'tasks' in data) {
          const listData = data as GetTasksResponse
          const filteredTasks = listData.tasks.filter(task => task.id !== id)
          queryClient.setQueryData(queryKey, {
            ...listData,
            tasks: filteredTasks,
            totalCount: listData.totalCount - 1
          })
        }
      })

      return { previousTaskLists }
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousTaskLists) {
        context.previousTaskLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      console.error('Failed to delete task:', error)
    },
    onSuccess: (_, id) => {
      // Remove task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() })
    },
    onSettled: () => {
      // Refetch task lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    }
  })
}

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskIds, status }: { taskIds: string[]; status: TaskStatus }) =>
      taskService.bulkUpdateStatus(taskIds, status),
    onSuccess: () => {
      // Invalidate all task-related queries for bulk updates
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: (error) => {
      console.error('Failed to bulk update tasks:', error)
    }
  })
}

// Utility hooks
export const useTasksInfinite = (baseQuery: GetTasksQuery = {}) => {
  return useQuery({
    queryKey: [...taskKeys.lists(), 'infinite', baseQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const query = { ...baseQuery, page: pageParam as number }
      return taskService.getTasks(query)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Helper function to prefetch task detail
export const usePrefetchTask = () => {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: taskKeys.detail(id),
      queryFn: () => taskService.getTaskById(id),
      staleTime: 1000 * 60 * 5,
    })
  }
}

// Helper function to invalidate all task queries
export const useInvalidateTasks = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all })
  }
}