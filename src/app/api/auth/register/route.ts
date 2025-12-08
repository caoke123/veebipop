import { NextRequest, NextResponse } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'

// Initialize the global mockUsers if it doesn't exist
if (!(globalThis as any).mockUsers) {
  ;(globalThis as any).mockUsers = {}
}

// Use the global mockUsers
const mockUsers = (globalThis as any).mockUsers

function timedJson(data: any) {
  const start = process.hrtime.bigint()
  const res = NextResponse.json(data)
  const dur = Number(process.hrtime.bigint() - start) / 1e6
  res.headers.set('Server-Timing', `total;dur=${dur.toFixed(2)}`)
  return res
}

export async function POST(request: NextRequest) {
  try {
    // Log the raw request body for debugging
    const rawBody = await request.text()
    console.log('Raw request body:', rawBody)
    
    let requestData
    try {
      requestData = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return timedJson({ error: 'Invalid JSON in request body' })
    }
    
    const { email, password, firstName, lastName, first_name, last_name, username } = requestData

    if (!email || !password) {
      return timedJson({ error: 'Email and password are required' })
    }

    if (!email.includes('@')) {
      return timedJson({ error: 'Please provide a valid email address' })
    }

    if (password.length < 6) {
      return timedJson({ error: 'Password must be at least 6 characters long' })
    }

    // Handle both camelCase and snake_case field names
    const firstNameValue = firstName || first_name || ''
    const lastNameValue = lastName || last_name || ''

    // Check if user already exists in mock database
    if (mockUsers[email]) {
      return timedJson({ error: 'User already exists with this email' })
    }

    // Mock user creation
    const userId = Date.now()
    const mockUser = {
      id: userId,
      username: username || email.split('@')[0],
      email: email,
      first_name: firstNameValue,
      last_name: lastNameValue,
      role: 'customer'
    }

    // Store in mock database
    mockUsers[email] = {
      ...mockUser,
      password: password // In real app, this would be hashed
    }

    // Mock JWT token generation (in real app, this would be from WordPress JWT)
    const mockToken = `mock-jwt-token-${userId}-${Date.now()}`

    // Mock WooCommerce customer creation (with error handling)
    try {
      const wcApi = getWcApi()
      if (wcApi) {
        await wcApi.post('customers', {
          email: email,
          first_name: firstNameValue,
          last_name: lastNameValue,
          username: username || email.split('@')[0]
        })
      } else {
        console.log('WooCommerce API not configured, skipping customer creation')
      }
    } catch (wcError) {
      console.warn('WooCommerce customer creation warning:', wcError)
      // Continue even if WooCommerce customer creation fails
    }

    // Send Welcome Email
    try {
      const { sendEmail } = await import('@/lib/email')
      
      // To User
      await sendEmail({
        to: email,
        subject: 'Welcome to VeebiPoP!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome, ${firstNameValue || 'Customer'}!</h2>
            <p>Thank you for creating an account with VeebiPoP.</p>
            <p>You can now log in and start shopping.</p>
            <br>
            <p>Best regards,</p>
            <p>VeebiPoP Team</p>
          </div>
        `
      })

      // To Admin
      await sendEmail({
        to: process.env.MAIL_TO_ADMIN || 'info@veebipop.com',
        subject: `[New User] ${email}`,
        html: `
          <h3>New User Registration</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Name:</strong> ${firstNameValue} ${lastNameValue}</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send welcome emails:', emailError)
    }

    // Return success response
    return timedJson({ success: true, user: mockUser, token: mockToken, message: 'User registered successfully (Demo Mode)' })

  } catch (error) {
    console.error('Registration error:', error)
    return timedJson({ error: 'Internal server error' })
  }
}