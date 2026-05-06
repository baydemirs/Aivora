import { useState, useCallback, useMemo } from 'react'
import { Card, Button, Sheet, SheetContent } from '@/components/ui'
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
import { toPublicErrorMessage } from '@/lib/errors'
import { logDevError } from '@/lib/logger'

export function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [actionError, setActionError] = useState('')

  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations({
    search: searchQuery || undefined,
  })

  const sendMessageMutation = useSendMessage()
  const createConversationMutation = useCreateConversation()
  const deleteConversationMutation = useDeleteConversation()

  const conversations = useMemo(() => conversationsData?.conversations || [], [conversationsData])
  const resolvedActiveConversationId = useMemo(() => {
    if (activeConversationId && conversations.some((c) => c.id === activeConversationId)) {
      return activeConversationId
    }
    return conversations.length > 0 ? conversations[0].id : null
  }, [activeConversationId, conversations])
  const { data: messages, isLoading: isLoadingMessages } = useMessages(resolvedActiveConversationId)
  const activeConversation =
    conversations.find((c) => c.id === resolvedActiveConversationId) || null

  const handleSelectConversation = useCallback((id: string) => {
    setActionError('')
    setActiveConversationId(id)
    setMobileListOpen(false)
  }, [])

  const handleNewConversation = useCallback(async () => {
    if (createConversationMutation.isPending) return
    try {
      setActionError('')
      const newConv = await createConversationMutation.mutateAsync(undefined)
      setActiveConversationId(newConv.id)
      setMobileListOpen(false)
    } catch (error) {
      logDevError('Failed to create conversation.', error)
      setActionError(toPublicErrorMessage(error, 'Failed to create conversation'))
    }
  }, [createConversationMutation])

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!resolvedActiveConversationId || !content.trim() || sendMessageMutation.isPending) return
      try {
        setActionError('')
        const result = await sendMessageMutation.mutateAsync({
          conversationId: resolvedActiveConversationId,
          content,
        })

        if (result.conversationId !== resolvedActiveConversationId) {
          setActiveConversationId(result.conversationId)
        }
      } catch (error) {
        logDevError('Failed to send message.', error)
        setActionError(toPublicErrorMessage(error, 'Failed to send message'))
      }
    },
    [resolvedActiveConversationId, sendMessageMutation],
  )

  const handleDeleteConversation = useCallback(async () => {
    if (!resolvedActiveConversationId || deleteConversationMutation.isPending) return
    const confirmed = window.confirm('Are you sure you want to delete this conversation?')
    if (!confirmed) return

    try {
      setActionError('')
      await deleteConversationMutation.mutateAsync(resolvedActiveConversationId)
      const remaining = conversations.filter((c) => c.id !== resolvedActiveConversationId)
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null)
    } catch (error) {
      logDevError('Failed to delete conversation.', error)
      setActionError(toPublicErrorMessage(error, 'Failed to delete conversation'))
    }
  }, [resolvedActiveConversationId, conversations, deleteConversationMutation])

  const sidebarContent = (
    <ConversationList
      conversations={conversations}
      activeId={resolvedActiveConversationId}
      onSelect={handleSelectConversation}
      onNewConversation={handleNewConversation}
      isLoading={isLoadingConversations}
      isCreating={createConversationMutation.isPending}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="hidden w-80 shrink-0 overflow-hidden md:flex md:flex-col">
        {sidebarContent}
      </Card>

      <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
        <SheetContent side="left" className="w-80 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {actionError && (
          <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {actionError}
          </div>
        )}

        {resolvedActiveConversationId ? (
          <>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-8 w-8 p-0 md:hidden"
                onClick={() => setMobileListOpen(true)}
                aria-label="Open conversations list"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <ChatHeader
                  conversation={activeConversation}
                  messageCount={messages?.length || 0}
                  onDelete={handleDeleteConversation}
                  isDeleting={deleteConversationMutation.isPending}
                />
              </div>
            </div>

            <MessageList
              messages={messages || []}
              isLoading={isLoadingMessages}
              isAiResponding={sendMessageMutation.isPending}
            />

            <MessageComposer onSend={handleSendMessage} isSending={sendMessageMutation.isPending} />
          </>
        ) : (
          <>
            <div className="flex items-center border-b px-4 py-3 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setMobileListOpen(true)}
                aria-label="Open conversations list"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <span className="ml-2 text-sm font-medium">Conversations</span>
            </div>
            <EmptyChatState variant="no-conversation" onNewConversation={handleNewConversation} />
          </>
        )}
      </Card>
    </div>
  )
}
