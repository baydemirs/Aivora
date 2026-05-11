import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  MessageSquare,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui'
import { SettingsPanel, SettingsTrigger } from '@/components/settings'
import { getInitials } from '@/utils/format'
import { useI18n } from '@/i18n'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'PRD Tracker',
    href: '/tasks',
    icon: ListTodo,
  },
  {
    title: 'Knowledge Base',
    href: '/knowledge-base',
    icon: FileText,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleNavClick = () => {
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">Aivora</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-muted/60 hover:text-foreground'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {item.href === '/dashboard' && t('nav.dashboard')}
            {item.href === '/tasks' && t('nav.tasks')}
            {item.href === '/knowledge-base' && t('nav.knowledge')}
            {item.href === '/chat' && t('nav.chat')}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl border border-border/70 bg-background/70 p-2 shadow-sm">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-foreground">{user?.fullName || user?.email}</p>
              <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                {user?.role === 'ADMIN' ? t('settings.roleAdmin') : t('settings.roleMember')}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <SettingsTrigger
              active={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('common.logout')}
        </button>

        <SettingsPanel
          open={settingsOpen}
          user={user}
          onOpenChange={setSettingsOpen}
          onLogout={logout}
        />
      </div>
    </div>
  )
}
