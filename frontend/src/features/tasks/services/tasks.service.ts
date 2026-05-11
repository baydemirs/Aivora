import apiClient from '@/services/api/client'
import { TaskPriority, TaskSortBy, TaskStatus } from '../types'
import type {
  CreateTaskRequest,
  GetTasksQuery,
  GetTasksResponse,
  Task,
  TaskStats,
  UpdateTaskRequest,
} from '../types'

type ApiTask = {
  id: string
  title: string
  module: string
  status: TaskStatus
  tenantId: string
  createdAt: string
  updatedAt: string
}

function toTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    status: apiTask.status,
    module: apiTask.module,
    priority: TaskPriority.MEDIUM,
    tenantId: apiTask.tenantId,
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  }
}

function applyFilters(tasks: Task[], query: GetTasksQuery): Task[] {
  let filtered = [...tasks]

  if (query.search) {
    const search = query.search.toLowerCase()
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.module.toLowerCase().includes(search),
    )
  }

  if (query.status) {
    filtered = filtered.filter((task) => task.status === query.status)
  }

  if (query.priority) {
    filtered = filtered.filter((task) => task.priority === query.priority)
  }

  if (query.module) {
    filtered = filtered.filter((task) => task.module === query.module)
  }

  return filtered
}

function sortTasks(tasks: Task[], query: GetTasksQuery): Task[] {
  const sortBy = query.sortBy || TaskSortBy.UPDATED_AT
  const sortOrder = query.sortOrder || 'desc'

  return [...tasks].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue === bValue) return 0
    if (aValue === undefined) return 1
    if (bValue === undefined) return -1

    const comparison = aValue > bValue ? 1 : -1
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

function paginateTasks(tasks: Task[], query: GetTasksQuery): GetTasksResponse {
  const page = query.page || 1
  const limit = query.limit || 50
  const totalCount = tasks.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const start = (page - 1) * limit

  return {
    tasks: tasks.slice(start, start + limit),
    totalCount,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function buildStats(tasks: Task[]): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    blocked: 0,
    review: 0,
    done: 0,
    byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    byModule: {},
  }

  for (const task of tasks) {
    if (task.status === TaskStatus.TODO) stats.todo++
    if (task.status === TaskStatus.IN_PROGRESS) stats.inProgress++
    if (task.status === TaskStatus.BLOCKED) stats.blocked++
    if (task.status === TaskStatus.REVIEW) stats.review++
    if (task.status === TaskStatus.DONE) stats.done++
    stats.byPriority[task.priority]++
    stats.byModule[task.module] = (stats.byModule[task.module] || 0) + 1
  }

  return stats
}

class ApiTaskService {
  async getTasks(query: GetTasksQuery = {}): Promise<GetTasksResponse> {
    const response = await apiClient.get<ApiTask[]>('/prd')
    const tasks = response.data.map(toTask)
    return paginateTasks(sortTasks(applyFilters(tasks, query), query), query)
  }

  async getTaskById(id: string): Promise<Task | null> {
    const response = await this.getTasks()
    return response.tasks.find((task) => task.id === id) || null
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<ApiTask>('/prd', {
      title: data.title,
      module: data.module,
    })
    return toTask(response.data)
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    if (!data.status) {
      const task = await this.getTaskById(id)
      if (!task) throw new Error('Task not found')
      return task
    }

    const response = await apiClient.patch<ApiTask>(`/prd/${id}`, {
      status: data.status,
    })
    return toTask(response.data)
  }

  async deleteTask(id: string): Promise<void> {
    void id
    throw new Error('Task deletion is not supported by the backend API yet')
  }

  async getTaskStats(): Promise<TaskStats> {
    const response = await this.getTasks()
    return buildStats(response.tasks)
  }

  async bulkUpdateStatus(taskIds: string[], status: TaskStatus): Promise<Task[]> {
    return Promise.all(taskIds.map((id) => this.updateTask(id, { status })))
  }
}

export const taskService = new ApiTaskService()
