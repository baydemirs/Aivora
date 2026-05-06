import axios from 'axios'

export type AppErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'not_found'
  | 'server'
  | 'tenant'
  | 'unsupported'
  | 'unknown'

export class AppError extends Error {
  kind: AppErrorKind
  status?: number
  details?: unknown

  constructor(kind: AppErrorKind, message: string, options?: { status?: number; details?: unknown }) {
    super(message)
    this.name = 'AppError'
    this.kind = kind
    this.status = options?.status
    this.details = options?.details
  }
}

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const safeBackendMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null
  const objectPayload = payload as Record<string, unknown>

  const direct =
    normalizeString(objectPayload.message) ||
    normalizeString(objectPayload.error) ||
    normalizeString(objectPayload.detail)

  if (direct) return direct
  if (Array.isArray(objectPayload.message) && objectPayload.message.length > 0) {
    const first = normalizeString(objectPayload.message[0])
    if (first) return first
  }
  return null
}

export const toAppError = (error: unknown, fallback = 'Unexpected error occurred'): AppError => {
  if (error instanceof AppError) return error

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const backendMessage = safeBackendMessage(error.response?.data)
    const safeMessage = backendMessage || fallback

    if (!status) return new AppError('network', 'Network error. Please check your connection.')
    if (status === 401) return new AppError('unauthorized', 'Your session has expired. Please sign in again.', { status })
    if (status === 403) return new AppError('forbidden', 'You do not have permission for this action.', { status })
    if (status === 404) return new AppError('not_found', safeMessage, { status })
    if (status === 422 || status === 400) return new AppError('validation', safeMessage, { status })
    if (status >= 500) return new AppError('server', 'Server error. Please try again shortly.', { status })

    return new AppError('unknown', safeMessage, { status })
  }

  if (error instanceof Error) return new AppError('unknown', error.message || fallback)
  return new AppError('unknown', fallback)
}

export const toPublicErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  const appError = toAppError(error, fallback)

  switch (appError.kind) {
    case 'network':
    case 'unauthorized':
    case 'forbidden':
    case 'server':
      return appError.message
    case 'validation':
    case 'not_found':
    case 'tenant':
    case 'unsupported':
      return appError.message || fallback
    default:
      return fallback
  }
}
