import apiClient from '@/services/api/client'
import { env } from '@/config/env'
import axios from 'axios'
import { AppError, toAppError } from '@/lib/errors'
import {
  MessageRole,
  MessageStatus,
  type ChatConversation,
  type ChatMessage,
  type CreateConversationRequest,
  type GetConversationsQuery,
  type GetConversationsResponse,
  type GetMessagesQuery,
  type SendMessageRequest,
  type SendMessageResponse,
} from '../types'
import {
  apiConversationToConversation,
  apiMessageToMessage,
  type ApiConversation,
} from '../mappers/chat.mapper'
import { getCurrentTenantId, isTenantScopedRecord } from '@/utils/tenant'

interface SendMessageApiResponse {
  conversationId: string
  answer: string
  confidence: number
  sourcesCount: number
  taskCreated: boolean
}

const draftPrefix = 'draft-'

const isDraftId = (id: string | undefined) => !!id && id.startsWith(draftPrefix)

class RealChatService {
  async getConversations(query: GetConversationsQuery = {}): Promise<GetConversationsResponse> {
    const tenantId = getCurrentTenantId()
    let response
    try {
      response = await apiClient.get<ApiConversation[]>('/chat', {
        params: { search: query.search },
      })
    } catch (error) {
      throw toAppError(error, 'Failed to fetch conversations')
    }

    let conversations = response.data
      .filter((conv) => isTenantScopedRecord(conv.tenantId, tenantId))
      .map(apiConversationToConversation)
    if (query.search) {
      const needle = query.search.toLowerCase()
      conversations = conversations.filter(
        (conv) =>
          conv.title.toLowerCase().includes(needle) ||
          conv.lastMessage?.toLowerCase().includes(needle),
      )
    }

    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return { conversations, totalCount: conversations.length }
  }

  async getMessages(query: GetMessagesQuery): Promise<ChatMessage[]> {
    if (isDraftId(query.conversationId)) return []
    const tenantId = getCurrentTenantId()
    let response
    try {
      response = await apiClient.get<ApiConversation>(`/chat/${query.conversationId}`)
    } catch (error) {
      throw toAppError(error, 'Failed to fetch messages')
    }
    if (!isTenantScopedRecord(response.data.tenantId, tenantId)) return []
    const messages = (response.data.messages || []).map(apiMessageToMessage)
    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const trimmed = request.content.trim()
    if (!trimmed) throw new AppError('validation', 'Message cannot be empty')

    const payload = {
      message: trimmed,
      conversationId:
        request.conversationId && !isDraftId(request.conversationId)
          ? request.conversationId
          : undefined,
    }

    let response
    try {
      response = await apiClient.post<SendMessageApiResponse>('/chat', payload)
    } catch (error) {
      throw toAppError(error, 'Failed to send message')
    }
    const conversationId = response.data.conversationId
    if (!conversationId) {
      throw new AppError('unknown', 'Conversation id is missing in chat response')
    }
    const now = new Date().toISOString()

    return {
      conversationId,
      userMessage: {
        id: `tmp-user-${Date.now()}`,
        conversationId,
        role: MessageRole.USER,
        content: trimmed,
        status: MessageStatus.SENT,
        createdAt: now,
      },
      assistantMessage: {
        id: `tmp-assistant-${Date.now() + 1}`,
        conversationId,
        role: MessageRole.ASSISTANT,
        content: response.data.answer || 'No response generated.',
        status: MessageStatus.SENT,
        createdAt: now,
        confidenceScore: response.data.confidence,
      },
    }
  }

  async createConversation(request: CreateConversationRequest = {}): Promise<ChatConversation> {
    const now = new Date().toISOString()
    // Backend conversation creation happens when first message is sent.
    return {
      id: `${draftPrefix}${Date.now()}`,
      title: request.title || 'New Chat',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    }
  }

  async deleteConversation(id: string): Promise<void> {
    if (isDraftId(id)) return
    try {
      await apiClient.delete(`/chat/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 404 || status === 405) {
          throw new AppError('unsupported', 'Conversation deletion is not supported by this backend yet')
        }
      }
      throw toAppError(error, 'Conversation deletion failed')
    }
  }
}

class MockChatService {
  private conversations: ChatConversation[] = [
    {
      id: 'conv-1',
      title: 'How to implement RAG?',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:01:00Z',
      lastMessage: 'How do I implement RAG in our application?',
      messageCount: 2,
    },
  ]

  private messages: Record<string, ChatMessage[]> = {
    'conv-1': [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: MessageRole.USER,
        content: 'How do I implement RAG in our application?',
        status: MessageStatus.SENT,
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: MessageRole.ASSISTANT,
        content: 'Use retrieval + generation pipeline.',
        status: MessageStatus.SENT,
        createdAt: '2024-01-20T10:00:30Z',
      },
    ],
  }

  async getConversations(query: GetConversationsQuery = {}): Promise<GetConversationsResponse> {
    let filtered = [...this.conversations]
    if (query.search) {
      const needle = query.search.toLowerCase()
      filtered = filtered.filter(
        (c) => c.title.toLowerCase().includes(needle) || c.lastMessage?.toLowerCase().includes(needle),
      )
    }
    return { conversations: filtered, totalCount: filtered.length }
  }

  async getMessages(query: GetMessagesQuery): Promise<ChatMessage[]> {
    return this.messages[query.conversationId] || []
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const conversationId = request.conversationId && !isDraftId(request.conversationId)
      ? request.conversationId
      : `conv-${Date.now()}`
    if (!this.messages[conversationId]) this.messages[conversationId] = []

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: MessageRole.USER,
      content: request.content,
      status: MessageStatus.SENT,
      createdAt: new Date().toISOString(),
    }
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      conversationId,
      role: MessageRole.ASSISTANT,
      content: 'Mock response',
      status: MessageStatus.SENT,
      createdAt: new Date().toISOString(),
      confidenceScore: 0.85,
    }

    this.messages[conversationId].push(userMessage, assistantMessage)
    const conversation = this.conversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.updatedAt = new Date().toISOString()
      conversation.lastMessage = request.content
      conversation.messageCount = this.messages[conversationId].length
    } else {
      this.conversations.unshift({
        id: conversationId,
        title: request.content.slice(0, 50),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: request.content,
        messageCount: 2,
      })
    }

    return { conversationId, userMessage, assistantMessage }
  }

  async createConversation(request: CreateConversationRequest = {}): Promise<ChatConversation> {
    const id = `${draftPrefix}${Date.now()}`
    const conversation: ChatConversation = {
      id,
      title: request.title || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    }
    this.conversations.unshift(conversation)
    this.messages[id] = []
    return conversation
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations = this.conversations.filter((c) => c.id !== id)
    delete this.messages[id]
  }
}

export const chatService = env.enableMockApi ? new MockChatService() : new RealChatService()
