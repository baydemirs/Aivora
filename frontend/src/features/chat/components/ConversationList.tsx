import { Button, Input, ScrollArea, Skeleton } from '@/components/ui'
import { Plus, Search, MessageSquare } from 'lucide-react'
import type { ChatConversation } from '../types'
import { ConversationListItem } from './ConversationListItem'

interface ConversationListProps {
  conversations: ChatConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewConversation: () => void
  isLoading?: boolean
  isCreating?: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  isLoading = false,
  isCreating = false,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 space-y-3 border-b">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="p-2 space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 space-y-2">
              <div className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 space-y-2 border-b shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Conversations</h3>
          <Button
            size="sm"
            onClick={onNewConversation}
            disabled={isCreating}
            className="h-8 rounded-lg"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-8 text-sm rounded-lg"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No conversations</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation to begin'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeId}
                onClick={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
