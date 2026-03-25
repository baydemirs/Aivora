import {
  MessageRole,
  MessageStatus,
} from '../types'
import type {
  ChatMessage,
  ChatConversation,
  ChatSource,
  GetConversationsQuery,
  GetConversationsResponse,
  GetMessagesQuery,
  SendMessageRequest,
  SendMessageResponse,
  CreateConversationRequest,
} from '../types'

// --- Mock Data ---

const MOCK_SOURCES: ChatSource[] = [
  {
    id: 'src-1',
    documentName: 'Product Requirements Document.pdf',
    chunkContent: 'The RAG pipeline should embed documents in 512-token chunks with 50-token overlap…',
    relevanceScore: 0.94,
  },
  {
    id: 'src-2',
    documentName: 'Technical Architecture Overview.docx',
    chunkContent: 'Vector search is performed using cosine similarity against the Qdrant collection…',
    relevanceScore: 0.87,
  },
]

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
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
      content:
        'RAG (Retrieval-Augmented Generation) combines document retrieval with language model generation. Here\'s a step-by-step approach:\n\n**1. Document Processing**\nSplit your documents into chunks (500-1000 tokens) and create embeddings using OpenAI\'s `text-embedding-3-small` model.\n\n**2. Vector Storage**\nStore embeddings in a vector database like Qdrant for efficient similarity search.\n\n**3. Query Pipeline**\nWhen a user asks a question:\n- Convert the question to an embedding\n- Search for the top-K similar chunks\n- Pass the retrieved chunks as context to the LLM\n\n**4. Response Generation**\nThe LLM generates an answer grounded in your documents, reducing hallucination.\n\nWould you like more details on any specific step?',
      status: MessageStatus.SENT,
      createdAt: '2024-01-20T10:00:30Z',
      confidenceScore: 0.92,
      sources: MOCK_SOURCES,
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      role: MessageRole.USER,
      content: 'Yes, can you explain the embedding process in more detail?',
      status: MessageStatus.SENT,
      createdAt: '2024-01-20T10:01:00Z',
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      role: MessageRole.ASSISTANT,
      content:
        'The embedding process converts text into numerical vectors that capture semantic meaning:\n\n**Step 1: Text Chunking**\n- Split documents into smaller chunks (typically 500-1000 tokens)\n- Maintain overlap between chunks for context continuity\n\n**Step 2: Embedding Generation**\n```typescript\nconst embedding = await openai.embeddings.create({\n  model: "text-embedding-3-small",\n  input: chunkText,\n});\n```\n\n**Step 3: Vector Storage**\n- Store embeddings with metadata (document ID, chunk position)\n- Index vectors for fast similarity search\n\nThe resulting vectors allow semantic search — finding relevant content based on meaning rather than exact keyword matches.',
      status: MessageStatus.SENT,
      createdAt: '2024-01-20T10:01:30Z',
      confidenceScore: 0.95,
      sources: [MOCK_SOURCES[0]],
    },
  ],
  'conv-2': [
    {
      id: 'msg-5',
      conversationId: 'conv-2',
      role: MessageRole.USER,
      content: 'What are the best practices for JWT authentication?',
      status: MessageStatus.SENT,
      createdAt: '2024-01-19T14:30:00Z',
    },
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      role: MessageRole.ASSISTANT,
      content:
        'Here are key best practices for JWT authentication:\n\n1. **Use short-lived access tokens** (15-30 minutes)\n2. **Implement refresh token rotation** — issue a new refresh token with each use\n3. **Store tokens securely** — HttpOnly cookies for web apps, secure storage for mobile\n4. **Validate all claims** — check `exp`, `iss`, `aud` on every request\n5. **Use strong signing algorithms** — prefer RS256 over HS256 for production\n6. **Implement token revocation** — maintain a blacklist or use short expiry + refresh\n\nNever store sensitive data in the JWT payload since it\'s only base64-encoded, not encrypted.',
      status: MessageStatus.SENT,
      createdAt: '2024-01-19T14:30:45Z',
      confidenceScore: 0.88,
    },
  ],
  'conv-3': [
    {
      id: 'msg-7',
      conversationId: 'conv-3',
      role: MessageRole.USER,
      content: 'How should we design the database schema for multi-tenancy?',
      status: MessageStatus.SENT,
      createdAt: '2024-01-18T09:00:00Z',
    },
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      role: MessageRole.ASSISTANT,
      content:
        'For multi-tenant SaaS applications, there are three main approaches:\n\n**1. Shared Database, Shared Schema** (recommended for most SaaS)\n- Add a `tenantId` column to every table\n- Use Row-Level Security (RLS) policies\n- Most cost-effective, easiest to maintain\n\n**2. Shared Database, Separate Schemas**\n- Each tenant gets its own schema\n- Better isolation, moderate overhead\n\n**3. Separate Databases**\n- Maximum isolation\n- Highest operational cost\n\nFor Aivora, we use approach #1 with Prisma and PostgreSQL RLS. Every query is automatically scoped to the authenticated tenant.',
      status: MessageStatus.SENT,
      createdAt: '2024-01-18T09:01:00Z',
      confidenceScore: 0.91,
      sources: [MOCK_SOURCES[1]],
    },
  ],
}

