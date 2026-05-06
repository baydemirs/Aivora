import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { FileText } from 'lucide-react'
import {
  useDocuments,
  useDocument,
  useUploadDocument,
  useDeleteDocument,
  useDocumentStats,
} from '@/features/documents/hooks/useDocuments'
import type { DocumentFilters as IDocumentFilters, KBDocument } from '@/features/documents/types'
import { DocumentSortBy } from '@/features/documents/types'
import {
  DocumentUploadZone,
  DocumentList,
  DocumentFilters,
  DocumentDetailDrawer,
  DeleteDocumentDialog,
} from '@/features/documents/components'
import { toPublicErrorMessage } from '@/lib/errors'
import { logDevError } from '@/lib/logger'

export function KnowledgeBasePage() {
  const [filters, setFilters] = useState<IDocumentFilters>({
    searchQuery: '',
    status: 'all',
    fileType: 'all',
    sortBy: DocumentSortBy.UPLOADED_AT,
    sortOrder: 'desc',
  })

  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null)
  const [docToDelete, setDocToDelete] = useState<KBDocument | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionError, setActionError] = useState('')

  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchDocuments,
  } = useDocuments({
    search: filters.searchQuery || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    fileType: filters.fileType === 'all' ? undefined : filters.fileType,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: 1,
    limit: 50,
  })

  const { data: statsData } = useDocumentStats()
  const { data: selectedDocDetail, isLoading: isDetailLoading } = useDocument(
    selectedDoc?.id || '',
    isDetailOpen && !!selectedDoc?.id,
  )

  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()

  const handleFilterChange = (newFilters: Partial<IDocumentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleUpload = async (files: File[]) => {
    if (files.length === 0 || uploadMutation.isPending) return
    setActionError('')

    const results = await Promise.allSettled(files.map((file) => uploadMutation.mutateAsync(file)))
    const failedCount = results.filter((result) => result.status === 'rejected').length

    if (failedCount > 0) {
      setActionError(
        failedCount === files.length
          ? 'Document upload failed. Please try again.'
          : `${failedCount} document upload failed. The rest were uploaded.`,
      )
    }
  }

  const handleRowClick = (doc: KBDocument) => {
    setActionError('')
    setSelectedDoc(doc)
    setIsDetailOpen(true)
  }

  const handleDeleteClick = (doc: KBDocument, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionError('')
    setDocToDelete(doc)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!docToDelete) return

    try {
      setActionError('')
      await deleteMutation.mutateAsync(docToDelete.id)
      setIsDeleteDialogOpen(false)
      setDocToDelete(null)

      if (selectedDoc?.id === docToDelete.id) {
        setIsDetailOpen(false)
        setSelectedDoc(null)
      }
    } catch (error) {
      logDevError('Failed to delete document.', error)
      setActionError(toPublicErrorMessage(error, 'Failed to delete document'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your organization's documents and RAG vector embeddings
          </p>
        </div>

        {statsData && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
            <span className="font-semibold">{statsData.byStatus.ready}</span>
            <span className="text-muted-foreground">ready of</span>
            <span className="font-semibold">{statsData.total}</span>
            <span className="text-muted-foreground">documents</span>
          </div>
        )}
      </div>

      <DocumentUploadZone onUpload={handleUpload} isUploading={uploadMutation.isPending} />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Browse and manage uploaded files and their embedding status
              </CardDescription>
            </div>

            {actionError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {actionError}
              </div>
            )}

            <DocumentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              disabled={isListLoading && !listData}
            />
          </div>
        </CardHeader>
        <CardContent>
          {listError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-lg font-medium">Failed to load documents</p>
              <p className="mt-1 mb-4 max-w-sm text-muted-foreground">
                There was an error communicating with the server. Please check your connection and try again.
              </p>
              <Button variant="outline" onClick={() => void refetchDocuments()}>
                Retry
              </Button>
            </div>
          ) : !isListLoading && listData?.documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed bg-muted/30 py-16 text-center rounded-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">No documents found</p>
              <p className="mt-1 max-w-sm text-muted-foreground">
                {filters.searchQuery || filters.status !== 'all' || filters.fileType !== 'all'
                  ? "We couldn't find any documents matching your current filters. Try adjusting your search criteria."
                  : "You haven't uploaded any documents yet. Drag and drop a file above to get started."}
              </p>
              {(filters.searchQuery || filters.status !== 'all' || filters.fileType !== 'all') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      status: 'all',
                      fileType: 'all',
                      sortBy: DocumentSortBy.UPLOADED_AT,
                      sortOrder: 'desc',
                    })
                  }
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <DocumentList
              documents={listData?.documents || []}
              loading={isListLoading}
              onRowClick={handleRowClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      <DocumentDetailDrawer
        document={selectedDocDetail || selectedDoc}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        loading={isDetailLoading}
        onDelete={() => {
          setDocToDelete(selectedDocDetail || selectedDoc)
          setIsDeleteDialogOpen(true)
        }}
      />

      <DeleteDocumentDialog
        document={docToDelete}
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
