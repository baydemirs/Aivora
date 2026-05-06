import { MessageRole, MessageStatus, type ChatConversation, type ChatMessage } from '../types'

export interface ApiConversation {
  id: string
  title: string | null
  tenantId?: string
  createdAt: string
  updatedAt?: string
  messages?: ApiMessage[]
  _count?: {
    messages?: number
  }
}

export interface ApiMessage {
  id: string
  conversationId: string
  content: string
  role: string
  createdAt: string
}

const mapRole = (role: string): ChatMessage['role'] => {
  if (role === 'assistant') return MessageRole.ASSISTANT
  if (role === 'system') return MessageRole.SYSTEM
  return MessageRole.USER
}

export const apiMessageToMessage = (msg: ApiMessage): ChatMessage => ({
  id: msg.id,
  conversationId: msg.conversationId,
  role: mapRole(msg.role),
  content: msg.content || '',
  status: MessageStatus.SENT,
  createdAt: msg.createdAt,
})

export const apiConversationToConversation = (conv: ApiConversation): ChatConversation => {
  const mappedMessages = (conv.messages || []).map(apiMessageToMessage)
  const last = mappedMessages[mappedMessages.length - 1]
  return {
    id: conv.id,
    title: conv.title || 'New Chat',
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt || conv.createdAt,
    lastMessage: last?.content,
    messageCount: conv._count?.messages ?? mappedMessages.length,
  }
}
