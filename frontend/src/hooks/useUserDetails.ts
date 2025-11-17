"use client"
import { useEffect, useState } from "react"
import { useAuth } from '@/contexts/AuthContext'

interface UserDetails {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  role?: string
  billing?: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
  shipping?: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  avatar_url?: string
  date_of_birth?: string
  phone?: string
  gender?: string
}

export function useUserDetails(): { 
  user: UserDetails | null, 
  isLoading: boolean, 
  error: string | null,
  updateUser: (userData: Partial<UserDetails>) => Promise<boolean>
} {
  const { token, isAuthenticated } = useAuth()
  const [data, setData] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = async () => {
    if (!token || !isAuthenticated) {
      setError('Authentication required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/woocommerce/user-details', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.user)
      } else {
        setError('Failed to load user details')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserDetails = async (userData: Partial<UserDetails>): Promise<boolean> => {
    if (!token || !isAuthenticated) {
      setError('Authentication required')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/woocommerce/user-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`Failed to update user details: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.user)
        return true
      } else {
        setError('Failed to update user details')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user details')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchUserDetails()
    }
  }, [token, isAuthenticated])

  return { 
    user: data, 
    isLoading, 
    error,
    updateUser: updateUserDetails
  }
}