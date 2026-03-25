import { useRef, useEffect } from 'react'
import { ScrollArea, Skeleton } from '@/components/ui'
import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { EmptyChatState } from './EmptyChatState'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  isAiResponding?: boolean
}

export function MessageList({ messages, isLoading = false, isAiResponding = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiResponding])

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
            <div className="space-y-2 max-w-[60%]">
              <Skeleton className="h-4 w-20" />
              <Skeleton className={`h-16 w-full rounded-2xl ${i % 2 === 0 ? 'rounded-tl-sm' : 'rounded-tr-sm'}`} />
              <Skeleton className="h-3 w-16" />
            </div>
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1">
        <EmptyChatState variant="no-messages" />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isAiResponding && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
