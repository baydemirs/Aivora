import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../services/documents.service'
import type {
  GetDocumentsQuery,
  GetDocumentsResponse,
} from '../types'

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (query: GetDocumentsQuery) => [...documentKeys.lists(), query] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
}

// Query Hooks
export const useDocuments = (query: GetDocumentsQuery = {}) => {
  return useQuery({
    queryKey: documentKeys.list(query),
    queryFn: () => documentService.getDocuments(query),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useDocument = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getDocumentById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentKeys.stats(),
    queryFn: () => documentService.getDocumentStats(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

// Mutation Hooks
export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => documentService.uploadDocument(file),
    onSuccess: (newDoc) => {
      // Invalidate document lists to refetch
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() })

      // Set the new document in cache
      queryClient.setQueryData(documentKeys.detail(newDoc.id), newDoc)
    },
    onError: (error) => {
      console.error('Failed to upload document:', error)
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

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
            totalCount: listData.totalCount - 1,
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

      console.error('Failed to delete document:', _error)
    },
    onSuccess: (_, id) => {
      // Remove document from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) })

      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() })
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
