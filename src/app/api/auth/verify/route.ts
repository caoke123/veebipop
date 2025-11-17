import { NextRequest, NextResponse } from 'next/server'
import { getCacheClient } from '@/utils/cache'

// Mock database - using a module-level object to persist data
const mockUsers: Record<string, any> = (globalThis as any).mockUsers || {}

// Initialize the mockUsers if it doesn't exist
if (!(globalThis as any).mockUsers) {
  ;(globalThis as any).mockUsers = mockUsers
}

const pending = new Map<string, Promise<NextResponse>>()

function timedJson(data: any) {
  const start = process.hrtime.bigint()
  const res = NextResponse.json(data)
  const dur = Number(process.hrtime.bigint() - start) / 1e6
  res.headers.set('Server-Timing', `total;dur=${dur.toFixed(2)}`)
  return res
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return timedJson({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)

    // Check if this is a mock token (for demo purposes)
    if (token.startsWith('mock-jwt-token-')) {
      // Extract user ID from the mock token
      const tokenParts = token.split('-')
      const userId = tokenParts[3]
      
      // Find user by ID in our mock database
      let foundUser = null
      for (const email in mockUsers) {
        if (mockUsers[email].id.toString() === userId) {
          foundUser = mockUsers[email]
          break
        }
      }
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser
        return timedJson({ success: true, valid: true, user: userWithoutPassword })
      } else {
        return timedJson({ error: 'Invalid token - user not found' })
      }
    }

    const client = getCacheClient()
    const key = `auth:verify:${token}`
    const cached = await client.get(key)
    if (cached && typeof cached === 'object') {
      return timedJson(cached)
    }
    if (pending.has(key)) {
      const p = pending.get(key)!
      return await p
    }
    const p = (async () => {
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/wp-json/jwt-auth/v1/token/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!verifyResponse.ok) {
        return timedJson({ error: 'Invalid token' })
      }

      let user: any = null
      try {
        // Prefer extracting user id from the JWT payload for stability across plugins
        const parts = token.split('.')
        if (parts.length >= 2) {
          const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf-8')
          const payload = JSON.parse(payloadRaw)
          const id = Number(payload?.data?.user?.id)
          if (id && Number.isFinite(id)) {
            user = { id }
          }
        }
      } catch {}

      if (!user) {
        try {
          const body = await verifyResponse.json().catch(() => null)
          const idCandidate = Number(body?.data?.user?.id ?? body?.user?.id ?? body?.data?.id)
          if (idCandidate && Number.isFinite(idCandidate)) {
            user = { id: idCandidate }
          }
        } catch {}
      }

      const ok = user ? { success: true, valid: true, user } : { success: true, valid: true }
      await client.set(key, ok, 300)
      return timedJson(ok)
    })()
    pending.set(key, p)
    const res = await p
    pending.delete(key)
    return res

  } catch (error) {
    console.error('Token verification error:', error)
    return timedJson({ error: 'Token verification failed' })
  }
}
