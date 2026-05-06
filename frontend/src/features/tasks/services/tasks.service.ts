import apiClient from '@/services/api/client'
import { env } from '@/config/env'
import { getCurrentTenantId, isTenantScopedRecord } from '@/utils/tenant'
import { AppError, toAppError } from '@/lib/errors'
import {
  TaskStatus,
  TaskPriority,
  TaskModule,
  TaskSortBy,
} from '../types'
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  GetTasksQuery,
  GetTasksResponse,
  TaskStats,
} from '../types'

interface BackendPrdTask {
  id: string
  title: string
  module: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  tenantId: string
  createdAt: string
  updatedAt: string
}

const toUiModule = (module: string): string => {
  const value = module?.trim().toLowerCase()
  if (!value) return TaskModule.API
  if (Object.values(TaskModule).includes(value as (typeof TaskModule)[keyof typeof TaskModule])) {
    return value
  }
  return value
}

const toUiStatus = (status: BackendPrdTask['status']): Task['status'] => {
  if (status === 'IN_PROGRESS') return TaskStatus.IN_PROGRESS
  if (status === 'COMPLETED') return TaskStatus.DONE
  return TaskStatus.TODO
}

const toBackendStatus = (status: Task['status']): BackendPrdTask['status'] => {
  if (status === TaskStatus.DONE) return 'COMPLETED'
  if (status === TaskStatus.IN_PROGRESS || status === TaskStatus.BLOCKED || status === TaskStatus.REVIEW) {
    return 'IN_PROGRESS'
  }
  return 'PENDING'
}

const mapBackendTask = (task: BackendPrdTask): Task => ({
  id: task.id,
  title: task.title,
  description: '',
  status: toUiStatus(task.status),
  priority: TaskPriority.MEDIUM,
  module: toUiModule(task.module),
  assigneeId: undefined,
  assigneeName: undefined,
  estimatedHours: undefined,
  actualHours: undefined,
  tags: [],
  tenantId: task.tenantId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  completedAt: task.status === 'COMPLETED' ? task.updatedAt : undefined,
  metadata: {},
})

const priorityWeights: Record<Task['priority'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
}

const sortTasks = (tasks: Task[], sortBy: TaskSortBy, sortOrder: 'asc' | 'desc') => {
  return [...tasks].sort((a, b) => {
    let aVal: string | number = a[sortBy as keyof Task] as string
    let bVal: string | number = b[sortBy as keyof Task] as string

    if (sortBy === TaskSortBy.PRIORITY) {
      aVal = priorityWeights[a.priority]
      bVal = priorityWeights[b.priority]
    }

    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()

    if (sortOrder === 'asc') return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
  })
}

const applyClientFilters = (tasks: Task[], query: GetTasksQuery): Task[] => {
  const {
    search = '',
    status,
    priority,
    module,
    assignee,
    sortBy = TaskSortBy.UPDATED_AT,
    sortOrder = 'desc',
  } = query

  let filtered = [...tasks]

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter((task) =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  }

  if (status) filtered = filtered.filter((task) => task.status === status)
  if (priority) filtered = filtered.filter((task) => task.priority === priority)
  if (module) filtered = filtered.filter((task) => task.module === module)
  if (assignee) filtered = filtered.filter((task) => task.assigneeId === assignee)

  return sortTasks(filtered, sortBy, sortOrder)
}

