import { logDevError } from '@/lib/logger'

const TOKEN_KEY = 'aivora_token'
const USER_KEY = 'aivora_user'

export const storage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
      logDevError('Failed to save token to localStorage.', error)
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // noop
    }
  },

  getUser: <T>(): T | null => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      if (!raw || raw === 'undefined' || raw === 'null') return null

      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'id' in parsed) {
        return parsed as T
      }

      localStorage.removeItem(USER_KEY)
      return null
    } catch {
      try {
        localStorage.removeItem(USER_KEY)
      } catch {
        // noop
      }
      return null
    }
  },

  setUser: <T>(user: T): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      logDevError('Failed to save user to localStorage.', error)
    }
  },

  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY)
    } catch {
      // noop
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // noop
    }
  },
}
