import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settings.service'
import type { SettingsResponse, UpdateSettingsRequest } from '../types'

export const settingsKeys = {
  all: ['settings'] as const,
  me: () => [...settingsKeys.all, 'me'] as const,
}

export const useSettings = (enabled = true) => {
  return useQuery({
    queryKey: settingsKeys.me(),
    queryFn: settingsService.getMySettings,
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) =>
      settingsService.updateMySettings(data),
    onSuccess: (settings: SettingsResponse) => {
      queryClient.setQueryData(settingsKeys.me(), settings)
      queryClient.invalidateQueries({ queryKey: settingsKeys.me() })
    },
  })
}
