import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chat.service'
import { appQueryKeys } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/use-auth'
import type {
  ChatMessage,
  GetConversationsQuery,
  GetConversationsResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types'
import { MessageRole, MessageStatus } from '../types'

export const chatKeys = {
  all: appQueryKeys.chat.all,
  conversations: appQueryKeys.chat.conversations,
  conversationList: (query: GetConversationsQuery) =>
    appQueryKeys.chat.conversationList(query as unknown as Record<string, unknown>),
  messages: appQueryKeys.chat.messages,
  messageList: appQueryKeys.chat.messageList,
}

export const useConversations = (query: GetConversationsQuery = {}) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...chatKeys.conversationList(query), tenantScope],
    queryFn: () => chatService.getConversations(query),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...chatKeys.messageList(conversationId || ''), tenantScope],
    queryFn: () => chatService.getMessages({ conversationId: conversationId || '' }),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useMutation({
    mutationFn: (request: SendMessageRequest) => chatService.sendMessage(request),
    onMutate: async (request) => {
      const cacheKey = [...chatKeys.messageList(request.conversationId || ''), tenantScope] as const

      await queryClient.cancelQueries({ queryKey: cacheKey })
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(cacheKey)

      const optimisticUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: request.conversationId || '',
        role: MessageRole.USER,
        content: request.content,
        status: MessageStatus.SENDING,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<ChatMessage[]>(cacheKey, (old) => [
        ...(old || []),
        optimisticUserMessage,
      ])

      return { previousMessages, cacheKey }
    },
    onSuccess: (data: SendMessageResponse, request) => {
      const originalKey = [...chatKeys.messageList(request.conversationId || ''), tenantScope] as const
      const actualKey = [...chatKeys.messageList(data.conversationId), tenantScope] as const

      queryClient.setQueryData<ChatMessage[]>(actualKey, (old) => {
        const base = old ?? queryClient.getQueryData<ChatMessage[]>(originalKey) ?? []
        const filtered = base.filter((m) => !m.id.startsWith('temp-'))
        return [...filtered, data.userMessage, data.assistantMessage]
      })

      if (originalKey[2] !== actualKey[2]) {
        queryClient.removeQueries({ queryKey: originalKey })
      }

      queryClient.invalidateQueries({ queryKey: actualKey })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
    },
    onError: (_error, _request, context) => {
      if (context?.cacheKey) {
        queryClient.setQueryData(context.cacheKey, context.previousMessages)
      }
    },
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title?: string) =>
      chatService.createConversation(title ? { title } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() })

      const previousConversations = queryClient.getQueriesData({
        queryKey: chatKeys.conversations(),
      })

      previousConversations.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'conversations' in data) {
          const listData = data as GetConversationsResponse
          queryClient.setQueryData(queryKey, {
            ...listData,
            conversations: listData.conversations.filter((c) => c.id !== id),
            totalCount: Math.max(0, listData.totalCount - 1),
          })
        }
      })

      return { previousConversations }
    },
    onError: (_error, _id, context) => {
      if (context?.previousConversations) {
        context.previousConversations.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: [...chatKeys.messageList(id), tenantScope] })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
    },
  })
}
