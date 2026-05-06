import * as React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui'
import { Link } from 'react-router-dom'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  iconColor?: string
  iconBg?: string
  loading?: boolean
  to?: string
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  loading,
  to,
  className,
  onClick,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'group relative rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200',
        (to || onClick) && 'cursor-pointer hover:shadow-md hover:border-border',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-16" />
              {description && <Skeleton className="h-3.5 w-24" />}
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </>
          )}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  )

  return to ? <Link to={to}>{content}</Link> : content
}
