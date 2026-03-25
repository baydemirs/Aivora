import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@/components/ui'
import { Plus, RotateCcw, Download, Filter } from 'lucide-react'

// Task components and hooks
import {
  TaskTable,
  TaskFilters,
  TaskDetailDrawer
} from '@/features/tasks/components'
import {
  useTasks,
  useTaskStats,
  useUpdateTask
} from '@/features/tasks/hooks/useTasks'
import type {
  Task,
  TaskFilters as TaskFiltersType,
  GetTasksQuery,
} from '@/features/tasks/types'
import { TaskSortBy, TaskStatus } from '@/features/tasks/types'

export function PrdTrackerPage() {
  // State
  const [filters, setFilters] = useState<TaskFiltersType>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
    module: 'all',
    assignee: 'all',
    sortBy: TaskSortBy.UPDATED_AT,
    sortOrder: 'desc'
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // Prepare query parameters for API
  const queryParams = useMemo((): GetTasksQuery => {
    return {
      search: filters.searchQuery || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      module: filters.module !== 'all' ? filters.module : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      limit: 50,
    }
  }, [filters])

  // API calls
  const {
    data: tasksResponse,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useTasks(queryParams)

  const {
    data: taskStats,
    isLoading: isStatsLoading,
    refetch: refetchStats
  } = useTaskStats()

  const updateTaskMutation = useUpdateTask()

  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDetailDrawerOpen(false)
    setSelectedTask(null)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskMutation.mutateAsync({ id: taskId, data: { status } })
    } catch (error) {
      console.error('Failed to update task status:', error)
      // TODO: Show toast notification
    }
  }

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTaskIds(prev =>
      selected
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    )
  }

  const handleRefresh = () => {
    refetchTasks()
    refetchStats()
  }

  const handleFiltersReset = () => {
    setFilters({
      searchQuery: '',
      status: 'all',
      priority: 'all',
      module: 'all',
      assignee: 'all',
      sortBy: TaskSortBy.UPDATED_AT,
      sortOrder: 'desc'
    })
  }

  // Prepare data
  const tasks = tasksResponse?.tasks || []
  const stats = taskStats || {
    total: 0,
    todo: 0,
    inProgress: 0,
    blocked: 0,
    review: 0,
    done: 0,
    byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    byModule: {}
  }

  const isLoading = isTasksLoading || isStatsLoading
  const hasError = tasksError

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PRD Tracker</h1>
          <p className="text-muted-foreground">
            Manage and track product requirements and development tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}>
          <CardContent className="pt-6">
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilters(prev => ({ ...prev, status: TaskStatus.TODO }))}>
          <CardContent className="pt-6">
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
                <p className="text-xs text-muted-foreground">To Do</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilters(prev => ({ ...prev, status: TaskStatus.IN_PROGRESS }))}>
          <CardContent className="pt-6">
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilters(prev => ({ ...prev, status: TaskStatus.REVIEW }))}>
          <CardContent className="pt-6">
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600">{stats.review}</div>
                <p className="text-xs text-muted-foreground">Review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilters(prev => ({ ...prev, status: TaskStatus.DONE }))}>
          <CardContent className="pt-6">
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.done}</div>
                <p className="text-xs text-muted-foreground">Done</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            showAdvanced={true}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTaskIds.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTaskIds([])}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Tasks
              {tasksResponse?.totalCount && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({tasksResponse.totalCount} total)
                </span>
              )}
            </CardTitle>

            {/* Table Actions */}
            <div className="flex items-center gap-2">
              {filters.searchQuery || filters.status !== 'all' || filters.priority !== 'all' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFiltersReset}
                  className="text-muted-foreground"
                >
                  Reset filters
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasError ? (
            <div className="text-center py-12">
              <div className="text-destructive mb-2">Failed to load tasks</div>
              <Button variant="outline" onClick={handleRefresh}>
                Try again
              </Button>
            </div>
          ) : (
            <TaskTable
              tasks={tasks}
              loading={isTasksLoading}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
              isStatusUpdating={() => updateTaskMutation.isPending}
              selectedTaskIds={selectedTaskIds}
              onTaskSelect={handleTaskSelect}
              showActions={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {tasksResponse && tasksResponse.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {tasksResponse.currentPage} of {tasksResponse.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!tasksResponse.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!tasksResponse.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={isDetailDrawerOpen}
        onClose={handleCloseDrawer}
        onStatusChange={selectedTask ? (status) => handleStatusChange(selectedTask.id, status) : undefined}
        isStatusUpdating={updateTaskMutation.isPending}
        loading={false}
      />
    </div>
  )
}
