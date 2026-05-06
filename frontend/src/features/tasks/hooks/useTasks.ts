import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { taskService } from '../services/tasks.service'
import { appQueryKeys } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/use-auth'
import { logDevError } from '@/lib/logger'
import type {
  Task,
  GetTasksQuery,
  GetTasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../types'
import { TaskStatus } from '../types'

// Query keys
const taskKeys = {
  all: appQueryKeys.tasks.all,
  lists: appQueryKeys.tasks.lists,
  list: (query: GetTasksQuery) => appQueryKeys.tasks.list(query as unknown as Record<string, unknown>),
  details: appQueryKeys.tasks.details,
  detail: appQueryKeys.tasks.detail,
  stats: appQueryKeys.tasks.stats,
}

// Query Hooks
export const useTasks = (query: GetTasksQuery = {}) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...taskKeys.list(query), tenantScope],
    queryFn: () => taskService.getTasks(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useTask = (id: string, enabled: boolean = true) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...taskKeys.detail(id), tenantScope],
    queryFn: () => taskService.getTaskById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTaskStats = () => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...taskKeys.stats(), tenantScope],
    queryFn: () => taskService.getTaskStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation Hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(data),
    onSuccess: (newTask) => {
      // Invalidate tasks lists to refetch with new task
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })

      // Set the new task in cache
      queryClient.setQueryData([...taskKeys.detail(newTask.id), tenantScope], newTask)
    },
    onError: (error) => {
      logDevError('Failed to create task.', error)
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskService.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [...taskKeys.detail(id), tenantScope] })
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot previous values
      const previousTask = queryClient.getQueryData<Task>([
        ...taskKeys.detail(id),
        tenantScope,
      ])
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

        queryClient.setQueryData([...taskKeys.detail(id), tenantScope], optimisticTask)

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
        queryClient.setQueryData(
          [...taskKeys.detail(variables.id), tenantScope],
          context.previousTask,
        )
      }

      if (context?.previousTaskLists) {
        context.previousTaskLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      logDevError('Failed to update task.', error)
    },
    onSuccess: (updatedTask) => {
      // Update task detail cache
      queryClient.setQueryData([...taskKeys.detail(updatedTask.id), tenantScope], updatedTask)

      // Invalidate and refetch stats to update counts
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch task details after mutation settles
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) })
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

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
            totalCount: Math.max(0, listData.totalCount - 1)
          })
        }
      })

      return { previousTaskLists }
    },
    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previousTaskLists) {
        context.previousTaskLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      logDevError('Failed to delete task.', error)
    },
    onSuccess: (_, id) => {
      // Remove task from cache
      queryClient.removeQueries({ queryKey: [...taskKeys.detail(id), tenantScope] })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
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
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
    },
    onError: (error) => {
      logDevError('Failed to bulk update tasks.', error)
    }
  })
}

// Utility hooks
export const useTasksInfinite = (baseQuery: GetTasksQuery = {}) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useInfiniteQuery({
    queryKey: [...taskKeys.lists(), 'infinite', baseQuery, tenantScope],
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
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: [...taskKeys.detail(id), tenantScope],
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
