import apiClient from '@/services/api/client'
import type { PrdTask, CreateTaskRequest, UpdateTaskRequest } from '@/types'

export const tasksService = {
  getAll: async (): Promise<PrdTask[]> => {
    const response = await apiClient.get<PrdTask[]>('/prd')
    return response.data
  },

  create: async (data: CreateTaskRequest): Promise<PrdTask> => {
    const response = await apiClient.post<PrdTask>('/prd', data)
    return response.data
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<PrdTask> => {
    const response = await apiClient.patch<PrdTask>(`/prd/${id}`, data)
    return response.data
  },
}
