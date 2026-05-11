import apiClient from '@/services/api/client'
import { MessageRole, MessageStatus } from '../types'
import type {
  ChatConversation,
  ChatMessage,
  CreateConversationRequest,
  GetConversationsQuery,
  GetConversationsResponse,
  GetMessagesQuery,
  SendMessageRequest,
  SendMessageResponse,
} from '../types'

type ApiMessage = {
  id: string
  conversationId: string
  content: string
  role: 'user' | 'assistant' | 'system'
  createdAt: string
}

type ApiConversation = {
  id: string
  title: string | null
  createdAt: string
  messages?: ApiMessage[]
  _count?: {
    messages: number
  }
}

type ApiSendMessageResponse = {
  conversationId: string
  answer: string
  confidence: number
  sourcesCount: number
  taskCreated: boolean
  userMessage: ApiMessage
  assistantMessage: ApiMessage
}

function toMessage(message: ApiMessage): ChatMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    role: message.role as MessageRole,
    status: MessageStatus.SENT,
    createdAt: message.createdAt,
  }
}

function toConversation(conversation: ApiConversation): ChatConversation {
  const messages = conversation.messages || []
  const lastMessage = messages[messages.length - 1]?.content

  return {
    id: conversation.id,
    title: conversation.title || 'New Chat',
    createdAt: conversation.createdAt,
    updatedAt: messages[messages.length - 1]?.createdAt || conversation.createdAt,
    lastMessage,
    messageCount: conversation._count?.messages ?? messages.length,
  }
}

class ApiChatService {
  async getConversations(
    query: GetConversationsQuery = {},
  ): Promise<GetConversationsResponse> {
    const response = await apiClient.get<ApiConversation[]>('/chat')
    let conversations = response.data.map(toConversation)

    if (query.search) {
      const search = query.search.toLowerCase()
      conversations = conversations.filter(
        (conversation) =>
          conversation.title.toLowerCase().includes(search) ||
          conversation.lastMessage?.toLowerCase().includes(search),
      )
    }

    conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )

    return {
      conversations,
      totalCount: conversations.length,
    }
  }

  async getMessages(query: GetMessagesQuery): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiConversation>(`/chat/${query.conversationId}`)
    return (response.data.messages || []).map(toMessage)
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiClient.post<ApiSendMessageResponse>('/chat', {
      conversationId: request.conversationId,
      message: request.content,
    })

    return {
      userMessage: toMessage(response.data.userMessage),
      assistantMessage: toMessage(response.data.assistantMessage),
    }
  }

  async createConversation(
    request: CreateConversationRequest = {},
  ): Promise<ChatConversation> {
    const response = await apiClient.post<ApiConversation>('/chat/conversations', request)
    return toConversation(response.data)
  }

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/chat/${id}`)
  }
}

export const chatService = new ApiChatService()
