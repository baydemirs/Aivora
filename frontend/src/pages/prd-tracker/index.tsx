import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@/components/ui'
import { Plus, CheckCircle, Clock, Loader2 } from 'lucide-react'
import type { PrdTask, TaskStatus } from '@/types'

// Mock data - will be replaced with API calls
const mockTasks: PrdTask[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    module: 'auth',
    status: 'COMPLETED',
    tenantId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '2',
    title: 'Setup RAG pipeline',
    module: 'rag',
    status: 'COMPLETED',
    tenantId: '1',
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
  },
  {
    id: '3',
    title: 'Integrate OpenAI API',
    module: 'chat',
    status: 'IN_PROGRESS',
    tenantId: '1',
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-19T08:00:00Z',
  },
  {
    id: '4',
    title: 'Create document upload feature',
    module: 'knowledge-base',
    status: 'PENDING',
    tenantId: '1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '5',
    title: 'Add conversation history',
    module: 'chat',
    status: 'PENDING',
    tenantId: '1',
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
  },
]

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning'; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning', icon: Loader2 },
  COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle },
}

const moduleColors: Record<string, string> = {
  auth: 'bg-blue-100 text-blue-800',
  rag: 'bg-purple-100 text-purple-800',
  chat: 'bg-green-100 text-green-800',
  'knowledge-base': 'bg-orange-100 text-orange-800',
}

export function PrdTrackerPage() {
  const [tasks, setTasks] = useState<PrdTask[]>(mockTasks)
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskModule, setNewTaskModule] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredTasks = filter === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === filter)

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    )
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskModule.trim()) return

    const newTask: PrdTask = {
      id: String(Date.now()),
      title: newTaskTitle,
      module: newTaskModule.toLowerCase(),
      status: 'PENDING',
      tenantId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks(prev => [newTask, ...prev])
    setNewTaskTitle('')
    setNewTaskModule('')
    setShowAddForm(false)
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('ALL')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('PENDING')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('IN_PROGRESS')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('COMPLETED')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : statusConfig[status].label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Task</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Module (e.g., auth, chat)"
              value={newTaskModule}
              onChange={(e) => setNewTaskModule(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleAddTask}>Add</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No tasks found
              </p>
            ) : (
              filteredTasks.map((task) => {
                const status = statusConfig[task.status]
                const StatusIcon = status.icon

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon
                        className={`h-5 w-5 ${
                          task.status === 'COMPLETED'
                            ? 'text-green-500'
                            : task.status === 'IN_PROGRESS'
                            ? 'animate-spin text-yellow-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              moduleColors[task.module] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {task.module}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(task.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="rounded-md border px-2 py-1 text-sm"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
