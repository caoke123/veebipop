import { NextRequest } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import { error } from '@/utils/apiResponse'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(401, 'Authorization token is required')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify the token and get user info
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!verifyResponse.ok) {
      return error(401, 'Invalid or expired token')
    }

    const verifyData = await verifyResponse.json()
    if (!verifyData.success || !verifyData.user) {
      return error(401, 'Invalid user data')
    }

    const user = verifyData.user

    // Get WooCommerce API client
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce API client not configured properly')
    }

    // Fetch orders for the current user
    // In WooCommerce, we can filter orders by customer ID
    const { searchParams } = new URL(request.url)
    const fields = searchParams.get('_fields') ?? undefined
    const response = await wcApi.get('orders', {
      customer: user.id,
      per_page: 50,
      ...(fields ? { _fields: fields } : {})
    })

    // Return the orders data
    const payload = { success: true, orders: response.data, user }
    const body = JSON.stringify(payload)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=120, stale-while-revalidate=600',
      ETag: etag,
    })
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
    return new Response(body, { status: 200, headers })

  } catch (err: any) {
    console.error('Error fetching user orders:', err)
    
    // Handle specific WooCommerce API errors
    if (err.response) {
      const status = err.response.status || 500
      const details = err.response.data || { message: 'WooCommerce API error' }
      
      return error(status, `Failed to fetch orders: ${details.message || 'WooCommerce API error'}`, details)
    }
    
    // Handle network/connection errors
    return error(500, 'Failed to connect to WooCommerce API', {
      message: err.message || 'Unknown error occurred'
    })
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}