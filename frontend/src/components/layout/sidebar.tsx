import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { Button, Avatar, AvatarFallback } from '@/components/ui'
import { getInitials } from '@/utils/format'

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

  const handleNavClick = () => {
    onNavigate?.()
  }



  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <span className="text-xl font-bold">Aivora</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user?.fullName || user?.email}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
