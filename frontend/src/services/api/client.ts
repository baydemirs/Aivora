import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { storage } from '@/utils/storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
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
    if (error.response?.status === 401) {
      storage.clear()
      window.location.href = '/login'
    }

    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || data?.error || error.message || 'Request failed'

    return Promise.reject(new Error(message))
  }
)

export default apiClient
