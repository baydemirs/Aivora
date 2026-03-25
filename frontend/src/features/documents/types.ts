// Document Domain Types

export const DocumentStatus = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
  ARCHIVED: 'archived',
} as const;

export type DocumentStatus = typeof DocumentStatus[keyof typeof DocumentStatus];

export const DocumentFileType = {
  PDF: 'pdf',
  DOCX: 'docx',
  XLSX: 'xlsx',
  TXT: 'txt',
} as const;

export type DocumentFileType = typeof DocumentFileType[keyof typeof DocumentFileType];

export const EmbeddingStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type EmbeddingStatus = typeof EmbeddingStatus[keyof typeof EmbeddingStatus];

// Main Document Interface
export interface KBDocument {
  id: string
  name: string
  fileType: DocumentFileType
  size: number // bytes
  status: DocumentStatus
  uploadedAt: string
  uploadedBy: string
  tenantName: string
  chunkCount: number
  embeddingStatus: EmbeddingStatus
  metadata?: Record<string, unknown>
}

// Document Statistics
export interface DocumentStats {
  total: number
  byStatus: Record<DocumentStatus, number>
  byFileType: Record<DocumentFileType, number>
  totalChunks: number
  averageChunks: number
}

// Document Filters
export interface DocumentFilters {
  searchQuery: string
  status?: DocumentStatus | 'all'
  fileType?: DocumentFileType | 'all'
  sortBy: DocumentSortBy
  sortOrder: 'asc' | 'desc'
}

export const DocumentSortBy = {
  UPLOADED_AT: 'uploadedAt',
  NAME: 'name',
  SIZE: 'size',
  STATUS: 'status',
} as const;

export type DocumentSortBy = typeof DocumentSortBy[keyof typeof DocumentSortBy];

// API Request/Response Types
export interface GetDocumentsQuery {
  page?: number
  limit?: number
  search?: string
  status?: DocumentStatus
  fileType?: DocumentFileType
  sortBy?: DocumentSortBy
  sortOrder?: 'asc' | 'desc'
}

export interface GetDocumentsResponse {
  documents: KBDocument[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

export interface UploadDocumentRequest {
  file: File
  tenantName?: string
}

// Status Configuration
export const DOCUMENT_STATUS_CONFIG = {
  [DocumentStatus.UPLOADING]: {
    label: 'Uploading',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'upload',
  },
  [DocumentStatus.PROCESSING]: {
    label: 'Processing',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'loader',
  },
  [DocumentStatus.READY]: {
    label: 'Ready',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'check-circle',
  },
  [DocumentStatus.ERROR]: {
    label: 'Error',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'alert-circle',
  },
  [DocumentStatus.ARCHIVED]: {
    label: 'Archived',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: 'archive',
  },
} as const

// Embedding Status Configuration
export const EMBEDDING_STATUS_CONFIG = {
  [EmbeddingStatus.PENDING]: {
    label: 'Pending',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
  [EmbeddingStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  [EmbeddingStatus.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  [EmbeddingStatus.FAILED]: {
    label: 'Failed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
} as const

// File Type Configuration
export const FILE_TYPE_CONFIG = {
  [DocumentFileType.PDF]: {
    label: 'PDF',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
    accept: '.pdf',
    mimeType: 'application/pdf',
  },
  [DocumentFileType.DOCX]: {
    label: 'DOCX',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
    accept: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  [DocumentFileType.XLSX]: {
    label: 'XLSX',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-500',
    accept: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  [DocumentFileType.TXT]: {
    label: 'TXT',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-500',
    accept: '.txt',
    mimeType: 'text/plain',
  },
} as const

// Accepted file extensions for upload
export const ACCEPTED_FILE_EXTENSIONS = Object.values(FILE_TYPE_CONFIG)
  .map((c) => c.accept)
  .join(',')

export const ACCEPTED_FILE_TYPES_DISPLAY = Object.values(FILE_TYPE_CONFIG)
  .map((c) => c.label)
  .join(', ')

// Helper to get file type from extension
export function getFileTypeFromExtension(filename: string): DocumentFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return DocumentFileType.PDF
    case 'docx':
    case 'doc':
      return DocumentFileType.DOCX
    case 'xlsx':
    case 'xls':
      return DocumentFileType.XLSX
    case 'txt':
      return DocumentFileType.TXT
    default:
      return null
  }
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
