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
    } catch (e) {
      console.error('Failed to save token to localStorage:', e)
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // silently ignore
    }
  },

  getUser: <T>(): T | null => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      if (!raw || raw === 'undefined' || raw === 'null') return null
      const parsed = JSON.parse(raw)
      // Basic shape validation: must be an object with an id
      if (parsed && typeof parsed === 'object' && 'id' in parsed) {
        return parsed as T
      }
      // Invalid shape — clean up
      localStorage.removeItem(USER_KEY)
      return null
    } catch {
      // Corrupted JSON — clean up
      try { localStorage.removeItem(USER_KEY) } catch { /* noop */ }
      return null
    }
  },

  setUser: <T>(user: T): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (e) {
      console.error('Failed to save user to localStorage:', e)
    }
  },

  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY)
    } catch {
      // silently ignore
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // silently ignore
    }
  },
}
