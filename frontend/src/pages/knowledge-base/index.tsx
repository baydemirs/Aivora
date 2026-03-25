import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { Upload, FileText, File, Trash2, Search } from 'lucide-react'
import type { Document } from '@/types'

// Mock data - will be replaced with API calls
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Product Requirements Document.pdf',
    tenantId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    _count: { chunks: 24 },
  },
  {
    id: '2',
    title: 'Technical Architecture.docx',
    tenantId: '1',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    _count: { chunks: 18 },
  },
  {
    id: '3',
    title: 'API Documentation.pdf',
    tenantId: '1',
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
    _count: { chunks: 42 },
  },
  {
    id: '4',
    title: 'User Guide.txt',
    tenantId: '1',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
    _count: { chunks: 8 },
  },
]

const fileTypeIcons: Record<string, string> = {
  pdf: 'text-red-500',
  docx: 'text-blue-500',
  doc: 'text-blue-500',
  txt: 'text-gray-500',
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    setIsUploading(true)
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newDocs: Document[] = files.map((file, index) => ({
      id: String(Date.now() + index),
      title: file.name,
      tenantId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { chunks: Math.floor(Math.random() * 30) + 5 },
    }))

    setDocuments(prev => [...newDocs, ...prev])
    setIsUploading(false)
  }

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">
              {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Supports PDF, DOCX, DOC, and TXT files
            </p>
            {isUploading && (
              <div className="mt-4">
                <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents ({documents.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => {
                const ext = getFileExtension(doc.title)
                const iconColor = fileTypeIcons[ext] || 'text-gray-500'

                return (
                  <div
                    key={doc.id}
                    className="group relative rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <File className={`h-8 w-8 flex-shrink-0 ${iconColor}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium" title={doc.title}>
                          {doc.title}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {doc._count?.chunks || 0} chunks
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
