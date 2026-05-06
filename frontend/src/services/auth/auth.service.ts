import apiClient from '@/services/api/client'
import { mockAuthService } from './mock-auth.service'
import { env } from '@/config/env'
import type { LoginRequest, RegisterRequest, User } from '@/types'
import { storage } from '@/utils/storage'
import { AppError, toAppError, toPublicErrorMessage } from '@/lib/errors'

interface BackendAuthTokenResponse {
  access_token: string
}

interface BackendMeResponse {
  sub: string
  email: string
  role: 'ADMIN' | 'USER'
  tenantId: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

const extractAccessToken = (payload: BackendAuthTokenResponse): string => {
  const token = payload?.access_token
  if (!token || typeof token !== 'string') {
    throw new Error('Authentication token is missing in server response')
  }
  return token
}

const toDisplayName = (email: string) => {
  const [local] = email.split('@')
  return local
    .split(/[._-]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ') || email
}

const mapMeToUser = (me: BackendMeResponse, tenantName?: string): User => ({
  id: me.sub,
  email: me.email,
  fullName: toDisplayName(me.email),
  role: me.role,
  tenantId: me.tenantId,
  tenantName: tenantName || 'Organization',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
})

const fetchTenantName = async (tenantId: string): Promise<string | undefined> => {
  try {
    const response = await apiClient.get<{ name: string }>(`/tenants/${tenantId}`)
    return response.data?.name
  } catch {
    return undefined
  }
}

const fetchProfile = async (tokenOverride?: string): Promise<User> => {
  const response = await apiClient.get<BackendMeResponse>('/auth/me', {
    headers: tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined,
  })
  const me = response.data
  const tenantName = await fetchTenantName(me.tenantId)
  return mapMeToUser(me, tenantName)
}

const realAuthService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const tokenResponse = await apiClient.post<BackendAuthTokenResponse>('/auth/login', data)
      const accessToken = extractAccessToken(tokenResponse.data)
      const user = await fetchProfile(accessToken)
      return { accessToken, user }
    } catch (error) {
      const appError = toAppError(error, 'Login failed')
      if (appError.status === 401) {
        throw new AppError('unauthorized', 'Invalid email or password')
      }
      if (appError.status === 409) {
        throw new AppError('validation', 'Email already registered')
      }
      throw new AppError(appError.kind, toPublicErrorMessage(appError, 'Login failed'), {
        status: appError.status,
      })
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        // Backend currently expects tenant name in `name`.
        name: data.tenantName,
      }
      const tokenResponse = await apiClient.post<BackendAuthTokenResponse>('/auth/register', payload)
      const accessToken = extractAccessToken(tokenResponse.data)
      const me = await fetchProfile(accessToken)
      const user: User = { ...me, fullName: data.fullName }
      return { accessToken, user }
    } catch (error) {
      const appError = toAppError(error, 'Registration failed')
      if (appError.status === 409) {
        throw new AppError('validation', 'Email already registered')
      }
      throw new AppError(appError.kind, toPublicErrorMessage(appError, 'Registration failed'), {
        status: appError.status,
      })
    }
  },

  async me(): Promise<User> {
    return fetchProfile()
  },
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (env.enableMockApi) {
      return mockAuthService.login(data)
    }
    return realAuthService.login(data)
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (env.enableMockApi) {
      return mockAuthService.register(data)
    }
    return realAuthService.register(data)
  },

  me: async (): Promise<User> => {
    if (env.enableMockApi) {
      const token = storage.getToken()
      if (!token) throw new Error('No active session')
      const user = await mockAuthService.validateToken(token)
      if (!user) throw new Error('Session expired')
      return user
    }
    return realAuthService.me()
  },
}
