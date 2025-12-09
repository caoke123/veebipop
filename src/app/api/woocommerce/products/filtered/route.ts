
// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误

export const revalidate = 0

import { NextRequest } from 'next/server'
import { fetchFilteredProducts, FilterParams } from '@/lib/data/filteredProducts'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

const CACHE_DURATION = 3600 // 1 hour cache for filtered products

function toBoolean(value: string | null): boolean | undefined {
  const v = (value ?? '').toLowerCase()
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const params: FilterParams = {
    per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!, 10) : undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    category: searchParams.get('category') || undefined,
    on_sale: toBoolean(searchParams.get('on_sale')),
    price_min: searchParams.get('price_min') || undefined,
    price_max: searchParams.get('price_max') || undefined,
    orderby: searchParams.get('orderby') || undefined,
    order: searchParams.get('order') || undefined,
    search: searchParams.get('search') || undefined,
  }

  try {
    const result = await fetchFilteredProducts(params)
    
    const headers = new Headers()
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Cache', result.source === 'WooCommerce' ? 'MISS' : 'HIT')
    headers.set('X-Cache-Source', result.source)
    if (result.source !== 'WooCommerce') {
        headers.set('X-Cache-Debug', `TTL:${CACHE_DURATION}`)
    }

    // 如果数据为空，是否返回 204？原逻辑似乎没有明确返回 204，除了可能的早期版本。
    // 为了兼容性，保持返回 200 和空数组。
    
    return new Response(JSON.stringify(result.data), {
        status: 200,
        headers
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    })
  }
}
