import { Badge } from '@/components/ui'
import { DocumentStatus, DOCUMENT_STATUS_CONFIG } from '../types'
import { CheckCircle, AlertCircle, Loader2, Upload, Archive } from 'lucide-react'

interface DocumentStatusBadgeProps {
  status: DocumentStatus
  className?: string
}

export function DocumentStatusBadge({ status, className = '' }: DocumentStatusBadgeProps) {
  const config = DOCUMENT_STATUS_CONFIG[status] || DOCUMENT_STATUS_CONFIG[DocumentStatus.ERROR]

  const getIcon = () => {
    switch (config.icon) {
      case 'check-circle':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'alert-circle':
        return <AlertCircle className="h-3 w-3 mr-1" />
      case 'loader':
        return <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      case 'upload':
        return <Upload className="h-3 w-3 mr-1 animate-pulse" />
      case 'archive':
        return <Archive className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.textColor} border-transparent flex items-center shrink-0 w-fit ${className}`}
    >
      {getIcon()}
      {config.label}
    </Badge>
  )
}
