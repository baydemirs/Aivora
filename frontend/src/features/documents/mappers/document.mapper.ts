import {
  DocumentFileType,
  DocumentStatus,
  EmbeddingStatus,
  getFileTypeFromExtension,
  type KBDocument,
} from '../types'

export interface ApiDocument {
  id: string
  title: string
  tenantId: string
  createdAt: string
  updatedAt: string
  _count?: {
    chunks?: number
  }
}

export interface ApiUploadResponse {
  documentId: string
  title: string
  chunksCount: number
  totalChunks: number
}

interface DocumentMapOptions {
  tenantName?: string
  uploadedBy?: string
}

const inferFileType = (title: string): DocumentFileType => {
  const type = getFileTypeFromExtension(title)
  return type ?? DocumentFileType.TXT
}

export const apiDocumentToDocument = (
  doc: ApiDocument,
  options: DocumentMapOptions = {},
): KBDocument => {
  const chunkCount = doc._count?.chunks ?? 0
  return {
    id: doc.id,
    name: doc.title,
    fileType: inferFileType(doc.title),
    size: 0,
    status: chunkCount > 0 ? DocumentStatus.READY : DocumentStatus.PROCESSING,
    uploadedAt: doc.createdAt || new Date(0).toISOString(),
    uploadedBy: options.uploadedBy || 'System',
    tenantName: options.tenantName || doc.tenantId,
    chunkCount,
    embeddingStatus: chunkCount > 0 ? EmbeddingStatus.COMPLETED : EmbeddingStatus.IN_PROGRESS,
    metadata: {
      backendUpdatedAt: doc.updatedAt,
    },
  }
}

export const apiDocumentDetailToDocumentDetail = (doc: ApiDocument): KBDocument =>
  apiDocumentToDocument(doc)
