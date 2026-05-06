export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        <svg
          className="h-4 w-4 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-tl-md bg-muted/80 border border-border/40 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40"
            style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40"
            style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40"
            style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
          />
        </div>
      </div>
    </div>
  )
}
