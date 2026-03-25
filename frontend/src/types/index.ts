// Auth Types
export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  tenantName: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// Tenant Types
export interface Tenant {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

// PRD Task Types
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface PrdTask {
  id: string
  title: string
  module: string
  status: TaskStatus
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  module: string
}

export interface UpdateTaskRequest {
  status: TaskStatus
}

// Document Types
export interface Document {
  id: string
  title: string
  tenantId: string
  createdAt: string
  updatedAt: string
  _count?: {
    chunks: number
  }
}

// Chat Types
export interface Message {
  id: string
  conversationId: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

export interface Conversation {
  id: string
  title: string | null
  tenantId: string
  createdAt: string
  messages?: Message[]
  _count?: {
    messages: number
  }
}

export interface SendMessageRequest {
  message: string
  conversationId?: string
}

export interface ChatResponse {
  conversationId: string
  answer: string
  confidence: number
  sourcesCount: number
  taskCreated: boolean
}

// RAG Types
export interface AskQuestionRequest {
  question: string
}

export interface RagResponse {
  answer: string
  confidence: number
  sourcesCount: number
  taskCreated: boolean
}

// Dashboard Stats
export interface DashboardStats {
  taskCount: number
  documentCount: number
  conversationCount: number
  pendingTasks: number
  completedTasks: number
}
