import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'
import { useTaskStats } from '@/features/tasks/hooks/useTasks'
import { ListTodo, FileText, MessageSquare, CheckCircle, Clock, Building2, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock data for non-task stats - will be replaced with API calls
const mockOtherStats = {
  totalDocuments: 12,
  totalConversations: 45,
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: { value: number; label: string }
  loading?: boolean
  to?: string
}

function StatCard({ title, value, description, icon: Icon, loading, to }: StatCardProps) {
  const content = (
    <Card className={to ? "cursor-pointer transition-colors hover:bg-muted/50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            {description && <Skeleton className="h-4 w-24" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  return to ? <Link to={to}>{content}</Link> : content
}

export function DashboardPage() {
  const { user } = useAuth()

  // Get real task stats from our API
  const {
    data: taskStats,
    isLoading: isTaskStatsLoading,
    error: taskStatsError
  } = useTaskStats()

  // Calculate derived stats
  const totalActiveTasks = taskStats ?
    taskStats.todo + taskStats.inProgress + taskStats.blocked + taskStats.review : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your AI platform activity.
        </p>
      </div>

      {/* Tenant Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{user?.tenantName || 'Your Organization'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Member'} • Tenant ID: {user?.tenantId?.slice(0, 8)}...
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Task Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={taskStats?.total || 0}
          description="All PRD tasks"
          icon={ListTodo}
          loading={isTaskStatsLoading}
          to="/prd-tracker"
        />
        <StatCard
          title="Active Tasks"
          value={totalActiveTasks}
          description="Todo, In Progress, Blocked, Review"
          icon={Clock}
          loading={isTaskStatsLoading}
          to="/prd-tracker"
        />
        <StatCard
          title="Completed Tasks"
          value={taskStats?.done || 0}
          description="Successfully completed"
          icon={CheckCircle}
          loading={isTaskStatsLoading}
          to="/prd-tracker"
        />
        <StatCard
          title="Blocked Tasks"
          value={taskStats?.blocked || 0}
          description="Need attention"
          icon={AlertCircle}
          loading={isTaskStatsLoading}
          to="/prd-tracker"
        />
      </div>

      {/* Task Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isTaskStatsLoading ? (
            <div className="grid gap-4 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </div>
              ))}
            </div>
          ) : taskStatsError ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Failed to load task statistics
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">To Do</p>
                <p className="text-2xl font-bold text-gray-600">{taskStats?.todo || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats?.inProgress || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{taskStats?.blocked || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Review</p>
                <p className="text-2xl font-bold text-yellow-600">{taskStats?.review || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Done</p>
                <p className="text-2xl font-bold text-green-600">{taskStats?.done || 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Stats and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Documents"
          value={mockOtherStats.totalDocuments}
          description="In knowledge base"
          icon={FileText}
          to="/knowledge-base"
        />
        <StatCard
          title="AI Conversations"
          value={mockOtherStats.totalConversations}
          description="Total chat sessions"
          icon={MessageSquare}
          to="/chat"
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/prd-tracker"
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <ListTodo className="h-4 w-4" />
              Manage Tasks
            </Link>
            <Link
              to="/knowledge-base"
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
              Upload Document
            </Link>
            <Link
              to="/chat"
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              Start AI Chat
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      {taskStats && taskStats.byPriority && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Low</p>
                <p className="text-lg font-semibold text-gray-600">{taskStats.byPriority.low}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Medium</p>
                <p className="text-lg font-semibold text-blue-600">{taskStats.byPriority.medium}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">High</p>
                <p className="text-lg font-semibold text-orange-600">{taskStats.byPriority.high}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Urgent</p>
                <p className="text-lg font-semibold text-red-600">{taskStats.byPriority.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
