import apiClient from '@/services/api/client'
import { env } from '@/config/env'
import axios from 'axios'
import { AppError, toAppError } from '@/lib/errors'
import {
  DocumentFileType,
  DocumentSortBy,
  DocumentStatus,
  EmbeddingStatus,
  getFileTypeFromExtension,
  type DocumentStats,
  type GetDocumentsQuery,
  type GetDocumentsResponse,
  type KBDocument,
} from '../types'
import {
  apiDocumentToDocument,
  type ApiDocument,
} from '../mappers/document.mapper'
import { getCurrentTenantId, getCurrentUser, isTenantScopedRecord } from '@/utils/tenant'

const buildPagination = (
  documents: KBDocument[],
  page: number,
  limit: number,
): GetDocumentsResponse => {
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

const sortDocuments = (
  documents: KBDocument[],
  sortBy: DocumentSortBy,
  sortOrder: 'asc' | 'desc',
) => {
  return [...documents].sort((a, b) => {
    const aVal = a[sortBy as keyof KBDocument]
    const bVal = b[sortBy as keyof KBDocument]

    if (aVal == null || bVal == null) return 0
    const aCmp = typeof aVal === 'string' ? aVal.toLowerCase() : Number(aVal)
    const bCmp = typeof bVal === 'string' ? bVal.toLowerCase() : Number(bVal)

    if (sortOrder === 'asc') return aCmp < bCmp ? -1 : aCmp > bCmp ? 1 : 0
    return aCmp > bCmp ? -1 : aCmp < bCmp ? 1 : 0
  })
}

const filterDocuments = (documents: KBDocument[], query: GetDocumentsQuery) => {
  const { search, status, fileType } = query
  let filtered = [...documents]

  if (search) {
    const needle = search.toLowerCase()
    filtered = filtered.filter(
      (doc) =>
        doc.name.toLowerCase().includes(needle) ||
        doc.uploadedBy.toLowerCase().includes(needle) ||
        doc.tenantName.toLowerCase().includes(needle),
    )
  }
  if (status) filtered = filtered.filter((doc) => doc.status === status)
  if (fileType) filtered = filtered.filter((doc) => doc.fileType === fileType)
  return filtered
}

class RealDocumentService {
  async getDocuments(query: GetDocumentsQuery = {}): Promise<GetDocumentsResponse> {
    const page = query.page || 1
    const limit = query.limit || 50
    const sortBy = query.sortBy || DocumentSortBy.UPLOADED_AT
    const sortOrder = query.sortOrder || 'desc'

    // Backend currently supports base listing; we still pass filters for forward compatibility.
    let response
    try {
      response = await apiClient.get<ApiDocument[]>('/knowledge-base', {
        params: {
          search: query.search,
          status: query.status,
          fileType: query.fileType,
          sortBy,
          sortOrder,
          page,
          limit,
        },
      })
    } catch (error) {
      throw toAppError(error, 'Failed to fetch documents')
    }

    const currentUser = getCurrentUser()
    const tenantId = getCurrentTenantId()
    const scoped = response.data.filter((doc) => isTenantScopedRecord(doc.tenantId, tenantId))
    const mapped = scoped.map((doc) =>
      apiDocumentToDocument(doc, {
        tenantName: currentUser?.tenantName,
        uploadedBy: currentUser?.fullName || 'System',
      }),
    )
    const filtered = filterDocuments(mapped, query)
    const sorted = sortDocuments(filtered, sortBy, sortOrder)
    return buildPagination(sorted, page, limit)
  }

  async getDocumentById(id: string): Promise<KBDocument | null> {
    const tenantId = getCurrentTenantId()
    const currentUser = getCurrentUser()

    try {
      const byId = await apiClient.get<ApiDocument>(`/knowledge-base/${id}`)
      if (!isTenantScopedRecord(byId.data.tenantId, tenantId)) return null
      return apiDocumentToDocument(byId.data, {
        tenantName: currentUser?.tenantName,
        uploadedBy: currentUser?.fullName || 'System',
      })
    } catch {
      // Fallback for backends that only expose list endpoint.
      const all = await this.getDocuments({ page: 1, limit: 1000 })
      const found = all.documents.find((doc) => doc.id === id) ?? null
      if (!found) return null
      if (currentUser?.tenantName && !found.tenantName) {
        return { ...found, tenantName: currentUser.tenantName }
      }
      return found
    }
  }

  async uploadDocument(file: File): Promise<KBDocument> {
    const formData = new FormData()
    formData.append('file', file)

    let response
    try {
      response = await apiClient.post<{
        documentId: string
        title: string
        chunksCount: number
        totalChunks: number
      }>('/knowledge-base/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch (error) {
      throw toAppError(error, 'Document upload failed')
    }

    const currentUser = getCurrentUser()

    return {
      id: response.data.documentId,
      name: response.data.title,
      fileType: getFileTypeFromExtension(response.data.title) ?? DocumentFileType.TXT,
      size: file.size,
      status: response.data.chunksCount > 0 ? DocumentStatus.READY : DocumentStatus.PROCESSING,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.fullName || currentUser?.email || 'Current User',
      tenantName: currentUser?.tenantName || 'Organization',
      chunkCount: response.data.chunksCount,
      embeddingStatus:
        response.data.chunksCount > 0 ? EmbeddingStatus.COMPLETED : EmbeddingStatus.IN_PROGRESS,
      metadata: {
        totalChunks: response.data.totalChunks,
      },
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await apiClient.delete(`/knowledge-base/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 404 || status === 405) {
          throw new AppError('unsupported', 'Document deletion is not supported by this backend yet')
        }
      }
      throw toAppError(error, 'Document deletion failed')
    }
  }

  async getDocumentStats(): Promise<DocumentStats> {
    const documents = (await this.getDocuments({ page: 1, limit: 1000 })).documents
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

    documents.forEach((doc) => {
      stats.byStatus[doc.status]++
      stats.byFileType[doc.fileType]++
      stats.totalChunks += doc.chunkCount
    })
    stats.averageChunks = stats.total > 0 ? Math.round(stats.totalChunks / stats.total) : 0
    return stats
  }
}

class MockDocumentService extends RealDocumentService {
  private documents: KBDocument[] = [
    {
      id: 'doc-1',
      name: 'Product Requirements Document.pdf',
      fileType: DocumentFileType.PDF,
      size: 2457600,
      status: DocumentStatus.READY,
      uploadedAt: '2024-01-15T10:00:00Z',
      uploadedBy: 'Alex Morgan',
      tenantName: 'Acme Corp',
      chunkCount: 24,
      embeddingStatus: EmbeddingStatus.COMPLETED,
    },
  ]

  async getDocuments(query: GetDocumentsQuery = {}): Promise<GetDocumentsResponse> {
    const page = query.page || 1
    const limit = query.limit || 50
    const sortBy = query.sortBy || DocumentSortBy.UPLOADED_AT
    const sortOrder = query.sortOrder || 'desc'
    const filtered = filterDocuments(this.documents, query)
    const sorted = sortDocuments(filtered, sortBy, sortOrder)
    return buildPagination(sorted, page, limit)
  }

  async getDocumentById(id: string): Promise<KBDocument | null> {
    return this.documents.find((doc) => doc.id === id) ?? null
  }

  async uploadDocument(file: File): Promise<KBDocument> {
    const uploaded: KBDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      fileType: getFileTypeFromExtension(file.name) ?? DocumentFileType.TXT,
      size: file.size,
      status: DocumentStatus.PROCESSING,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      tenantName: 'Acme Corp',
      chunkCount: 0,
      embeddingStatus: EmbeddingStatus.PENDING,
    }
    this.documents.unshift(uploaded)
    return uploaded
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents = this.documents.filter((doc) => doc.id !== id)
  }
}

export const documentService = env.enableMockApi
  ? new MockDocumentService()
  : new RealDocumentService()
