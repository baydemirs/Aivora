import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Textarea } from '@/components/ui'
import { Send, Loader2 } from 'lucide-react'

interface MessageComposerProps {
  onSend: (content: string) => void
  disabled?: boolean
  isSending?: boolean
  placeholder?: string
}

export function MessageComposer({
  onSend,
  disabled = false,
  isSending = false,
  placeholder = 'Type your message…',
}: MessageComposerProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sendingRef = useRef(false)

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed || disabled || isSending || sendingRef.current) return
    sendingRef.current = true
    onSend(trimmed)
    setContent('')
    // Re-focus after send and reset guard
    setTimeout(() => {
      textareaRef.current?.focus()
      sendingRef.current = false
    }, 100)
  }, [content, disabled, isSending, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = disabled || isSending
  const canSend = content.trim().length > 0 && !isDisabled

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="min-h-[60px] max-h-[160px] resize-none rounded-xl"
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="sm"
          className="h-10 w-10 shrink-0 rounded-xl p-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground/60 px-1">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
