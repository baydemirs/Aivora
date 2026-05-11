import { useState, useCallback, useMemo } from 'react'
import { Button, Sheet, SheetContent } from '@/components/ui'
import { Menu } from 'lucide-react'
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCreateConversation,
  useDeleteConversation,
} from '@/features/chat/hooks/useChat'
import {
  ConversationList,
  ChatHeader,
  MessageList,
  MessageComposer,
  EmptyChatState,
} from '@/features/chat/components'

export function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileListOpen, setMobileListOpen] = useState(false)

  // Queries
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations({
    search: searchQuery || undefined,
  })
  const conversations = useMemo(
    () => conversationsData?.conversations ?? [],
    [conversationsData?.conversations],
  )
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  )
  const displayedConversationId = activeConversationId ?? conversations[0]?.id ?? null
  const displayedConversation = activeConversation ?? conversations[0] ?? null

  const { data: messages, isLoading: isLoadingMessages } = useMessages(displayedConversationId)

  // Mutations
  const sendMessageMutation = useSendMessage()
  const createConversationMutation = useCreateConversation()
  const deleteConversationMutation = useDeleteConversation()

  // Handlers
  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id)
      setMobileListOpen(false)
    },
    [],
  )

  const handleNewConversation = useCallback(async () => {
    try {
      const newConv = await createConversationMutation.mutateAsync(undefined)
      setActiveConversationId(newConv.id)
      setMobileListOpen(false)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }, [createConversationMutation])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!displayedConversationId || !content.trim()) return
      sendMessageMutation.mutate({
        conversationId: displayedConversationId,
        content,
      })
    },
    [displayedConversationId, sendMessageMutation],
  )

  const handleDeleteConversation = useCallback(async () => {
    if (!displayedConversationId) return
    const confirmed = window.confirm('Are you sure you want to delete this conversation?')
    if (!confirmed) return
    try {
      await deleteConversationMutation.mutateAsync(displayedConversationId)
      // Select another conversation or clear
      const remaining = conversations.filter((c) => c.id !== displayedConversationId)
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }, [displayedConversationId, conversations, deleteConversationMutation])

  // Shared sidebar content
  const sidebarContent = (
    <ConversationList
      conversations={conversations}
      activeId={displayedConversationId}
      onSelect={handleSelectConversation}
      onNewConversation={handleNewConversation}
      isLoading={isLoadingConversations}
      isCreating={createConversationMutation.isPending}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  )

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Desktop Sidebar */}
      <div className="hidden w-80 shrink-0 md:flex md:flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        {sidebarContent}
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
        <SheetContent side="left" className="w-80 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        {displayedConversationId ? (
          <>
            {/* Header with mobile menu trigger */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-8 w-8 p-0 md:hidden"
                onClick={() => setMobileListOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <ChatHeader
                  conversation={displayedConversation}
                  messageCount={messages?.length || 0}
                  onDelete={handleDeleteConversation}
                  isDeleting={deleteConversationMutation.isPending}
                />
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages || []}
              isLoading={isLoadingMessages}
              isAiResponding={sendMessageMutation.isPending}
            />

            {/* Composer */}
            <MessageComposer
              onSend={handleSendMessage}
              isSending={sendMessageMutation.isPending}
            />
          </>
        ) : (
          <>
            {/* Mobile menu trigger in empty state */}
            <div className="flex items-center md:hidden border-b border-border/60 px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setMobileListOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <span className="ml-2 text-sm font-medium">Conversations</span>
            </div>
            <EmptyChatState
              variant="no-conversation"
              onNewConversation={handleNewConversation}
            />
          </>
        )}
      </div>
    </div>
  )
}