const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'How to implement RAG?',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:01:30Z',
    lastMessage: 'Yes, can you explain the embedding process in more detail?',
    messageCount: 4,
  },
  {
    id: 'conv-2',
    title: 'Authentication best practices',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-19T14:30:45Z',
    lastMessage: 'What are the best practices for JWT authentication?',
    messageCount: 2,
  },
  {
    id: 'conv-3',
    title: 'Database schema design',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:01:00Z',
    lastMessage: 'How should we design the database schema for multi-tenancy?',
    messageCount: 2,
  },
]

// --- AI Response Templates ---

const AI_RESPONSES = [
  'Based on your knowledge base documents, here\'s what I found:\n\nThe recommended approach involves setting up a modular pipeline with clear separation of concerns. Each component should be independently testable and replaceable.\n\nKey considerations:\n- **Scalability**: Design for horizontal scaling from the start\n- **Error Handling**: Implement retry logic with exponential backoff\n- **Monitoring**: Add observability at each pipeline stage\n\nWould you like me to elaborate on any of these points?',
  'That\'s a great question. Let me analyze the relevant documents:\n\nAccording to the technical architecture overview, the best practice is to use a layered architecture where each layer has clearly defined responsibilities.\n\n**Data Layer**: Handles persistence and caching\n**Service Layer**: Contains business logic and validations\n**API Layer**: Manages request/response handling and authentication\n\nThis separation makes the system easier to test, maintain, and extend.',
  'I found several relevant sections in your documentation:\n\nThe implementation should follow these principles:\n\n1. **Type Safety**: Use TypeScript strictly — avoid `any` types\n2. **Modular Design**: Each feature should be self-contained\n3. **API-First**: Design the API contracts before implementation\n4. **Testing**: Write tests alongside the code, not after\n\nShall I provide code examples for any of these?',
]

// --- Service Class ---

class MockChatService {
  private conversations: ChatConversation[] = [...MOCK_CONVERSATIONS]
  private messages: Record<string, ChatMessage[]> = JSON.parse(JSON.stringify(MOCK_MESSAGES))
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getConversations(query: GetConversationsQuery = {}): Promise<GetConversationsResponse> {
    await this.delay(300)

    let filtered = [...this.conversations]

    if (query.search) {
      const s = query.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.lastMessage?.toLowerCase().includes(s),
      )
    }

    // Sort by updatedAt descending
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return {
      conversations: filtered,
      totalCount: filtered.length,
    }
  }

  async getMessages(_query: GetMessagesQuery): Promise<ChatMessage[]> {
    await this.delay(250)
    return this.messages[_query.conversationId] || []
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Create user message immediately
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: request.conversationId,
      role: MessageRole.USER,
      content: request.content,
      status: MessageStatus.SENT,
      createdAt: new Date().toISOString(),
    }

    // Add to messages store
    if (!this.messages[request.conversationId]) {
      this.messages[request.conversationId] = []
    }
    this.messages[request.conversationId].push(userMessage)

    // Simulate AI thinking
    await this.delay(1200 + Math.random() * 800)

    // Pick a random AI response
    const responseContent = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      conversationId: request.conversationId,
      role: MessageRole.ASSISTANT,
      content: responseContent,
      status: MessageStatus.SENT,
      createdAt: new Date().toISOString(),
      confidenceScore: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
      sources: Math.random() > 0.4 ? MOCK_SOURCES.slice(0, Math.ceil(Math.random() * 2)) : undefined,
    }

    this.messages[request.conversationId].push(assistantMessage)

    // Update conversation metadata
    const convIdx = this.conversations.findIndex((c) => c.id === request.conversationId)
    if (convIdx !== -1) {
      this.conversations[convIdx] = {
        ...this.conversations[convIdx],
        lastMessage: request.content,
        messageCount: this.messages[request.conversationId].length,
        updatedAt: new Date().toISOString(),
      }
    }

    return { userMessage, assistantMessage }
  }

  async createConversation(request: CreateConversationRequest = {}): Promise<ChatConversation> {
    await this.delay(200)

    const newConversation: ChatConversation = {
      id: `conv-${Date.now()}`,
      title: request.title || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    }

    this.conversations.unshift(newConversation)
    this.messages[newConversation.id] = []

    return newConversation
  }

  async deleteConversation(id: string): Promise<void> {
    await this.delay(300)

    const idx = this.conversations.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Conversation not found')

    this.conversations.splice(idx, 1)
    delete this.messages[id]
  }
}

// Singleton
export const chatService = new MockChatService()
