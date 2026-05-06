const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value == null || value.trim().length === 0) return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return fallback
}

const sanitizeBaseUrl = (value: string | undefined): string => {
  const fallback = '/api'
  if (!value || value.trim().length === 0) return fallback

  const normalized = value.trim().replace(/\/+$/, '')
  return normalized.length > 0 ? normalized : fallback
}

const mode = import.meta.env.MODE || 'development'
const isProduction = mode === 'production'
const isDevelopment = !isProduction

const apiUrl = sanitizeBaseUrl(import.meta.env.VITE_API_URL)
const enableMockApi = parseBool(import.meta.env.VITE_ENABLE_MOCK_API, isDevelopment)

if (isProduction && enableMockApi) {
  console.warn('[Aivora] VITE_ENABLE_MOCK_API=true in production mode.')
}

export const env = Object.freeze({
  mode,
  isProduction,
  isDevelopment,
  apiUrl,
  enableMockApi,
})
