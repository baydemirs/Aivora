import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../services/documents.service'
import { appQueryKeys } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/use-auth'
import { logDevError } from '@/lib/logger'
import type {
  GetDocumentsQuery,
  GetDocumentsResponse,
} from '../types'

// Query keys
export const documentKeys = {
  all: appQueryKeys.documents.all,
  lists: appQueryKeys.documents.lists,
  list: (query: GetDocumentsQuery) =>
    appQueryKeys.documents.list(query as unknown as Record<string, unknown>),
  details: appQueryKeys.documents.details,
  detail: appQueryKeys.documents.detail,
  stats: appQueryKeys.documents.stats,
}

// Query Hooks
export const useDocuments = (query: GetDocumentsQuery = {}) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...documentKeys.list(query), tenantScope],
    queryFn: () => documentService.getDocuments(query),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useDocument = (id: string, enabled: boolean = true) => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...documentKeys.detail(id), tenantScope],
    queryFn: () => documentService.getDocumentById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDocumentStats = () => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...documentKeys.stats(), tenantScope],
    queryFn: () => documentService.getDocumentStats(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

// Mutation Hooks
export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useMutation({
    mutationFn: (file: File) => documentService.uploadDocument(file),
    onSuccess: (newDoc) => {
      // Invalidate document lists to refetch
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })

      // Set the new document in cache
      queryClient.setQueryData([...documentKeys.detail(newDoc.id), tenantScope], newDoc)
    },
    onError: (error) => {
      logDevError('Failed to upload document.', error)
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: documentKeys.lists() })

      // Snapshot previous values
      const previousDocumentLists = queryClient.getQueriesData({
        queryKey: documentKeys.lists(),
      })

      // Optimistically remove document from all lists
      previousDocumentLists.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'documents' in data) {
          const listData = data as GetDocumentsResponse
          const filtered = listData.documents.filter((doc) => doc.id !== id)
          queryClient.setQueryData(queryKey, {
            ...listData,
            documents: filtered,
            totalCount: Math.max(0, listData.totalCount - 1),
          })
        }
      })

      return { previousDocumentLists }
    },
    onError: (_error, _id, context) => {
      // Rollback on error
      if (context?.previousDocumentLists) {
        context.previousDocumentLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      logDevError('Failed to delete document.', _error)
    },
    onSuccess: (_, id) => {
      // Remove document from cache
      queryClient.removeQueries({ queryKey: [...documentKeys.detail(id), tenantScope] })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.summary() })
    },
    onSettled: () => {
      // Refetch document lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}

// Helper to invalidate all document queries
export const useInvalidateDocuments = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: documentKeys.all })
  }
}
