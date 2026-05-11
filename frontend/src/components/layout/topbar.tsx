import { Menu, LogOut, ChevronDown, Globe } from 'lucide-react'
import { Button, Avatar, AvatarFallback } from '@/components/ui'
import { useAuth } from '@/features/auth/use-auth'
import { getInitials } from '@/utils/format'
import { useState, useRef, useEffect } from 'react'
import { useI18n } from '@/i18n'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useI18n()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isDropdownOpen])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8"
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {title && (
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* Language Selector */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as 'en' | 'tr')}
            className="rounded-md border-0 bg-transparent px-1 py-0.5 text-xs text-muted-foreground focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="en">{t('lang.en')}</option>
            <option value="tr">{t('lang.tr')}</option>
          </select>
        </div>

        {/* Separator */}
        <div className="hidden lg:block h-5 w-px bg-border" />

        {/* User Menu */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted/60"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium leading-tight">{user.fullName}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-border/60 bg-card shadow-lg animate-fade-in overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.tenantName && (
                    <p className="text-xs text-muted-foreground mt-0.5">{user.tenantName}</p>
                  )}
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('topbar.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
