import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { storage } from '@/utils/storage'

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
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = storage.getToken()
    const storedUser = storage.getUser<User>()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    storage.setToken(newToken)
    storage.setUser(newUser)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    storage.clear()
    setToken(null)
    setUser(null)
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
