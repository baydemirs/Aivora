import { useState } from 'react'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@/components/ui'
import {
  TaskStatus,
  TaskPriority,
  TaskSortBy,
  TaskFilters as TaskFiltersType,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_MODULE_CONFIG
} from '../types'
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFiltersChange: (filters: TaskFiltersType) => void
  showAdvanced?: boolean
  moduleOptions?: string[]
  assigneeOptions?: Array<{ id: string; name: string }>
}

export function TaskFilters({
  filters,
  onFiltersChange,
  showAdvanced = true,
  moduleOptions = Object.keys(TASK_MODULE_CONFIG),
  assigneeOptions = []
}: TaskFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const updateFilters = (updates: Partial<TaskFiltersType>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      status: 'all',
      priority: 'all',
      module: 'all',
      assignee: 'all',
      sortBy: TaskSortBy.UPDATED_AT,
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters =
    filters.searchQuery ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.module && filters.module !== 'all') ||
    (filters.assignee && filters.assignee !== 'all')

  return (
    <div className="space-y-4">
      {/* Search and Main Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="pl-8"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              updateFilters({ status: value === 'all' ? 'all' : value as TaskStatus })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) =>
              updateFilters({ priority: value === 'all' ? 'all' : value as TaskPriority })
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {Object.entries(TASK_PRIORITY_CONFIG).map(([priority, config]) => (
                <SelectItem key={priority} value={priority}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                updateFilters({ sortBy: value as TaskSortBy })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskSortBy.UPDATED_AT}>Updated</SelectItem>
                <SelectItem value={TaskSortBy.CREATED_AT}>Created</SelectItem>
                <SelectItem value={TaskSortBy.TITLE}>Title</SelectItem>
                <SelectItem value={TaskSortBy.PRIORITY}>Priority</SelectItem>
                <SelectItem value={TaskSortBy.STATUS}>Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateFilters({
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                })
              }
              className="p-2"
            >
              {filters.sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Toggle & Clear */}
        <div className="flex items-center gap-2">
          {showAdvanced && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && isAdvancedOpen && (
        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-sm font-medium text-foreground mb-2 sm:col-span-2 lg:col-span-3">
            Advanced Filters
          </div>

          {/* Module Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Module
            </label>
            <Select
              value={filters.module || 'all'}
              onValueChange={(value) =>
                updateFilters({ module: value === 'all' ? 'all' : value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {moduleOptions.map((module) => (
                  <SelectItem key={module} value={module}>
                    {TASK_MODULE_CONFIG[module as keyof typeof TASK_MODULE_CONFIG]?.label || module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          {assigneeOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Assignee
              </label>
              <Select
                value={filters.assignee || 'all'}
                onValueChange={(value) =>
                  updateFilters({ assignee: value === 'all' ? 'all' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assigneeOptions.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filters:</span>

          {filters.searchQuery && (
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              Search: "{filters.searchQuery}"
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ searchQuery: '' })}
              />
            </div>
          )}

          {filters.status && filters.status !== 'all' && (
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              Status: {TASK_STATUS_CONFIG[filters.status].label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ status: 'all' })}
              />
            </div>
          )}

          {filters.priority && filters.priority !== 'all' && (
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              Priority: {TASK_PRIORITY_CONFIG[filters.priority].label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ priority: 'all' })}
              />
            </div>
          )}

          {filters.module && filters.module !== 'all' && (
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              Module: {TASK_MODULE_CONFIG[filters.module as keyof typeof TASK_MODULE_CONFIG]?.label || filters.module}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => updateFilters({ module: 'all' })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}