import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types'

// Simulated delay to mimic real API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock user database
const mockUsers: Map<string, { user: User; password: string }> = new Map()

// Initialize with a demo user
mockUsers.set('demo@aivora.com', {
  user: {
    id: 'usr_demo_001',
    email: 'demo@aivora.com',
    fullName: 'Demo User',
    role: 'ADMIN',
    tenantId: 'tenant_demo_001',
    tenantName: 'Demo Organization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  password: 'demo123',
})

// Generate mock JWT token
function generateMockToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  // Simple base64 encoding to simulate JWT (not secure, just for mock)
  return `mock_${btoa(JSON.stringify(payload))}`
}

export const mockAuthService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    await delay(800) // Simulate network latency

    const userRecord = mockUsers.get(data.email.toLowerCase())

    if (!userRecord) {
      throw new Error('User not found')
    }

    if (userRecord.password !== data.password) {
      throw new Error('Invalid password')
    }

    return {
      accessToken: generateMockToken(userRecord.user),
      user: userRecord.user,
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await delay(1000) // Simulate network latency

    const email = data.email.toLowerCase()

    if (mockUsers.has(email)) {
      throw new Error('Email already registered')
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: email,
      fullName: data.fullName,
      role: 'ADMIN', // First user of tenant is admin
      tenantId: `tenant_${Date.now()}`,
      tenantName: data.tenantName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store in mock database
    mockUsers.set(email, {
      user: newUser,
      password: data.password,
    })

    return {
      accessToken: generateMockToken(newUser),
      user: newUser,
    }
  },

  // Validate token (for session restore)
  validateToken: async (token: string): Promise<User | null> => {
    await delay(300)

    if (!token.startsWith('mock_')) {
      return null
    }

    try {
      const payload = JSON.parse(atob(token.replace('mock_', '')))

      // Check if token is expired
      if (payload.exp < Date.now()) {
        return null
      }

      // Find user
      for (const record of mockUsers.values()) {
        if (record.user.id === payload.sub) {
          return record.user
        }
      }

      return null
    } catch {
      return null
    }
  },
}
