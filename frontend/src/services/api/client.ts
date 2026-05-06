import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { storage } from '@/utils/storage'
import { env } from '@/config/env'

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || ''
    const isAuthBootstrapRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

    const token = storage.getToken()
    if (token && !isAuthBootstrapRequest) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const hasActiveSession = Boolean(storage.getToken())
    if (error.response?.status === 401 && hasActiveSession) {
      storage.clear()
      window.dispatchEvent(new CustomEvent('aivora:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default apiClient
