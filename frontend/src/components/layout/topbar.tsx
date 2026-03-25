import { Menu } from 'lucide-react'
import { Button } from '@/components/ui'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {title && (
        <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Future: Search, notifications, etc. */}
      </div>
    </header>
  )
}
