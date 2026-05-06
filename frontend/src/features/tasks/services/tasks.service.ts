import {
  TaskStatus,
  TaskPriority,
  TaskModule,
  TaskSortBy
} from '../types'
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  GetTasksQuery,
  GetTasksResponse,
  TaskStats
} from '../types'

// Mock data
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Implement JWT Authentication',
    description: 'Set up JWT authentication with refresh tokens, middleware validation, and secure cookie handling.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    module: TaskModule.AUTH,
    assigneeId: 'user1',
    assigneeName: 'Alex Morgan',
    estimatedHours: 8,
    actualHours: 10,
    tags: ['jwt', 'security', 'backend'],
    tenantId: 'tenant1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    completedAt: '2024-01-18T14:30:00Z',
    metadata: { complexity: 'medium', epic: 'user-management' }
  },
  {
    id: '2',
    title: 'Setup RAG Pipeline with Vector Database',
    description: 'Implement document embedding pipeline using OpenAI embeddings and Pinecone vector database for semantic search.',
    status: TaskStatus.DONE,
    priority: TaskPriority.URGENT,
    module: TaskModule.RAG,
    assigneeId: 'user2',
    assigneeName: 'Sarah Chen',
    estimatedHours: 16,
    actualHours: 20,
    tags: ['rag', 'embeddings', 'vector-db', 'ai'],
    tenantId: 'tenant1',
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
    completedAt: '2024-01-25T11:00:00Z',
    metadata: { complexity: 'high', epic: 'knowledge-system' }
  },
  {
    id: '3',
    title: 'Integrate OpenAI Chat Completion API',
    description: 'Set up streaming chat completion with context management, conversation history, and error handling.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    module: TaskModule.CHAT,
    assigneeId: 'user1',
    assigneeName: 'Alex Morgan',
    estimatedHours: 12,
    actualHours: 8,
    tags: ['openai', 'chat', 'streaming', 'api'],
    tenantId: 'tenant1',
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-26T16:45:00Z',
    metadata: { complexity: 'medium', epic: 'chat-system' }
  },
  {
    id: '4',
    title: 'Create Document Upload & Processing',
    description: 'Build file upload system with PDF/DOCX parsing, chunking strategy, and metadata extraction.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.MEDIUM,
    module: TaskModule.KNOWLEDGE_BASE,
    assigneeId: 'user3',
    assigneeName: 'Mike Johnson',
    estimatedHours: 10,
    actualHours: 12,
    tags: ['upload', 'pdf', 'parsing', 'chunking'],
    tenantId: 'tenant1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-27T09:30:00Z',
    metadata: { complexity: 'medium', epic: 'knowledge-system' }
  },
  {
    id: '5',
    title: 'Add Conversation History Management',
    description: 'Implement conversation persistence, search, and organization features with pagination.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    module: TaskModule.CHAT,
    assigneeId: 'user2',
    assigneeName: 'Sarah Chen',
    estimatedHours: 6,
    tags: ['history', 'persistence', 'search'],
    tenantId: 'tenant1',
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
    metadata: { complexity: 'low', epic: 'chat-system' }
  },
  {
    id: '6',
    title: 'Dashboard Analytics Implementation',
    description: 'Build comprehensive analytics dashboard with charts, KPIs, and real-time updates.',
    status: TaskStatus.BLOCKED,
    priority: TaskPriority.LOW,
    module: TaskModule.DASHBOARD,
    assigneeId: 'user3',
    assigneeName: 'Mike Johnson',
    estimatedHours: 20,
    actualHours: 5,
    tags: ['analytics', 'charts', 'dashboard', 'real-time'],
    tenantId: 'tenant1',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
    metadata: {
      complexity: 'high',
      epic: 'analytics',
      blockingReason: 'Waiting for analytics service API specs'
    }
  },
  {
    id: '7',
    title: 'API Rate Limiting & Security',
    description: 'Implement rate limiting, request validation, and security headers for all API endpoints.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    module: TaskModule.API,
    estimatedHours: 8,
    tags: ['security', 'rate-limiting', 'validation'],
    tenantId: 'tenant1',
    createdAt: '2024-01-23T14:00:00Z',
    updatedAt: '2024-01-23T14:00:00Z',
    metadata: { complexity: 'medium', epic: 'security' }
  },
  {
    id: '8',
    title: 'Docker Containerization & CI/CD',
    description: 'Set up Docker containers, GitHub Actions workflows, and deployment automation.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    module: TaskModule.INFRASTRUCTURE,
    assigneeId: 'user1',
    assigneeName: 'Alex Morgan',
    estimatedHours: 12,
    actualHours: 6,
    tags: ['docker', 'ci-cd', 'deployment', 'automation'],
    tenantId: 'tenant1',
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-29T12:00:00Z',
    metadata: { complexity: 'medium', epic: 'infrastructure' }
  }
]

type SortableTaskValue = string | number | undefined

