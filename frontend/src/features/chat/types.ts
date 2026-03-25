// Chat Domain Types

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export type MessageRole = typeof MessageRole[keyof typeof MessageRole];

export const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  ERROR: 'error',
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

// Source/citation from RAG pipeline
export interface ChatSource {
  id: string
  documentName: string
  chunkContent: string
  relevanceScore: number
}

// Main Message Interface
export interface ChatMessage {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  status: MessageStatus
  createdAt: string
  confidenceScore?: number
  sources?: ChatSource[]
}

// Conversation Interface
export interface ChatConversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessage?: string
  messageCount: number
}

// Query / Response Types
export interface GetConversationsQuery {
  search?: string
}

export interface GetConversationsResponse {
  conversations: ChatConversation[]
  totalCount: number
}

export interface GetMessagesQuery {
  conversationId: string
}

export interface SendMessageRequest {
  conversationId: string
  content: string
}

export interface SendMessageResponse {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}

export interface CreateConversationRequest {
  title?: string
}

// Role display config
export const MESSAGE_ROLE_CONFIG = {
  [MessageRole.USER]: {
    label: 'You',
    color: 'primary',
  },
  [MessageRole.ASSISTANT]: {
    label: 'AI Assistant',
    color: 'muted',
  },
  [MessageRole.SYSTEM]: {
    label: 'System',
    color: 'gray',
  },
} as const;
