import apiClient from '@/services/api/client'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types'

type BackendAuthResponse = AuthResponse & {
  access_token?: string
}

function normalizeAuthResponse(response: BackendAuthResponse): AuthResponse {
  const accessToken = response.accessToken || response.access_token

  if (!accessToken || !response.user) {
    throw new Error('Authentication response is missing token or user data')
  }

  return {
    accessToken,
    user: response.user,
  }
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<BackendAuthResponse>('/auth/login', data)
    return normalizeAuthResponse(response.data)
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<BackendAuthResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      name: data.tenantName,
    })
    return normalizeAuthResponse(response.data)
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return true
    } catch {
      return false
    }
  },
}
