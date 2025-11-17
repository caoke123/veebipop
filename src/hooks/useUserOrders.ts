"use client"
import { useEffect, useState } from "react"
import { useAuth } from '@/contexts/AuthContext'

interface OrderItem {
  product_id: number
  name: string
  quantity: number
  price: string
  total: string
  variation_id?: number
  meta_data?: Array<{
    key: string
    value: string
  }>
}

interface Order {
  id: number
  status: string
  date_created: string
  total: string
  payment_method: string
  payment_method_title: string
  billing: {
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
  shipping: {
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
  line_items: OrderItem[]
  shipping_lines?: Array<{
    method_id: string
    method_title: string
    total: string
  }>
  coupon_lines?: Array<{
    code: string
    discount: string
  }>
}

interface OrdersData {
  orders: Order[]
  user: any
}

export function useUserOrders(): { 
  orders: Order[] | null, 
  isLoading: boolean, 
  error: string | null,
  refetch: () => void
} {
  const { token, isAuthenticated } = useAuth()
  const [data, setData] = useState<Order[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    if (!token || !isAuthenticated) {
      setError('Authentication required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/woocommerce/user-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const result: any = await response.json()
      if (result && Array.isArray(result.orders)) {
        setData(result.orders)
      } else if (Array.isArray(result)) {
        setData(result)
      } else {
        setError('Failed to load orders')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchOrders()
    }
  }, [token, isAuthenticated])

  return { 
    orders: data, 
    isLoading, 
    error,
    refetch: fetchOrders
  }
}