import { env } from '@/config/env'

export const logDevError = (message: string, error?: unknown): void => {
  if (!env.isDevelopment) return
  console.error(`[Aivora] ${message}`, error)
}
