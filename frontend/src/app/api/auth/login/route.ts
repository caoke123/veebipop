import { NextRequest, NextResponse } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'

// Mock database - using a module-level object to persist data
const mockUsers: Record<string, any> = (globalThis as any).mockUsers || {}

// Initialize the mockUsers if it doesn't exist
if (!(globalThis as any).mockUsers) {
  ;(globalThis as any).mockUsers = mockUsers
}

function timedJson(data: any) {
  const start = process.hrtime.bigint()
  const res = NextResponse.json(data)
  const dur = Number(process.hrtime.bigint() - start) / 1e6
  res.headers.set('Server-Timing', `total;dur=${dur.toFixed(2)}`)
  return res
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return timedJson({ error: 'Email and password are required' })
    }

    // Debug: Log the current mockUsers
    console.log('Current users in database:', Object.keys(mockUsers))
    console.log('Attempting login for email:', email)

    // Check if user exists in mock database
    const user = mockUsers[email]
    console.log('Found user:', user ? 'Yes' : 'No')
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password (simple check for demo)
    if (user.password !== password) {
      console.log('Password mismatch')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Mock JWT token generation
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`

    // Prepare user data for frontend (remove password)
    const { password: _, ...userData } = user

    return timedJson({ success: true, user: userData, token: mockToken, message: 'Login successful (Demo Mode)' })

  } catch (error) {
    console.error('Login error:', error)
    return timedJson({ error: 'Internal server error' })
  }
}