import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
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

export function KnowledgeBasePage() {
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
    // In a real app we would upload sequentially or in parallel
    // Since this is mock with delay, we'll just trigger them all and let React Query handle optimistic UI
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
    
    await deleteMutation.mutateAsync(docToDelete.id)
    setIsDeleteDialogOpen(false)
    setDocToDelete(null)
    
    // If the detail drawer was open for this document, close it
    if (selectedDoc?.id === docToDelete.id) {
      setIsDetailOpen(false)
      setSelectedDoc(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's documents and RAG vector embeddings
          </p>
        </div>
        
        {/* Simple top-level stat indicating total ready documents vs total */}
        {statsData && (
          <div className="bg-muted px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <span className="font-semibold">{statsData.byStatus.ready}</span>
             <span className="text-muted-foreground">ready of</span>
            <span className="font-semibold">{statsData.total}</span>
            <span className="text-muted-foreground">documents</span>
          </div>
        )}
      </div>

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
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Browse and manage uploaded files and their embedding status
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
               <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                 <FileText className="h-6 w-6" />
               </div>
               <p className="text-lg font-medium">Failed to load documents</p>
               <p className="text-muted-foreground max-w-sm mt-1 mb-4">
                 There was an error communicating with the server. Please check your connection and try again.
               </p>
               <Button variant="outline" onClick={() => window.location.reload()}>
                 Retry
               </Button>
            </div>
          ) : !isListLoading && listData?.documents.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center border rounded-lg border-dashed bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">No documents found</p>
              <p className="text-muted-foreground max-w-sm mt-1">
                {filters.searchQuery || filters.status !== 'all' || filters.fileType !== 'all'
                  ? "We couldn't find any documents matching your current filters. Try adjusting your search criteria."
                  : "You haven't uploaded any documents yet. Drag and drop a file above to get started."}
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
