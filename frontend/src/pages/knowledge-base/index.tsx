import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { FileText } from 'lucide-react'
import { 
  useDocuments, 
  useUploadDocument, 
  useDeleteDocument,
  useDocumentStats
} from '@/features/documents/hooks/useDocuments'
import type { DocumentFilters as IDocumentFilters, KBDocument } from '@/features/documents/types'
import { DocumentSortBy } from '@/features/documents/types'
import { 
  DocumentUploadZone, 
  DocumentList, 
  DocumentFilters, 
  DocumentDetailDrawer,
  DeleteDocumentDialog
} from '@/features/documents/components'
import { useI18n } from '@/i18n'

export function KnowledgeBasePage() {
  const { t } = useI18n()
  // State
  const [filters, setFilters] = useState<IDocumentFilters>({
    searchQuery: '',
    status: 'all',
    fileType: 'all',
    sortBy: DocumentSortBy.UPLOADED_AT,
    sortOrder: 'desc'
  })
  
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null)
  const [docToDelete, setDocToDelete] = useState<KBDocument | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Hooks
  const { data: listData, isLoading: isListLoading, error: listError } = useDocuments({
    search: filters.searchQuery,
    status: filters.status === 'all' ? undefined : filters.status,
    fileType: filters.fileType === 'all' ? undefined : filters.fileType,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: 1,
    limit: 50
  })

  // We fetch stats just to have it available for the future metrics cards
  const { data: statsData } = useDocumentStats()

  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()

  // Handlers
  const handleFilterChange = (newFilters: Partial<IDocumentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleUpload = async (files: File[]) => {
    files.forEach(file => {
      uploadMutation.mutate(file)
    })
  }

  const handleRowClick = (doc: KBDocument) => {
    setSelectedDoc(doc)
    setIsDetailOpen(true)
  }

  const handleDeleteClick = (doc: KBDocument, e: React.MouseEvent) => {
    e.stopPropagation()
    setDocToDelete(doc)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!docToDelete) return

    try {
      await deleteMutation.mutateAsync(docToDelete.id)
      setIsDeleteDialogOpen(false)
      setDocToDelete(null)

      // If the detail drawer was open for this document, close it
      if (selectedDoc?.id === docToDelete.id) {
        setIsDetailOpen(false)
        setSelectedDoc(null)
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('kb.title')} description={t('kb.subtitle')}>
        {statsData && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3.5 py-2 text-sm shadow-sm">
            <span className="font-bold text-foreground">{statsData.byStatus.ready}</span>
            <span className="text-muted-foreground">{t('kb.readyOf')}</span>
            <span className="font-bold text-foreground">{statsData.total}</span>
            <span className="text-muted-foreground">{t('kb.documents')}</span>
          </div>
        )}
      </PageHeader>

      {/* Upload Area */}
      <DocumentUploadZone 
        onUpload={handleUpload} 
        isUploading={uploadMutation.isPending} 
      />

      {/* Main Content Area */}
      <Card>
        <CardHeader className="pb-4">
           <div className="flex flex-col space-y-4">
            <div>
              <CardTitle>{t('kb.documentsTitle')}</CardTitle>
              <CardDescription>
                {t('kb.documentsDesc')}
              </CardDescription>
            </div>
            
            <DocumentFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              disabled={isListLoading && !listData}
            />
          </div>
        </CardHeader>
        <CardContent>
          {listError ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
               <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                 <FileText className="h-6 w-6" />
               </div>
               <p className="text-base font-semibold">{t('kb.failed')}</p>
               <p className="text-muted-foreground max-w-sm mt-1 mb-4 text-sm">
                 {t('kb.failedDesc')}
               </p>
               <Button variant="outline" onClick={() => window.location.reload()}>
                 {t('common.retry')}
               </Button>
            </div>
          ) : !isListLoading && listData?.documents.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center border rounded-xl border-dashed bg-muted/20">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">{t('kb.empty')}</p>
              <p className="text-muted-foreground max-w-sm mt-1 text-sm">
                {filters.searchQuery || filters.status !== 'all' || filters.fileType !== 'all'
                  ? t('kb.emptyWithFilter')
                  : t('kb.emptyWithoutFilter')}
              </p>
              {(filters.searchQuery || filters.status !== 'all' || filters.fileType !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilters({
                    searchQuery: '',
                    status: 'all',
                    fileType: 'all',
                    sortBy: DocumentSortBy.UPLOADED_AT,
                    sortOrder: 'desc'
                  })}
                >
                  {t('common.clearFilters')}
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

      {/* Drawer & Dialog */}
      <DocumentDetailDrawer
        document={selectedDoc}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={() => {
          setDocToDelete(selectedDoc)
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
