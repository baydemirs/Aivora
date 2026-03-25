import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'
import { ListTodo, FileText, MessageSquare, CheckCircle, Clock, Building2 } from 'lucide-react'

// Mock data - will be replaced with API calls
const mockStats = {
  totalTasks: 24,
  pendingTasks: 8,
  completedTasks: 16,
  totalDocuments: 12,
  totalConversations: 45,
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: { value: number; label: string }
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
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
            <CardTitle className="text-base">Your Organization</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tenant ID: {user?.tenantId?.slice(0, 8)}...
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={mockStats.totalTasks}
          description="All PRD tasks"
          icon={ListTodo}
        />
        <StatCard
          title="Pending Tasks"
          value={mockStats.pendingTasks}
          description="Awaiting completion"
          icon={Clock}
        />
        <StatCard
          title="Completed Tasks"
          value={mockStats.completedTasks}
          description="Successfully done"
          icon={CheckCircle}
        />
        <StatCard
          title="Documents"
          value={mockStats.totalDocuments}
          description="In knowledge base"
          icon={FileText}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="AI Conversations"
          value={mockStats.totalConversations}
          description="Total chat sessions"
          icon={MessageSquare}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <a
              href="/tasks"
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <ListTodo className="h-4 w-4" />
              View Tasks
            </a>
            <a
              href="/knowledge-base"
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
              Upload Document
            </a>
            <a
              href="/chat"
              className="col-span-2 flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              Start AI Chat
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
