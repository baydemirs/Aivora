import { useMemo, useState, type FormEvent } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { useI18n } from '@/i18n'
import { AlertCircle, Loader2, Plus, Sparkles } from 'lucide-react'
import {
  TASK_MODULE_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  TaskModule,
  TaskPriority,
  TaskStatus,
} from '../types'
import type { CreateTaskRequest } from '../types'

type CreateTaskFormValues = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  module: string
  tags: string
}

type CreateTaskFormErrors = Partial<Record<keyof CreateTaskFormValues | 'submit', string>>

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTask: (data: CreateTaskRequest) => Promise<void>
  isSubmitting?: boolean
}

const initialFormValues: CreateTaskFormValues = {
  title: '',
  description: '',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  module: TaskModule.DASHBOARD,
  tags: '',
}

const taskStatusLabelKey: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'tasks.todo',
  [TaskStatus.IN_PROGRESS]: 'tasks.inProgress',
  [TaskStatus.BLOCKED]: 'tasks.blocked',
  [TaskStatus.REVIEW]: 'tasks.review',
  [TaskStatus.DONE]: 'tasks.done',
}

const taskPriorityLabelKey: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'tasks.low',
  [TaskPriority.MEDIUM]: 'tasks.medium',
  [TaskPriority.HIGH]: 'tasks.high',
  [TaskPriority.URGENT]: 'tasks.urgent',
}

const taskModuleLabelKey: Partial<Record<TaskModule, string>> = {
  [TaskModule.AUTH]: 'tasks.auth',
  [TaskModule.RAG]: 'tasks.rag',
  [TaskModule.CHAT]: 'tasks.chatModule',
  [TaskModule.KNOWLEDGE_BASE]: 'tasks.kbModule',
  [TaskModule.DASHBOARD]: 'tasks.dashboardModule',
  [TaskModule.INFRASTRUCTURE]: 'tasks.infrastructure',
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onCreateTask,
  isSubmitting = false,
}: CreateTaskDialogProps) {
  const { t } = useI18n()
  const [values, setValues] = useState<CreateTaskFormValues>(initialFormValues)
  const [errors, setErrors] = useState<CreateTaskFormErrors>({})

  const moduleOptions = useMemo(() => Object.keys(TASK_MODULE_CONFIG), [])

  const resetForm = () => {
    setValues(initialFormValues)
    setErrors({})
  }

  const updateValue = <TKey extends keyof CreateTaskFormValues>(
    key: TKey,
    value: CreateTaskFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key] && !current.submit) return current
      const next = { ...current }
      delete next[key]
      delete next.submit
      return next
    })
  }

  const validate = () => {
    const nextErrors: CreateTaskFormErrors = {}
    const trimmedTitle = values.title.trim()
    const trimmedModule = values.module.trim()

    if (!trimmedTitle) {
      nextErrors.title = t('tasks.createTitleRequired')
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = t('tasks.createTitleMin')
    } else if (trimmedTitle.length > 140) {
      nextErrors.title = t('tasks.createTitleMax')
    }

    if (values.description.length > 1000) {
      nextErrors.description = t('tasks.createDescriptionMax')
    }

    if (!trimmedModule) {
      nextErrors.module = t('tasks.createModuleRequired')
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const tags = splitTags(values.tags)

    try {
      setErrors({})
      await onCreateTask({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        status: values.status,
        priority: values.priority,
        module: values.module.trim(),
        tags: tags.length > 0 ? tags : undefined,
      })
      resetForm()
      onOpenChange(false)
    } catch (error) {
      setErrors({
        submit: getErrorMessage(error, t('tasks.createFailed')),
      })
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) {
      if (!nextOpen) {
        resetForm()
      }
      onOpenChange(nextOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b border-border/70 bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg">{t('tasks.createTitle')}</DialogTitle>
              <DialogDescription>{t('tasks.createDescription')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {errors.submit && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="task-title">{t('tasks.createTitleLabel')}</Label>
            <Input
              id="task-title"
              value={values.title}
              onChange={(event) => updateValue('title', event.target.value)}
              placeholder={t('tasks.createTitlePlaceholder')}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.title)}
              className={errors.title ? 'border-destructive focus-visible:ring-destructive/30' : ''}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">{t('tasks.createDescriptionLabel')}</Label>
            <Textarea
              id="task-description"
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              placeholder={t('tasks.createDescriptionPlaceholder')}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.description)}
              className={`min-h-24 resize-none ${
                errors.description ? 'border-destructive focus-visible:ring-destructive/30' : ''
              }`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('tasks.statusLabel')}</Label>
              <Select
                value={values.status}
                onValueChange={(value) => updateValue('status', value as TaskStatus)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TASK_STATUS_CONFIG).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(taskStatusLabelKey[status as TaskStatus])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('tasks.priorityLabel')}</Label>
              <Select
                value={values.priority}
                onValueChange={(value) => updateValue('priority', value as TaskPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TASK_PRIORITY_CONFIG).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {t(taskPriorityLabelKey[priority as TaskPriority])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('tasks.moduleLabel')}</Label>
              <Select
                value={values.module}
                onValueChange={(value) => updateValue('module', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.module ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moduleOptions.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module === TaskModule.API
                        ? 'API'
                        : t(taskModuleLabelKey[module as TaskModule] || 'tasks.module')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.module && <p className="text-xs text-destructive">{errors.module}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-tags">{t('tasks.tagsLabel')}</Label>
              <Input
                id="task-tags"
                value={values.tags}
                onChange={(event) => updateValue('tags', event.target.value)}
                placeholder={t('tasks.tagsPlaceholder')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('tasks.createCancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('tasks.createSubmitting')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t('tasks.createSubmit')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
