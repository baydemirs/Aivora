import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { SettingsPanel } from '@/components/settings'
import { Sheet, SheetContent } from '@/components/ui'
import { useAuth } from '@/features/auth/use-auth'
import { useI18n } from '@/i18n'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()
  const { t } = useI18n()
  const { user, logout } = useAuth()
  const pageTitles: Record<string, string> = {
    '/dashboard': t('nav.dashboard'),
    '/tasks': t('nav.tasks'),
    '/knowledge-base': t('nav.knowledge'),
    '/chat': t('layout.aiChat'),
  }
  const title = pageTitles[location.pathname] || ''

  const openSettings = () => {
    setSidebarOpen(false)
    setSettingsOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-border/60 bg-card lg:block">
        <Sidebar settingsOpen={settingsOpen} onSettingsOpen={openSettings} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[260px] p-0" onClose={() => setSidebarOpen(false)}>
          <Sidebar
            settingsOpen={settingsOpen}
            onNavigate={() => setSidebarOpen(false)}
            onSettingsOpen={openSettings}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onSettingsClick={openSettings}
          title={title}
        />
        <main className="flex-1 overflow-auto p-5 lg:p-8">
          <div className="mx-auto max-w-screen-xl">
            <Outlet />
          </div>
        </main>
      </div>

      <SettingsPanel
        open={settingsOpen}
        user={user}
        onOpenChange={setSettingsOpen}
        onLogout={logout}
      />
    </div>
  )
}
