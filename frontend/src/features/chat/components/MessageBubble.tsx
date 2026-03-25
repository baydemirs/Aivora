import { Badge } from '@/components/ui'
import { Bot, User, FileText } from 'lucide-react'
import { MessageRole } from '../types'
import type { ChatMessage } from '../types'
import { formatDistanceToNow } from 'date-fns'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === MessageRole.USER
  const isAssistant = message.role === MessageRole.ASSISTANT

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Bubble content */}
      <div className={`max-w-[80%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role label for assistant */}
        {isAssistant && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
            {message.confidenceScore != null && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                {Math.round(message.confidenceScore * 100)}% confidence
              </Badge>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-muted'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>

        {/* Sources */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="ml-1 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Sources
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source) => (
                <Badge
                  key={source.id}
                  variant="outline"
                  className="text-[11px] px-2 py-0.5 gap-1 font-normal cursor-default"
                >
                  <FileText className="h-3 w-3" />
                  {source.documentName}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <span className="text-[10px] text-muted-foreground/70">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary mt-1">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}
