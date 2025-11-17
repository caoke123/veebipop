import { NextRequest } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'
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

    // Fetch customer details from WooCommerce
    // In WooCommerce, customers are stored separately
    let customerDetails = null
    try {
      const { searchParams } = new URL(request.url)
      const fields = searchParams.get('_fields') ?? undefined
      const customerResponse = await wcApi.get(`customers/${user.id}`, fields ? { _fields: fields } : undefined)
      customerDetails = customerResponse.data
    } catch (customerError) {
      console.warn('Could not fetch customer details from WooCommerce:', customerError)
      // Continue with mock data if WooCommerce customer fetch fails
    }

    // Return the user data with customer details if available
    const payload = {
      success: true,
      user: {
        ...user,
        ...(customerDetails || {})
      }
    }
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
    console.error('Error fetching user details:', err)
    
    // Handle specific WooCommerce API errors
    if (err.response) {
      const status = err.response.status || 500
      const details = err.response.data || { message: 'WooCommerce API error' }
      
      return error(status, `Failed to fetch user details: ${details.message || 'WooCommerce API error'}`, details)
    }
    
    // Handle network/connection errors
    return error(500, 'Failed to connect to WooCommerce API', {
      message: err.message || 'Unknown error occurred'
    })
  }
}

export async function PUT(request: NextRequest) {
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
    const updateData = await request.json()

    // Get WooCommerce API client
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce API client not configured properly')
    }

    // Update customer details in WooCommerce
    let updatedCustomer = null
    try {
      const customerResponse = await wcApi.put(`customers/${user.id}`, updateData)
      updatedCustomer = customerResponse.data
    } catch (customerError) {
      console.warn('Could not update customer details in WooCommerce:', customerError)
      // Continue with mock data if WooCommerce customer update fails
    }

    // Return the updated user data
    return json({
      success: true,
      user: {
        ...user,
        ...updateData,
        // Add updated customer details if available
        ...(updatedCustomer || {})
      }
    })

  } catch (err: any) {
    console.error('Error updating user details:', err)
    
    // Handle specific WooCommerce API errors
    if (err.response) {
      const status = err.response.status || 500
      const details = err.response.data || { message: 'WooCommerce API error' }
      
      return error(status, `Failed to update user details: ${details.message || 'WooCommerce API error'}`, details)
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}