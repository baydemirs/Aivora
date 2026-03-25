import { Bot, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui'

interface EmptyChatStateProps {
  variant: 'no-conversation' | 'no-messages'
  onNewConversation?: () => void
}

export function EmptyChatState({ variant, onNewConversation }: EmptyChatStateProps) {
  if (variant === 'no-conversation') {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-foreground">
          Select a conversation
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Choose a conversation from the sidebar or start a new one to begin chatting with your AI assistant.
        </p>
        {onNewConversation && (
          <Button className="mt-6" onClick={onNewConversation}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        Start a conversation
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Ask questions about your documents and get AI-powered answers based on your knowledge base.
      </p>
    </div>
  )
}
