import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { AuthContext } from './auth-context'

interface AuthState {
  user: User | null
  token: string | null
}

function readStoredAuthState(): AuthState {
  const token = storage.getToken()
  const user = storage.getUser<User>()

  if (!token || !user) {
    if (token || user) {
      storage.clear()
    }

    return { token: null, user: null }
  }

  return { token, user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(readStoredAuthState)

  const login = useCallback((newToken: string, newUser: User) => {
    storage.setToken(newToken)
    storage.setUser(newUser)
    setAuthState({ token: newToken, user: newUser })
  }, [])

  const logout = useCallback(() => {
    storage.clear()
    setAuthState({ token: null, user: null })
  }, [])

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: !!authState.token && !!authState.user,
      isLoading: false,
      login,
      logout,
    }),
    [authState.token, authState.user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
