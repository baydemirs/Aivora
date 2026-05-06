import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { authService } from '@/services/auth/auth.service'
import { useQueryClient } from '@tanstack/react-query'
import { appQueryKeys } from '@/lib/query-keys'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const clearSession = () => {
      storage.clear()
      setToken(null)
      setUser(null)
      queryClient.clear()
    }

    const restoreSession = async () => {
      const storedToken = storage.getToken()
      if (!storedToken) {
        if (isMounted) setIsLoading(false)
        return
      }

      setToken(storedToken)
      try {
        const restoredUser = await authService.me()
        if (!isMounted) return
        storage.setUser(restoredUser)
        setUser(restoredUser)
      } catch {
        if (!isMounted) return
        clearSession()
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    restoreSession()

    const onUnauthorized = () => {
      clearSession()
    }

    window.addEventListener('aivora:unauthorized', onUnauthorized)
    return () => {
      isMounted = false
      window.removeEventListener('aivora:unauthorized', onUnauthorized)
    }
  }, [queryClient])

  const login = (newToken: string, newUser: User) => {
    queryClient.clear()
    storage.setToken(newToken)
    storage.setUser(newUser)
    setToken(newToken)
    setUser(newUser)
    queryClient.invalidateQueries({ queryKey: appQueryKeys.auth.me() })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.tasks.all })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.dashboard.all })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.documents.all })
    queryClient.invalidateQueries({ queryKey: appQueryKeys.chat.all })
  }

  const logout = () => {
    storage.clear()
    setToken(null)
    setUser(null)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
