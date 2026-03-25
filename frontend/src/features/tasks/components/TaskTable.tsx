import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import {
  Task,
  TaskStatus,
  TASK_MODULE_CONFIG
} from '../types'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusSelect } from './TaskStatusSelect'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TaskTableProps {
  tasks: Task[]
  loading?: boolean
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (task: Task) => void
  isStatusUpdating?: (taskId: string) => boolean
  showActions?: boolean
  compact?: boolean
  selectedTaskIds?: string[]
  onTaskSelect?: (taskId: string, selected: boolean) => void
}

export function TaskTable({
  tasks,
  loading = false,
  onTaskClick,
  onStatusChange,
  onTaskEdit,
  onTaskDelete,
  isStatusUpdating,
  showActions = true,
  compact = false,
  selectedTaskIds = [],
  onTaskSelect
}: TaskTableProps) {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

  const toggleDescription = (taskId: string) => {
    const newExpanded = new Set(expandedDescriptions)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedDescriptions(newExpanded)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {!compact && onTaskSelect && <TableHead className="w-12"></TableHead>}
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Module</TableHead>
              {!compact && <TableHead>Assignee</TableHead>}
              <TableHead>Updated</TableHead>
              {showActions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {!compact && onTaskSelect && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                {!compact && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                {showActions && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No tasks found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or create a new task to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {!compact && onTaskSelect && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={
                    tasks.length > 0 && tasks.every(task => selectedTaskIds.includes(task.id))
                  }
                  onChange={(e) => {
                    tasks.forEach(task => {
                      onTaskSelect?.(task.id, e.target.checked)
                    })
                  }}
                />
              </TableHead>
            )}
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Module</TableHead>
            {!compact && <TableHead>Assignee</TableHead>}
            <TableHead>Updated</TableHead>
            {showActions && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const moduleConfig = TASK_MODULE_CONFIG[task.module as keyof typeof TASK_MODULE_CONFIG]
            const isExpanded = expandedDescriptions.has(task.id)
            const hasLongDescription = task.description && task.description.length > 100

            return (
              <TableRow
                key={task.id}
                className={`
                  ${onTaskClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  ${selectedTaskIds.includes(task.id) ? 'bg-muted/25' : ''}
                `}
                onClick={() => onTaskClick?.(task)}
              >
                {!compact && onTaskSelect && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={(e) => onTaskSelect(task.id, e.target.checked)}
                    />
                  </TableCell>
                )}

                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground">
                        {hasLongDescription && !isExpanded ? (
                          <>
                            {task.description.slice(0, 100)}...
                            <button
                              className="ml-1 text-primary hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDescription(task.id)
                              }}
                            >
                              more
                            </button>
                          </>
                        ) : (
                          <>
                            {task.description}
                            {hasLongDescription && (
                              <button
                                className="ml-1 text-primary hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleDescription(task.id)
                                }}
                              >
                                less
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  {onStatusChange ? (
                    <TaskStatusSelect
                      value={task.status}
                      onValueChange={(status) => onStatusChange(task.id, status)}
                      disabled={isStatusUpdating?.(task.id)}
                      size="sm"
                    />
                  ) : (
                    <TaskStatusBadge status={task.status} size="sm" />
                  )}
                </TableCell>

                <TableCell>
                  <TaskPriorityBadge priority={task.priority} size="sm" />
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      moduleConfig
                        ? `${moduleConfig.bgColor} ${moduleConfig.textColor}`
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {moduleConfig?.label || task.module}
                  </Badge>
                </TableCell>

                {!compact && (
                  <TableCell>
                    {task.assigneeName ? (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {task.assigneeName.charAt(0).toUpperCase()}
                        </div>
                        {task.assigneeName}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                )}

                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(task.updatedAt)}
                  </div>
                </TableCell>

                {showActions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {onTaskClick && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onTaskClick(task)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onTaskEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onTaskEdit(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onTaskDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => onTaskDelete(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}