import apiClient from '@/services/api/client'
import { mockAuthService } from './mock-auth.service'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types'

// Use mock service in development when no API is available
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.DEV

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      return mockAuthService.login(data)
    }
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      return mockAuthService.register(data)
    }
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  validateToken: async (token: string): Promise<boolean> => {
    if (USE_MOCK) {
      const user = await mockAuthService.validateToken(token)
      return user !== null
    }
    try {
      await apiClient.get('/auth/me')
      return true
    } catch {
      return false
    }
  },
}
