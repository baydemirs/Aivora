import apiClient from '@/services/api/client'
import { storage } from '@/utils/storage'
import {
  DocumentFileType,
  DocumentSortBy,
  DocumentStatus,
  EmbeddingStatus,
  getFileTypeFromExtension,
} from '../types'
import type {
  DocumentStats,
  GetDocumentsQuery,
  GetDocumentsResponse,
  KBDocument,
} from '../types'
import type { User } from '@/types'

type ApiDocument = {
  id: string
  title: string
  tenantId: string
  createdAt: string
  updatedAt: string
  _count?: {
    chunks: number
  }
}

type UploadDocumentResponse = {
  documentId: string
  title: string
  chunksCount: number
  totalChunks: number
}

function currentTenantName(): string {
  return storage.getUser<User>()?.tenantName || ''
}

function toDocument(apiDocument: ApiDocument): KBDocument {
  return {
    id: apiDocument.id,
    name: apiDocument.title,
    fileType: getFileTypeFromExtension(apiDocument.title) || DocumentFileType.TXT,
    size: 0,
    status: DocumentStatus.READY,
    uploadedAt: apiDocument.createdAt,
    uploadedBy: 'Current User',
    tenantName: currentTenantName(),
    chunkCount: apiDocument._count?.chunks ?? 0,
    embeddingStatus: EmbeddingStatus.COMPLETED,
  }
}

function applyFilters(documents: KBDocument[], query: GetDocumentsQuery): KBDocument[] {
  let filtered = [...documents]

  if (query.search) {
    const search = query.search.toLowerCase()
    filtered = filtered.filter(
      (doc) =>
        doc.name.toLowerCase().includes(search) ||
        doc.tenantName.toLowerCase().includes(search),
    )
  }

  if (query.status) {
    filtered = filtered.filter((doc) => doc.status === query.status)
  }

  if (query.fileType) {
    filtered = filtered.filter((doc) => doc.fileType === query.fileType)
  }

  return filtered
}

function sortDocuments(documents: KBDocument[], query: GetDocumentsQuery): KBDocument[] {
  const sortBy = query.sortBy || DocumentSortBy.UPLOADED_AT
  const sortOrder = query.sortOrder || 'desc'

  return [...documents].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue === bValue) return 0
    const comparison = aValue > bValue ? 1 : -1
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

function paginateDocuments(
  documents: KBDocument[],
  query: GetDocumentsQuery,
): GetDocumentsResponse {
  const page = query.page || 1
  const limit = query.limit || 50
  const totalCount = documents.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const start = (page - 1) * limit

  return {
    documents: documents.slice(start, start + limit),
    totalCount,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function buildStats(documents: KBDocument[]): DocumentStats {
  const stats: DocumentStats = {
    total: documents.length,
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

  for (const doc of documents) {
    stats.byStatus[doc.status]++
    stats.byFileType[doc.fileType]++
    stats.totalChunks += doc.chunkCount
  }

  stats.averageChunks =
    stats.total > 0 ? Math.round(stats.totalChunks / stats.total) : 0

  return stats
}

class ApiDocumentService {
  async getDocuments(query: GetDocumentsQuery = {}): Promise<GetDocumentsResponse> {
    const response = await apiClient.get<ApiDocument[]>('/knowledge-base')
    const documents = response.data.map(toDocument)
    return paginateDocuments(
      sortDocuments(applyFilters(documents, query), query),
      query,
    )
  }

  async getDocumentById(id: string): Promise<KBDocument | null> {
    const response = await this.getDocuments()
    return response.documents.find((doc) => doc.id === id) || null
  }

  async uploadDocument(file: File): Promise<KBDocument> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<UploadDocumentResponse>(
      '/knowledge-base/upload',
      formData,
    )

    return {
      id: response.data.documentId,
      name: response.data.title,
      fileType: getFileTypeFromExtension(response.data.title) || DocumentFileType.TXT,
      size: file.size,
      status: DocumentStatus.READY,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      tenantName: currentTenantName(),
      chunkCount: response.data.chunksCount,
      embeddingStatus: EmbeddingStatus.COMPLETED,
      metadata: { totalChunks: response.data.totalChunks },
    }
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/knowledge-base/${id}`)
  }

  async getDocumentStats(): Promise<DocumentStats> {
    const response = await this.getDocuments()
    return buildStats(response.documents)
  }
}

export const documentService = new ApiDocumentService()
