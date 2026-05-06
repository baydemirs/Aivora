import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { AuthContext } from './auth-context'
import { authService } from '@/services/auth/auth.service'
import { useQueryClient } from '@tanstack/react-query'
import { appQueryKeys } from '@/lib/query-keys'

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
  const queryClient = useQueryClient()
  const [authState, setAuthState] = useState<AuthState>({ token: null, user: null })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const clearSession = () => {
      storage.clear()
      if (!isMounted) return
      setAuthState({ token: null, user: null })
      queryClient.clear()
    }

    const restoreSession = async () => {
      const { token } = readStoredAuthState()
      if (!token) {
        if (isMounted) setIsLoading(false)
        return
      }

      setAuthState((prev) => ({ ...prev, token }))
      try {
        const user = await authService.me()
        if (!isMounted) return
        storage.setUser(user)
        setAuthState({ token, user })
      } catch {
        clearSession()
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void restoreSession()

    const handleUnauthorized = () => {
      clearSession()
    }

    window.addEventListener('aivora:unauthorized', handleUnauthorized)
    return () => {
      isMounted = false
      window.removeEventListener('aivora:unauthorized', handleUnauthorized)
    }
  }, [queryClient])

  const login = useCallback((newToken: string, newUser: User) => {
    queryClient.clear()
    storage.setToken(newToken)
    storage.setUser(newUser)
    setAuthState({ token: newToken, user: newUser })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.auth.me() })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.tasks.all })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.all })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.documents.all })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.chat.all })
  }, [queryClient])

  const logout = useCallback(() => {
    storage.clear()
    setAuthState({ token: null, user: null })
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: !!authState.token && !!authState.user,
      isLoading,
      login,
      logout,
    }),
    [authState.token, authState.user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
