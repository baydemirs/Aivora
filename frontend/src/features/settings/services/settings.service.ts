import apiClient from '@/services/api/client'
import type { SettingsResponse, UpdateSettingsRequest } from '../types'

export const settingsService = {
  getMySettings: async (): Promise<SettingsResponse> => {
    const response = await apiClient.get<SettingsResponse>('/settings/me')
    return response.data
  },

  updateMySettings: async (
    data: UpdateSettingsRequest,
  ): Promise<SettingsResponse> => {
    const response = await apiClient.patch<SettingsResponse>('/settings/me', data)
    return response.data
  },
}
