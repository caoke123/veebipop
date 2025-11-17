import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.REVALIDATE_SECRET
    const body = await request.json().catch(() => ({}))
    const tag = String(body.tag || '')
    const token = request.headers.get('x-revalidate-token') || ''
    if (!secret || !tag || token !== secret) {
      return new Response(JSON.stringify({ success: false }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    revalidateTag(tag)
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}