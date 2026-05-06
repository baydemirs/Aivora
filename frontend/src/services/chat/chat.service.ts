import apiClient from '@/services/api/client'
import type { Conversation, SendMessageRequest, ChatResponse } from '@/types'

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<Conversation[]>('/chat')
    return response.data
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/chat/${id}`)
    return response.data
  },

  sendMessage: async (data: SendMessageRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/chat/send', data)
    return response.data
  },
}
