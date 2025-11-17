'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { timedFetch } from '@/utils/timedFetch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface User {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  first_name?: string
  last_name?: string
  username?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  const verifyToken = async (t: string): Promise<boolean> => {
    try {
      const response = await timedFetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${t}`
        }
      })
      const data = await response.json()
      if (data.success && data.valid && data.user) {
        setUser(data.user)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        return true
      }
      return !!(data.success && data.valid)
    } catch {
      return false
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 检查是否在浏览器环境中
        if (typeof window === 'undefined') {
          setIsLoading(false)
          return
        }
        
        const savedToken = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('auth_user')

        if (savedToken && savedUser) {
          // First set the token and user from localStorage
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
          
          // Then verify token is still valid
          const isValid = await verifyToken(savedToken)
          if (!isValid) {
            logout()
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const verifyQuery = useQuery({
    queryKey: ['auth', 'verify', token],
    queryFn: async () => {
      if (!token) return { success: false, valid: false }
      const response = await timedFetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success && data.valid && data.user) {
        setUser(data.user)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      }
      return data
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await timedFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) throw new Error('Login failed')
      return response.json()
    },
    retry: false,
    onSuccess: (data) => {
      const { user: userData, token: authToken } = data
      setUser(userData)
      setToken(authToken)
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] })
    }
  })
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      await loginMutation.mutateAsync({ email, password })
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterData) => {
      const response = await timedFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Registration failed')
      return data
    },
    retry: false,
    onSuccess: (data) => {
      const { user: userInfo, token: authToken } = data
      setUser(userInfo)
      setToken(authToken)
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('auth_user', JSON.stringify(userInfo))
      queryClient.invalidateQueries({ queryKey: ['auth', 'verify'] })
    }
  })
  const register = async (payload: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)
      await registerMutation.mutateAsync(payload)
      return true
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    queryClient.removeQueries({ queryKey: ['auth'] })
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}