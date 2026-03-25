import apiClient from '@/services/api/client'
import type { Document } from '@/types'

export const documentsService = {
  getAll: async (): Promise<Document[]> => {
    const response = await apiClient.get<Document[]>('/knowledge-base')
    return response.data
  },

  upload: async (file: File): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<Document>('/knowledge-base/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