const paginate = (tasks: Task[], page: number, limit: number): GetTasksResponse => {
  const totalCount = tasks.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const startIndex = (page - 1) * limit
  const paginatedTasks = tasks.slice(startIndex, startIndex + limit)

  return {
    tasks: paginatedTasks,
    totalCount,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

class RealTaskService {
  async getTasks(query: GetTasksQuery = {}): Promise<GetTasksResponse> {
    const page = query.page || 1
    const limit = query.limit || 50

    // Backend currently exposes list endpoint without rich filtering contract.
    // We still pass filter params to keep the request shape ready for server-side support.
    let response
    try {
      response = await apiClient.get<BackendPrdTask[]>('/prd', {
        params: {
          search: query.search,
          status: query.status ? toBackendStatus(query.status) : undefined,
          priority: query.priority,
          module: query.module,
          assignee: query.assignee,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          page,
          limit,
        },
      })
    } catch (error) {
      throw toAppError(error, 'Failed to fetch tasks')
    }

    const tenantId = getCurrentTenantId()
    const scoped = response.data.filter((task) => isTenantScopedRecord(task.tenantId, tenantId))
    const mapped = scoped.map(mapBackendTask)
    const filtered = applyClientFilters(mapped, query)
    return paginate(filtered, page, limit)
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tenantId = getCurrentTenantId()
    let response
    try {
      response = await apiClient.get<BackendPrdTask[]>('/prd')
    } catch (error) {
      throw toAppError(error, 'Failed to fetch task detail')
    }
    const found = response.data.find(
      (task) => task.id === id && isTenantScopedRecord(task.tenantId, tenantId),
    )
    return found ? mapBackendTask(found) : null
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    let response
    try {
      response = await apiClient.post<BackendPrdTask>('/prd', {
        title: data.title,
        module: data.module,
      })
    } catch (error) {
      throw toAppError(error, 'Failed to create task')
    }
    const tenantId = getCurrentTenantId()
    if (!isTenantScopedRecord(response.data.tenantId, tenantId)) {
      throw new AppError('tenant', 'Task creation response is not tenant-scoped')
    }
    return mapBackendTask(response.data)
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    let response
    try {
      response = await apiClient.patch<BackendPrdTask>(`/prd/${id}`, {
        status: data.status ? toBackendStatus(data.status) : undefined,
      })
    } catch (error) {
      throw toAppError(error, 'Failed to update task')
    }
    const tenantId = getCurrentTenantId()
    if (!isTenantScopedRecord(response.data.tenantId, tenantId)) {
      throw new AppError('tenant', 'Task update response is not tenant-scoped')
    }
    return mapBackendTask(response.data)
  }

  async deleteTask(id: string): Promise<void> {
    void id
    throw new AppError('unsupported', 'Delete task is not supported by backend yet')
  }

  async getTaskStats(): Promise<TaskStats> {
    const tasks = (await this.getTasks({ page: 1, limit: 1000 })).tasks
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      blocked: tasks.filter((t) => t.status === TaskStatus.BLOCKED).length,
      review: tasks.filter((t) => t.status === TaskStatus.REVIEW).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      byPriority: {
        low: tasks.filter((t) => t.priority === TaskPriority.LOW).length,
        medium: tasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
        high: tasks.filter((t) => t.priority === TaskPriority.HIGH).length,
        urgent: tasks.filter((t) => t.priority === TaskPriority.URGENT).length,
      },
      byModule: tasks.reduce<Record<string, number>>((acc, task) => {
        acc[task.module] = (acc[task.module] || 0) + 1
        return acc
      }, {}),
    }
  }

  async bulkUpdateStatus(taskIds: string[], status: TaskStatus): Promise<Task[]> {
    const updates = taskIds.map((id) => this.updateTask(id, { status }))
    const settled = await Promise.allSettled(updates)
    return settled
      .filter((result): result is PromiseFulfilledResult<Task> => result.status === 'fulfilled')
      .map((result) => result.value)
  }
}

class MockTaskService extends RealTaskService {
  private memoryTasks: Task[] = []

  private async ensureSeeded() {
    if (this.memoryTasks.length > 0) return
    this.memoryTasks = [
      {
        id: 'mock-1',
        title: 'Implement JWT Authentication',
        description: 'Set up JWT authentication with refresh tokens.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        module: TaskModule.AUTH,
        assigneeId: 'user-1',
        assigneeName: 'Alex Morgan',
        estimatedHours: 8,
        actualHours: 10,
        tags: ['jwt'],
        tenantId: 'tenant-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        metadata: {},
      },
    ]
  }

  async getTasks(query: GetTasksQuery = {}): Promise<GetTasksResponse> {
    await this.ensureSeeded()
    const page = query.page || 1
    const limit = query.limit || 50
    const filtered = applyClientFilters(this.memoryTasks, query)
    return paginate(filtered, page, limit)
  }

  async getTaskById(id: string): Promise<Task | null> {
    await this.ensureSeeded()
    return this.memoryTasks.find((task) => task.id === id) || null
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    await this.ensureSeeded()
    const task: Task = {
      id: `mock-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: TaskStatus.TODO,
      priority: data.priority,
      module: data.module,
      assigneeId: data.assigneeId,
      assigneeName: undefined,
      estimatedHours: data.estimatedHours,
      actualHours: undefined,
      tags: data.tags || [],
      tenantId: 'tenant-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {},
    }
    this.memoryTasks.unshift(task)
    return task
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    await this.ensureSeeded()
    const index = this.memoryTasks.findIndex((task) => task.id === id)
    if (index < 0) throw new Error('Task not found')
    const updated = {
      ...this.memoryTasks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    this.memoryTasks[index] = updated
    return updated
  }

  async deleteTask(id: string): Promise<void> {
    await this.ensureSeeded()
    this.memoryTasks = this.memoryTasks.filter((task) => task.id !== id)
  }
}

export const taskService = env.enableMockApi
  ? new MockTaskService()
  : new RealTaskService()
