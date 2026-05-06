import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Sheet, SheetContent } from '@/components/ui'
import { useI18n } from '@/i18n'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { t } = useI18n()
  const pageTitles: Record<string, string> = {
    '/dashboard': t('nav.dashboard'),
    '/tasks': t('nav.tasks'),
    '/knowledge-base': t('nav.knowledge'),
    '/chat': t('layout.aiChat'),
  }
  const title = pageTitles[location.pathname] || ''

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-border/60 bg-card lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[260px] p-0" onClose={() => setSidebarOpen(false)}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-auto p-5 lg:p-8">
          <div className="mx-auto max-w-screen-xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
