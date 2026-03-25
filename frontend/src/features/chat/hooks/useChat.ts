import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chat.service'
import type {
  ChatMessage,
  GetConversationsQuery,
  GetConversationsResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types'
import { MessageRole, MessageStatus } from '../types'

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversationList: (query: GetConversationsQuery) => [...chatKeys.conversations(), query] as const,
  messages: () => [...chatKeys.all, 'messages'] as const,
  messageList: (conversationId: string) => [...chatKeys.messages(), conversationId] as const,
}

// --- Query Hooks ---

export const useConversations = (query: GetConversationsQuery = {}) => {
  return useQuery({
    queryKey: chatKeys.conversationList(query),
    queryFn: () => chatService.getConversations(query),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messageList(conversationId || ''),
    queryFn: () => chatService.getMessages({ conversationId: conversationId! }),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  })
}

// --- Mutation Hooks ---

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SendMessageRequest) => chatService.sendMessage(request),
    onMutate: async (request) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: chatKeys.messageList(request.conversationId),
      })

      // Snapshot previous messages
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(
        chatKeys.messageList(request.conversationId),
      )

      // Optimistically add the user message
      const optimisticUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: request.conversationId,
        role: MessageRole.USER,
        content: request.content,
        status: MessageStatus.SENDING,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messageList(request.conversationId),
        (old) => [...(old || []), optimisticUserMessage],
      )

      return { previousMessages }
    },
    onSuccess: (data: SendMessageResponse) => {
      // Replace optimistic messages with real ones
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messageList(data.userMessage.conversationId),
        (old) => {
          if (!old) return [data.userMessage, data.assistantMessage]
          // Remove the temp message, add real user + assistant messages
          const filtered = old.filter((m) => !m.id.startsWith('temp-'))
          return [...filtered, data.userMessage, data.assistantMessage]
        },
      )

      // Refresh the conversation list to update lastMessage / messageCount
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (_error, request, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messageList(request.conversationId),
          context.previousMessages,
        )
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
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() })

      const previousConversations = queryClient.getQueriesData({
        queryKey: chatKeys.conversations(),
      })

      // Optimistically remove from all conversation list caches
      previousConversations.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'conversations' in data) {
          const listData = data as GetConversationsResponse
          queryClient.setQueryData(queryKey, {
            ...listData,
            conversations: listData.conversations.filter((c) => c.id !== id),
            totalCount: listData.totalCount - 1,
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
      queryClient.removeQueries({ queryKey: chatKeys.messageList(id) })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}
