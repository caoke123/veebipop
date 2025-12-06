// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误

export const revalidate = 0

import { json, error } from '@/utils/apiResponse'
import { NextRequest } from 'next/server'
import { fetchHomeData } from '@/lib/data/homeData'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

// Cache configuration
const CACHE_DURATION = 600 // 10 minutes cache for home data

export async function GET(request: NextRequest) {
  try {
    const result = await fetchHomeData()
    
    const headers = new Headers()
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Cache', result.cacheStatus)
    headers.set('X-Cache-Source', result.source)
    
    const body = JSON.stringify(result.data)
    
    return new Response(body, {
      status: 200,
      headers
    })
    
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load home data', details)
  }
}
