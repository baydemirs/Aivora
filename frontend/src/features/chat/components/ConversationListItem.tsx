import { Badge } from '@/components/ui'
import { MessageSquare } from 'lucide-react'
import type { ChatConversation } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ConversationListItemProps {
  conversation: ChatConversation
  isActive: boolean
  onClick: () => void
}

export function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: ConversationListItemProps) {
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false })
    } catch {
      return ''
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl p-3 text-left transition-all duration-150',
        'hover:bg-muted/80',
        isActive && 'bg-primary/10 hover:bg-primary/15 ring-1 ring-primary/20',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            isActive ? 'bg-primary/20' : 'bg-muted',
          )}
        >
          <MessageSquare
            className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{conversation.title}</p>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatTime(conversation.updatedAt)}
            </span>
          </div>

          {conversation.lastMessage && (
            <p className="truncate text-xs text-muted-foreground leading-relaxed">
              {conversation.lastMessage}
            </p>
          )}

          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {conversation.messageCount} msgs
            </Badge>
          </div>
        </div>
      </div>
    </button>
  )
}
