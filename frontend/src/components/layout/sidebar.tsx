import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui'
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
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user?.fullName || user?.email}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          <button
            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            {t('common.settings')}
          </button>
          <button
            onClick={logout}
            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
