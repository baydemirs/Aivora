import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { Plus, RotateCcw, Download } from 'lucide-react'

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
import { useI18n } from '@/i18n'

export function PrdTrackerPage() {
  const { t } = useI18n()
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

  const statItems = [
    { label: t('tasks.totalTasks'), value: stats.total, color: 'border-l-primary', onClick: () => setFilters(prev => ({ ...prev, status: 'all' })) },
    { label: t('tasks.todo'), value: stats.todo, color: 'border-l-stone-400', onClick: () => setFilters(prev => ({ ...prev, status: TaskStatus.TODO })) },
    { label: t('tasks.inProgress'), value: stats.inProgress, color: 'border-l-blue-500', onClick: () => setFilters(prev => ({ ...prev, status: TaskStatus.IN_PROGRESS })) },
    { label: t('tasks.review'), value: stats.review, color: 'border-l-amber-500', onClick: () => setFilters(prev => ({ ...prev, status: TaskStatus.REVIEW })) },
    { label: t('tasks.done'), value: stats.done, color: 'border-l-emerald-500', onClick: () => setFilters(prev => ({ ...prev, status: TaskStatus.DONE })) },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title={t('tasks.title')} description={t('tasks.subtitle')}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>

        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('tasks.newTask')}
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex flex-col rounded-lg border border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-border border-l-[3px] ${item.color}`}
          >
            {isStatsLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ) : (
              <>
                <span className="text-xl font-bold text-foreground">{item.value}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Filters — inline toolbar */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        showAdvanced={true}
      />

      {/* Bulk Actions */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedTaskIds.length} {t('tasks.selected')}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTaskIds([])}
            >
              {t('tasks.clear')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('tasks.export')}
            </Button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {t('tasks.task')}
              {tasksResponse?.totalCount && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({tasksResponse.totalCount} {t('tasks.total')})
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
                  {t('tasks.resetFilters')}
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasError ? (
            <div className="text-center py-12">
              <div className="text-destructive mb-2">{t('tasks.failedToLoad')}</div>
              <Button variant="outline" onClick={handleRefresh}>
                {t('tasks.tryAgain')}
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
            {t('tasks.pageOf', { current: tasksResponse.currentPage, total: tasksResponse.totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!tasksResponse.hasPrev}
            >
              {t('tasks.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!tasksResponse.hasNext}
            >
              {t('tasks.next')}
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
