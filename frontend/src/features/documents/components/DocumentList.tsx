import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { File, Trash2, Database } from 'lucide-react'
import { FILE_TYPE_CONFIG, formatFileSize, EMBEDDING_STATUS_CONFIG } from '../types'
import type { KBDocument } from '../types'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import { formatDistanceToNow } from 'date-fns'

interface DocumentListProps {
  documents: KBDocument[]
  loading?: boolean
  onRowClick: (document: KBDocument) => void
  onDeleteClick: (document: KBDocument, e: React.MouseEvent) => void
}

export function DocumentList({
  documents,
  loading = false,
  onRowClick,
  onDeleteClick,
}: DocumentListProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TargetFile</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded</TableHead>
              <TableHead className="hidden lg:table-cell">Chunks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[60px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px] rounded-full" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-[40px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (documents.length === 0) {
    // Empty state is usually handled by the parent, but we can have a fallback here
    return null
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TargetFile</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Uploaded</TableHead>
            <TableHead className="hidden lg:table-cell">Vector Data</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const typeConfig = FILE_TYPE_CONFIG[doc.fileType]
            const embeddingConfig = EMBEDDING_STATUS_CONFIG[doc.embeddingStatus]

            return (
              <TableRow
                key={doc.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onRowClick(doc)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${typeConfig?.bgColor || 'bg-gray-50'}`}>
                      <File className={`h-4 w-4 ${typeConfig?.iconColor || 'text-gray-500'}`} />
                    </div>
                    <div className="flex flex-col max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                      <span className="font-medium truncate" title={doc.name}>
                        {doc.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className={`uppercase font-semibold ${typeConfig?.textColor || 'text-gray-500'}`}>
                          {doc.fileType}
                        </span>
                        <span>•</span>
                        <span>{doc.uploadedBy}</span>
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatFileSize(doc.size)}
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col">
                    <span>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {doc.chunkCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        {doc.chunkCount} chunks
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="outline" className={`${embeddingConfig.bgColor} ${embeddingConfig.textColor} font-normal border-transparent`}>
                      {embeddingConfig.label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => onDeleteClick(doc, e)}
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
