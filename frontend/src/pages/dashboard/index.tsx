import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { StatCard } from '@/components/shared'
import { useAuth } from '@/features/auth/use-auth'
import { useTaskStats } from '@/features/tasks/hooks/useTasks'
import {
  ListTodo,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Building2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'

// Mock data for non-task stats - will be replaced with API calls
const mockOtherStats = {
  totalDocuments: 12,
  totalConversations: 45,
}

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()

  // Get real task stats from our API
  const {
    data: taskStats,
    isLoading: isTaskStatsLoading,
    error: taskStatsError
  } = useTaskStats()

  // Calculate derived stats
  const totalActiveTasks = taskStats ?
    taskStats.todo + taskStats.inProgress + taskStats.blocked + taskStats.review : 0

  const statusBreakdown = [
    { label: t('tasks.todo'), value: taskStats?.todo || 0, color: 'bg-stone-400' },
    { label: t('tasks.inProgress'), value: taskStats?.inProgress || 0, color: 'bg-blue-500' },
    { label: t('tasks.blocked'), value: taskStats?.blocked || 0, color: 'bg-red-500' },
    { label: t('tasks.review'), value: taskStats?.review || 0, color: 'bg-amber-500' },
    { label: t('tasks.done'), value: taskStats?.done || 0, color: 'bg-emerald-500' },
  ]

  const priorityBreakdown = taskStats?.byPriority ? [
    { label: t('tasks.low'), value: taskStats.byPriority.low, color: 'text-stone-500' },
    { label: t('tasks.medium'), value: taskStats.byPriority.medium, color: 'text-blue-500' },
    { label: t('tasks.high'), value: taskStats.byPriority.high, color: 'text-orange-500' },
    { label: t('tasks.urgent'), value: taskStats.byPriority.urgent, color: 'text-red-500' },
  ] : null

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t('dashboard.welcome')}{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.overview')}
          </p>
        </div>
        {user?.tenantName && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card px-3.5 py-2 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Building2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground leading-tight">{user.tenantName}</p>
              <p className="text-xs text-muted-foreground">{user.role === 'ADMIN' ? 'Administrator' : 'Member'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.totalTasks')}
          value={taskStats?.total || 0}
          description={t('dashboard.allPrdTasks')}
          icon={ListTodo}
          loading={isTaskStatsLoading}
          to="/tasks"
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatCard
          title={t('dashboard.activeTasks')}
          value={totalActiveTasks}
          description={t('dashboard.activeDesc')}
          icon={Clock}
          loading={isTaskStatsLoading}
          to="/tasks"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title={t('dashboard.completedTasks')}
          value={taskStats?.done || 0}
          description={t('dashboard.completedDesc')}
          icon={CheckCircle}
          loading={isTaskStatsLoading}
          to="/tasks"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title={t('dashboard.blockedTasks')}
          value={taskStats?.blocked || 0}
          description={t('dashboard.blockedDesc')}
          icon={AlertCircle}
          loading={isTaskStatsLoading}
          to="/tasks"
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </div>

      {/* Task Breakdown + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.taskBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isTaskStatsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-2 flex-1 rounded-full" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : taskStatsError ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t('dashboard.failedStats')}
              </p>
            ) : (
              <div className="space-y-4">
                {statusBreakdown.map((item) => {
                  const total = taskStats?.total || 1
                  const percent = Math.round((item.value / total) * 100)
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-muted-foreground shrink-0">{item.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-8 text-right">{item.value}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { to: '/tasks', icon: ListTodo, label: t('dashboard.manageTasks'), color: 'text-primary' },
              { to: '/knowledge-base', icon: FileText, label: t('dashboard.uploadDocument'), color: 'text-amber-600' },
              { to: '/chat', icon: MessageSquare, label: t('dashboard.startChat'), color: 'text-emerald-600' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center gap-3 rounded-lg border border-border/60 p-3 text-sm transition-all hover:bg-muted/60 hover:border-border"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/80">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="font-medium text-foreground">{action.label}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t('dashboard.documents')}
          value={mockOtherStats.totalDocuments}
          description={t('dashboard.inKnowledgeBase')}
          icon={FileText}
          to="/knowledge-base"
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          title={t('dashboard.aiConversations')}
          value={mockOtherStats.totalConversations}
          description={t('dashboard.totalChatSessions')}
          icon={MessageSquare}
          to="/chat"
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />

        {/* Priority Breakdown */}
        {priorityBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.tasksByPriority')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {priorityBreakdown.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
