import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import {
  TaskStatus,
  TASK_MODULE_CONFIG
} from '../types'
import type { Task } from '../types'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusSelect } from './TaskStatusSelect'
import {
  Calendar,
  User,
  Clock,
  Tag,
  Edit,
  Trash2,
  Copy,
  CheckCircle2
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface TaskDetailDrawerProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onStatusChange?: (status: TaskStatus) => void
  onEdit?: () => void
  onDelete?: () => void
  loading?: boolean
  isStatusUpdating?: boolean
}

export function TaskDetailDrawer({
  task,
  open,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
  loading = false,
  isStatusUpdating = false
}: TaskDetailDrawerProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return {
        formatted: format(date, 'PPpp'),
        relative: formatDistanceToNow(date, { addSuffix: true })
      }
    } catch {
      return {
        formatted: 'Unknown',
        relative: 'Unknown'
      }
    }
  }

  if (loading || !task) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              <Skeleton className="h-6 w-48" />
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Status and Priority */}
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const moduleConfig = TASK_MODULE_CONFIG[task.module as keyof typeof TASK_MODULE_CONFIG]
  const createdDate = formatDate(task.createdAt)
  const updatedDate = formatDate(task.updatedAt)
  const completedDate = task.completedAt ? formatDate(task.completedAt) : null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <SheetTitle className="text-lg font-semibold leading-6 pr-8">
              {task.title}
            </SheetTitle>
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleCopy(task.id, 'id')}
              >
                {copied === 'id' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Task ID: {task.id}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status and Priority Row */}
          <div className="flex flex-wrap gap-3">
            {onStatusChange ? (
              <TaskStatusSelect
                value={task.status}
                onValueChange={onStatusChange}
                disabled={isStatusUpdating}
              />
            ) : (
              <TaskStatusBadge status={task.status} />
            )}
            <TaskPriorityBadge priority={task.priority} />
            {moduleConfig && (
              <Badge
                variant="outline"
                className={`${moduleConfig.bgColor} ${moduleConfig.textColor}`}
              >
                {moduleConfig.label}
              </Badge>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Description</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {task.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Assignment */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Assignment</h3>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              {task.assigneeName ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {task.assigneeName.charAt(0).toUpperCase()}
                  </div>
                  <span>{task.assigneeName}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </div>
          </div>

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Time Tracking</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {task.estimatedHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                      <div className="font-medium">{task.estimatedHours}h</div>
                    </div>
                  </div>
                )}
                {task.actualHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Actual</div>
                      <div className="font-medium">{task.actualHours}h</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Timeline</h3>

            <div className="space-y-3">
              {/* Created */}
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Created</div>
                  <div className="font-medium">{createdDate.relative}</div>
                  <div className="text-xs text-muted-foreground">{createdDate.formatted}</div>
                </div>
              </div>

              {/* Updated */}
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</div>
                  <div className="font-medium">{updatedDate.relative}</div>
                  <div className="text-xs text-muted-foreground">{updatedDate.formatted}</div>
                </div>
              </div>

              {/* Completed */}
              {completedDate && (
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
                    <div className="font-medium">{completedDate.relative}</div>
                    <div className="text-xs text-muted-foreground">{completedDate.formatted}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {task.metadata && Object.keys(task.metadata).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Additional Information</h3>
              <div className="space-y-2">
                {Object.entries(task.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <span className="font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div className="flex gap-2 pt-4 border-t">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Task
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}