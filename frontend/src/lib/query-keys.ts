export const appQueryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => ['dashboard', 'summary'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    lists: () => ['tasks', 'list'] as const,
    list: (query: Record<string, unknown>) => ['tasks', 'list', query] as const,
    details: () => ['tasks', 'detail'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    stats: () => ['tasks', 'stats'] as const,
  },
  documents: {
    all: ['documents'] as const,
    lists: () => ['documents', 'list'] as const,
    list: (query: Record<string, unknown>) => ['documents', 'list', query] as const,
    details: () => ['documents', 'detail'] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
    stats: () => ['documents', 'stats'] as const,
  },
  chat: {
    all: ['chat'] as const,
    conversations: () => ['chat', 'conversations'] as const,
    conversationList: (query: Record<string, unknown>) =>
      ['chat', 'conversations', query] as const,
    messages: () => ['chat', 'messages'] as const,
    messageList: (conversationId: string) => ['chat', 'messages', conversationId] as const,
  },
} as const
