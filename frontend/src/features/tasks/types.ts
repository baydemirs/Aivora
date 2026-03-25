// Task Domain Types

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  REVIEW: 'review',
  DONE: 'done',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export const TaskModule = {
  AUTH: 'auth',
  RAG: 'rag',
  CHAT: 'chat',
  KNOWLEDGE_BASE: 'knowledge-base',
  DASHBOARD: 'dashboard',
  API: 'api',
  INFRASTRUCTURE: 'infrastructure',
} as const;

export type TaskModule = typeof TaskModule[keyof typeof TaskModule];

// Main Task Interface
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  module: string
  assigneeId?: string
  assigneeName?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  tenantId: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  metadata?: Record<string, any>
}

// Task Statistics
export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  blocked: number
  review: number
  done: number
  byPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  byModule: Record<string, number>
}

// Task Filters
export interface TaskFilters {
  searchQuery: string
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  module?: string | 'all'
  assignee?: string | 'all'
  sortBy: TaskSortBy
  sortOrder: 'asc' | 'desc'
}

export const TaskSortBy = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  TITLE: 'title',
  PRIORITY: 'priority',
  STATUS: 'status',
} as const;

export type TaskSortBy = typeof TaskSortBy[keyof typeof TaskSortBy];

// API Request/Response Types
export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  module: string
  assigneeId?: string
  estimatedHours?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  module?: string
  assigneeId?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface GetTasksQuery {
  page?: number
  limit?: number
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  module?: string
  assignee?: string
  sortBy?: TaskSortBy
  sortOrder?: 'asc' | 'desc'
}

export interface GetTasksResponse {
  tasks: Task[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

// UI Component Types
export interface TaskTableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface TaskActionDropdownItem {
  label: string
  onClick: (task: Task) => void
  icon?: React.ComponentType
  variant?: 'default' | 'destructive'
}

// Status and Priority Configurations
export const TASK_STATUS_CONFIG = {
  [TaskStatus.TODO]: {
    label: 'To Do',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: 'circle',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'play',
  },
  [TaskStatus.BLOCKED]: {
    label: 'Blocked',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'alert-circle',
  },
  [TaskStatus.REVIEW]: {
    label: 'Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'eye',
  },
  [TaskStatus.DONE]: {
    label: 'Done',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'check-circle',
  },
} as const

export const TASK_PRIORITY_CONFIG = {
  [TaskPriority.LOW]: {
    label: 'Low',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    weight: 1,
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    weight: 2,
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    weight: 3,
  },
  [TaskPriority.URGENT]: {
    label: 'Urgent',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    weight: 4,
  },
} as const

export const TASK_MODULE_CONFIG = {
  [TaskModule.AUTH]: {
    label: 'Authentication',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  [TaskModule.RAG]: {
    label: 'RAG Pipeline',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  [TaskModule.CHAT]: {
    label: 'Chat System',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  [TaskModule.KNOWLEDGE_BASE]: {
    label: 'Knowledge Base',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  [TaskModule.DASHBOARD]: {
    label: 'Dashboard',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
  },
  [TaskModule.API]: {
    label: 'API',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
  },
  [TaskModule.INFRASTRUCTURE]: {
    label: 'Infrastructure',
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-800',
  },
} as const