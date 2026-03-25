import apiClient from '@/services/api/client'
import type { PrdTask, CreateTaskRequest, UpdateTaskRequest } from '@/types'

export const tasksService = {
  getAll: async (): Promise<PrdTask[]> => {
    const response = await apiClient.get<PrdTask[]>('/prd-tracker')
    return response.data
  },

  create: async (data: CreateTaskRequest): Promise<PrdTask> => {
    const response = await apiClient.post<PrdTask>('/prd-tracker', data)
    return response.data
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<PrdTask> => {
    const response = await apiClient.patch<PrdTask>(`/prd-tracker/${id}`, data)
    return response.data
  },
}