const priorityWeights: Record<TaskPriority, number> = {
  [TaskPriority.LOW]: 1,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.HIGH]: 3,
  [TaskPriority.URGENT]: 4,
}

function getSortableTaskValue(task: Task, sortBy: TaskSortBy): SortableTaskValue {
  if (sortBy === TaskSortBy.PRIORITY) {
    return priorityWeights[task.priority]
  }

  const value = task[sortBy]

  if (typeof value === 'string') {
    return value.toLowerCase()
  }

  if (typeof value === 'number') {
    return value
  }

  return undefined
}

function compareSortableValues(a: SortableTaskValue, b: SortableTaskValue): number {
  if (a === b) return 0
  if (a === undefined) return 1
  if (b === undefined) return -1
  return a > b ? 1 : -1
}

class MockTaskService {
  private tasks: Task[] = [...MOCK_TASKS]
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  async getTasks(query: GetTasksQuery = {}): Promise<GetTasksResponse> {
    await this.delay(300) // Simulate API delay

    const {
      page = 1,
      limit = 50,
      search = '',
      status,
      priority,
      module,
      assignee,
      sortBy = TaskSortBy.UPDATED_AT,
      sortOrder = 'desc'
    } = query

    let filteredTasks = [...this.tasks]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Status filter
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status)
    }

    // Priority filter
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority)
    }

    // Module filter
    if (module) {
      filteredTasks = filteredTasks.filter(task => task.module === module)
    }

    // Assignee filter
    if (assignee) {
      filteredTasks = filteredTasks.filter(task => task.assigneeId === assignee)
    }

    // Sorting
    filteredTasks.sort((a, b) => {
      const comparison = compareSortableValues(
        getSortableTaskValue(a, sortBy),
        getSortableTaskValue(b, sortBy),
      )

      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Pagination
    const totalCount = filteredTasks.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

    return {
      tasks: paginatedTasks,
      totalCount,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    await this.delay(200)
    return this.tasks.find(task => task.id === id) || null
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    await this.delay(500)

    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...data,
      status: TaskStatus.TODO,
      tenantId: 'tenant1', // Would come from auth context in real app
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.tasks.unshift(newTask)
    return newTask
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    await this.delay(400)

    const taskIndex = this.tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString(),
      ...(data.status === TaskStatus.DONE && !this.tasks[taskIndex].completedAt
        ? { completedAt: new Date().toISOString() }
        : {}),
      ...(data.status !== TaskStatus.DONE
        ? { completedAt: undefined }
        : {})
    }

    this.tasks[taskIndex] = updatedTask
    return updatedTask
  }

  async deleteTask(id: string): Promise<void> {
    await this.delay(300)

    const taskIndex = this.tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    this.tasks.splice(taskIndex, 1)
  }

  async getTaskStats(): Promise<TaskStats> {
    await this.delay(200)

    const stats: TaskStats = {
      total: this.tasks.length,
      todo: this.tasks.filter(t => t.status === TaskStatus.TODO).length,
      inProgress: this.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      blocked: this.tasks.filter(t => t.status === TaskStatus.BLOCKED).length,
      review: this.tasks.filter(t => t.status === TaskStatus.REVIEW).length,
      done: this.tasks.filter(t => t.status === TaskStatus.DONE).length,
      byPriority: {
        low: this.tasks.filter(t => t.priority === TaskPriority.LOW).length,
        medium: this.tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
        high: this.tasks.filter(t => t.priority === TaskPriority.HIGH).length,
        urgent: this.tasks.filter(t => t.priority === TaskPriority.URGENT).length,
      },
      byModule: {}
    }

    // Calculate module stats dynamically
    this.tasks.forEach(task => {
      stats.byModule[task.module] = (stats.byModule[task.module] || 0) + 1
    })

    return stats
  }

  // Utility method to reset mock data (useful for testing)
  resetData(): void {
    this.tasks = [...MOCK_TASKS]
  }

  // Batch operations
  async bulkUpdateStatus(taskIds: string[], status: TaskStatus): Promise<Task[]> {
    await this.delay(600)

    const updatedTasks: Task[] = []

    for (const id of taskIds) {
      try {
        const updatedTask = await this.updateTask(id, { status })
        updatedTasks.push(updatedTask)
      } catch (error) {
        // Skip tasks that don't exist
        console.warn(`Failed to update task ${id}:`, error)
      }
    }

    return updatedTasks
  }
}

// Singleton instance
export const taskService = new MockTaskService()

// Export for use in real API integration later
export const createTaskService = () => ({
  getTasks: taskService.getTasks.bind(taskService),
  getTaskById: taskService.getTaskById.bind(taskService),
  createTask: taskService.createTask.bind(taskService),
  updateTask: taskService.updateTask.bind(taskService),
  deleteTask: taskService.deleteTask.bind(taskService),
  getTaskStats: taskService.getTaskStats.bind(taskService),
  bulkUpdateStatus: taskService.bulkUpdateStatus.bind(taskService),
})
