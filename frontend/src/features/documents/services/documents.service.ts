import type {
  KBDocument,
  GetDocumentsQuery,
  GetDocumentsResponse,
  DocumentStats,
} from '../types'
import {
  DocumentStatus,
  DocumentFileType,
  EmbeddingStatus,
  DocumentSortBy,
  getFileTypeFromExtension,
} from '../types'

// Mock data
const MOCK_DOCUMENTS: KBDocument[] = [
  {
    id: 'doc-1',
    name: 'Product Requirements Document.pdf',
    fileType: DocumentFileType.PDF,
    size: 2457600, // ~2.3 MB
    status: DocumentStatus.READY,
    uploadedAt: '2024-01-15T10:00:00Z',
    uploadedBy: 'Alex Morgan',
    tenantName: 'Acme Corp',
    chunkCount: 24,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  },
  {
    id: 'doc-2',
    name: 'Technical Architecture Overview.docx',
    fileType: DocumentFileType.DOCX,
    size: 1843200, // ~1.8 MB
    status: DocumentStatus.READY,
    uploadedAt: '2024-01-16T14:30:00Z',
    uploadedBy: 'Sarah Chen',
    tenantName: 'Acme Corp',
    chunkCount: 18,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  },
  {
    id: 'doc-3',
    name: 'API Documentation v2.pdf',
    fileType: DocumentFileType.PDF,
    size: 4096000, // ~3.9 MB
    status: DocumentStatus.READY,
    uploadedAt: '2024-01-17T09:00:00Z',
    uploadedBy: 'Mike Johnson',
    tenantName: 'Acme Corp',
    chunkCount: 42,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  },
  {
    id: 'doc-4',
    name: 'User Guide.txt',
    fileType: DocumentFileType.TXT,
    size: 51200, // ~50 KB
    status: DocumentStatus.READY,
    uploadedAt: '2024-01-18T11:00:00Z',
    uploadedBy: 'Alex Morgan',
    tenantName: 'Acme Corp',
    chunkCount: 8,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  },
  {
    id: 'doc-5',
    name: 'Financial Report Q4.xlsx',
    fileType: DocumentFileType.XLSX,
    size: 3276800, // ~3.1 MB
    status: DocumentStatus.PROCESSING,
    uploadedAt: '2024-01-20T16:00:00Z',
    uploadedBy: 'Sarah Chen',
    tenantName: 'Acme Corp',
    chunkCount: 0,
    embeddingStatus: EmbeddingStatus.IN_PROGRESS,
  },
  {
    id: 'doc-6',
    name: 'Onboarding Checklist.docx',
    fileType: DocumentFileType.DOCX,
    size: 716800, // ~700 KB
    status: DocumentStatus.ERROR,
    uploadedAt: '2024-01-21T08:30:00Z',
    uploadedBy: 'Mike Johnson',
    tenantName: 'Acme Corp',
    chunkCount: 0,
    embeddingStatus: EmbeddingStatus.FAILED,
    metadata: { errorMessage: 'Failed to parse document structure' },
  },
  {
    id: 'doc-7',
    name: 'Release Notes v3.1.txt',
    fileType: DocumentFileType.TXT,
    size: 28672, // ~28 KB
    status: DocumentStatus.ARCHIVED,
    uploadedAt: '2024-01-10T09:00:00Z',
    uploadedBy: 'Alex Morgan',
    tenantName: 'Acme Corp',
    chunkCount: 5,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  },
  {
    id: 'doc-8',
    name: 'Sprint Planning Template.xlsx',
    fileType: DocumentFileType.XLSX,
    size: 1048576, // ~1 MB
    status: DocumentStatus.READY,
    uploadedAt: '2024-01-22T13:15:00Z',
    uploadedBy: 'Sarah Chen',
    tenantName: 'Acme Corp',
    chunkCount: 12,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  },
]

class MockDocumentService {
  private documents: KBDocument[] = [...MOCK_DOCUMENTS]
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getDocuments(query: GetDocumentsQuery = {}): Promise<GetDocumentsResponse> {
    await this.delay(400)

    const {
      page = 1,
      limit = 50,
      search = '',
      status,
      fileType,
      sortBy = DocumentSortBy.UPLOADED_AT,
      sortOrder = 'desc',
    } = query

    let filtered = [...this.documents]

    // Search filter
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(s) ||
          doc.uploadedBy.toLowerCase().includes(s) ||
          doc.tenantName.toLowerCase().includes(s),
      )
    }

    // Status filter
    if (status) {
      filtered = filtered.filter((doc) => doc.status === status)
    }

    // FileType filter
    if (fileType) {
      filtered = filtered.filter((doc) => doc.fileType === fileType)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortBy as keyof KBDocument] as string | number
      let bVal: string | number = b[sortBy as keyof KBDocument] as string | number

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    // Pagination
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    return {
      documents: paginated,
      totalCount,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async getDocumentById(id: string): Promise<KBDocument | null> {
    await this.delay(200)
    return this.documents.find((doc) => doc.id === id) || null
  }

  async uploadDocument(file: File): Promise<KBDocument> {
    // Simulate upload + processing delay
    await this.delay(1500)

    const fileType = getFileTypeFromExtension(file.name) || DocumentFileType.TXT

    const newDoc: KBDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      fileType,
      size: file.size,
      status: DocumentStatus.PROCESSING,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      tenantName: 'Acme Corp',
      chunkCount: 0,
      embeddingStatus: EmbeddingStatus.PENDING,
    }

    this.documents.unshift(newDoc)

    // Simulate processing completion after a delay
    setTimeout(() => {
      const idx = this.documents.findIndex((d) => d.id === newDoc.id)
      if (idx !== -1) {
        this.documents[idx] = {
          ...this.documents[idx],
          status: DocumentStatus.READY,
          chunkCount: Math.floor(Math.random() * 30) + 5,
          embeddingStatus: EmbeddingStatus.COMPLETED,
        }
      }
    }, 3000)

    return newDoc
  }

  async deleteDocument(id: string): Promise<void> {
    await this.delay(400)

    const idx = this.documents.findIndex((doc) => doc.id === id)
    if (idx === -1) {
      throw new Error('Document not found')
    }

    this.documents.splice(idx, 1)
  }

  async getDocumentStats(): Promise<DocumentStats> {
    await this.delay(200)

    const stats: DocumentStats = {
      total: this.documents.length,
      byStatus: {
        [DocumentStatus.UPLOADING]: 0,
        [DocumentStatus.PROCESSING]: 0,
        [DocumentStatus.READY]: 0,
        [DocumentStatus.ERROR]: 0,
        [DocumentStatus.ARCHIVED]: 0,
      },
      byFileType: {
        [DocumentFileType.PDF]: 0,
        [DocumentFileType.DOCX]: 0,
        [DocumentFileType.XLSX]: 0,
        [DocumentFileType.TXT]: 0,
      },
      totalChunks: 0,
      averageChunks: 0,
    }

    this.documents.forEach((doc) => {
      stats.byStatus[doc.status]++
      stats.byFileType[doc.fileType]++
      stats.totalChunks += doc.chunkCount
    })

    stats.averageChunks =
      stats.total > 0 ? Math.round(stats.totalChunks / stats.total) : 0

    return stats
  }

  resetData(): void {
    this.documents = [...MOCK_DOCUMENTS]
  }
}

// Singleton instance
export const documentService = new MockDocumentService()
