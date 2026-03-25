import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { TaskStatus, TASK_STATUS_CONFIG } from '../types'
import {
  Circle,
  Play,
  AlertCircle,
  Eye,
  CheckCircle
} from 'lucide-react'

interface TaskStatusSelectProps {
  value: TaskStatus
  onValueChange: (status: TaskStatus) => void
  disabled?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusIcons = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Play,
  [TaskStatus.BLOCKED]: AlertCircle,
  [TaskStatus.REVIEW]: Eye,
  [TaskStatus.DONE]: CheckCircle,
}

export function TaskStatusSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select status...",
  size = 'md'
}: TaskStatusSelectProps) {
  const triggerSize = size === 'sm' ? 'h-8 text-xs' :
                     size === 'lg' ? 'h-12 text-base' :
                     'h-10 text-sm'

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={`w-auto min-w-[120px] ${triggerSize}`}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = statusIcons[value]
                const config = TASK_STATUS_CONFIG[value]
                return (
                  <>
                    <Icon
                      className={`h-4 w-4 ${
                        value === TaskStatus.IN_PROGRESS ? 'animate-spin' : ''
                      }`}
                      style={{ color: `var(--${config.color}-600)` }}
                    />
                    <span>{config.label}</span>
                  </>
                )
              })()}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => {
          const Icon = statusIcons[status as TaskStatus]
          return (
            <SelectItem
              key={status}
              value={status}
              className="flex items-center gap-2"
            >
              <Icon
                className={`h-4 w-4 ${
                  status === TaskStatus.IN_PROGRESS ? 'animate-spin' : ''
                }`}
                style={{ color: `var(--${config.color}-600)` }}
              />
              {config.label}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}