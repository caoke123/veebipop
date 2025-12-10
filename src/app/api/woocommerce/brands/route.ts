import { NextRequest } from 'next/server'
import { fetchBrands } from '@/lib/data/brands'
import crypto from 'crypto'

export async function GET(_req: NextRequest) {
  try {
    const brands = await fetchBrands()

    const body = JSON.stringify(brands)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
      ETag: etag,
    })
    return new Response(body, { status: 200, headers })
  } catch (err: any) {
    console.error('brands route error', err)
    
    // 返回空数组而不是错误，确保前端能正常工作
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    })
  }
}