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
import { FILE_TYPE_CONFIG, EMBEDDING_STATUS_CONFIG, formatFileSize } from '../types'
import type { KBDocument } from '../types'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import {
  Calendar,
  User,
  Trash2,
  Copy,
  CheckCircle2,
  Building,
  HardDrive,
  Database
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface DocumentDetailDrawerProps {
  document: KBDocument | null
  open: boolean
  onClose: () => void
  onDelete?: () => void
  loading?: boolean
}

export function DocumentDetailDrawer({
  document: doc,
  open,
  onClose,
  onDelete,
  loading = false,
}: DocumentDetailDrawerProps) {
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

  if (loading || !doc) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
             <SheetTitle>
              <Skeleton className="h-6 w-48" />
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
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

  const typeConfig = FILE_TYPE_CONFIG[doc.fileType]
  const embeddingConfig = EMBEDDING_STATUS_CONFIG[doc.embeddingStatus]
  const uploadedDate = formatDate(doc.uploadedAt)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <SheetTitle className="text-lg font-semibold leading-6 pr-8 flex items-start gap-2">
              <span className="break-all">{doc.name}</span>
            </SheetTitle>
            <div className="flex items-center gap-1 ml-auto shrink-0 mt-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleCopy(doc.name, 'name')}
                title="Copy name"
              >
                {copied === 'name' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            ID: <span className="font-mono text-xs truncate max-w-[200px]">{doc.id}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleCopy(doc.id, 'id')}
            >
              {copied === 'id' ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status Row */}
          <div className="flex flex-wrap gap-3">
            <DocumentStatusBadge status={doc.status} />
            <Badge variant="outline" className={`${typeConfig?.bgColor} ${typeConfig?.textColor} border-transparent uppercase font-semibold`}>
              {doc.fileType}
            </Badge>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
             {/* File Size */}
             <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <HardDrive className="h-3 w-3" /> Size
              </div>
              <div className="font-medium text-sm">{formatFileSize(doc.size)}</div>
            </div>

            {/* Chunks */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Database className="h-3 w-3" /> Vectors
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{doc.chunkCount} chunks</span>
                <Badge variant="outline" className={`${embeddingConfig.bgColor} ${embeddingConfig.textColor} text-[10px] px-1.5 py-0 border-transparent h-5`}>
                  {embeddingConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Context Input */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground border-b pb-2">Context</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 flex justify-center"><User className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Uploaded By</div>
                  <div className="font-medium">{doc.uploadedBy}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 flex justify-center"><Building className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Tenant</div>
                  <div className="font-medium">{doc.tenantName}</div>
                </div>
              </div>

              <div className="flex flex-start gap-3 text-sm">
                <div className="w-8 flex justify-center pt-0.5"><Calendar className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Upload Date</div>
                  <div className="font-medium">{uploadedDate.relative}</div>
                  <div className="text-xs text-muted-foreground">{uploadedDate.formatted}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {doc.metadata && Object.keys(doc.metadata).length > 0 && (
            <div className="space-y-2 pb-2 border-b">
              <h3 className="text-sm font-medium text-foreground">Advanced Properties</h3>
              <div className="space-y-2 mt-2 bg-muted/30 p-3 rounded-md border text-xs font-mono">
                {Object.entries(doc.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted-foreground font-semibold">
                      {key}:
                    </span>
                    <span className="text-foreground break-all">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {onDelete && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-center"
              >
                <Trash2 className="h-4 w-4" />
                Delete Document
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
