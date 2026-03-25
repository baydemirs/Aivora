import { Badge } from '@/components/ui'
import { TaskPriority, TASK_PRIORITY_CONFIG } from '../types'
import {
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle
} from 'lucide-react'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const priorityIcons = {
  [TaskPriority.LOW]: ArrowDown,
  [TaskPriority.MEDIUM]: Minus,
  [TaskPriority.HIGH]: ArrowUp,
  [TaskPriority.URGENT]: AlertTriangle,
}

export function TaskPriorityBadge({
  priority,
  showIcon = true,
  size = 'md'
}: TaskPriorityBadgeProps) {
  const config = TASK_PRIORITY_CONFIG[priority]
  const Icon = priorityIcons[priority]

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  const badgeSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' :
                   size === 'lg' ? 'text-base px-3 py-1' :
                   'text-sm px-2 py-1'

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 ${config.bgColor} ${config.textColor} border-current ${badgeSize}`}
    >
      {showIcon && (
        <Icon className={iconSize} />
      )}
      {config.label}
    </Badge>
  )
}