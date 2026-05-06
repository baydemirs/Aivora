import { Badge, Button } from '@/components/ui'
import { Sparkles, Trash2 } from 'lucide-react'
import type { ChatConversation } from '../types'

interface ChatHeaderProps {
  conversation: ChatConversation | null
  messageCount: number
  onDelete?: () => void
  isDeleting?: boolean
}

export function ChatHeader({ conversation, messageCount, onDelete, isDeleting }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-card shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">
            {conversation?.title || 'AI Assistant'}
          </h2>
          {conversation && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-muted-foreground">
                Online
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {conversation && (
          <Badge variant="secondary" className="text-xs font-normal">
            {messageCount} messages
          </Badge>
        )}
        {onDelete && conversation && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
