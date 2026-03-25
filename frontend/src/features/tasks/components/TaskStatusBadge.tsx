import { Badge } from '@/components/ui'
import { TaskStatus, TASK_STATUS_CONFIG } from '../types'
import {
  Circle,
  Play,
  AlertCircle,
  Eye,
  CheckCircle
} from 'lucide-react'

interface TaskStatusBadgeProps {
  status: TaskStatus
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusIcons = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Play,
  [TaskStatus.BLOCKED]: AlertCircle,
  [TaskStatus.REVIEW]: Eye,
  [TaskStatus.DONE]: CheckCircle,
}

export function TaskStatusBadge({
  status,
  showIcon = true,
  size = 'md'
}: TaskStatusBadgeProps) {
  const config = TASK_STATUS_CONFIG[status]
  const Icon = statusIcons[status]

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  const badgeSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' :
                   size === 'lg' ? 'text-base px-3 py-1' :
                   'text-sm px-2 py-1'

  return (
    <Badge
      className={`inline-flex items-center gap-1.5 ${config.bgColor} ${config.textColor} border-none font-medium ${badgeSize}`}
    >
      {showIcon && (
        <Icon
          className={`${iconSize} ${
            status === TaskStatus.IN_PROGRESS ? 'animate-spin' : ''
          }`}
        />
      )}
      {config.label}
    </Badge>
  )
}