// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误

export const revalidate = 0

import { json } from '@/utils/apiResponse'
import { NextRequest } from 'next/server'
import { fetchProductDetail } from '@/lib/data/productData'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const includeRelated = searchParams.get('includeRelated') === 'true'

  if (!slug) {
    return json({ error: 'slug parameter is required' }, { status: 400 })
  }

  try {
    const result = await fetchProductDetail(slug, includeRelated)
    
    return json(result, {
      headers: {
        'X-Cache': result.cacheStatus || 'MISS',
        'X-Cache-Key': result.cacheKey || '',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    })

  } catch (error: any) {
    console.error('Error in product-detail API:', error)
    
    const status = error.message === 'Product not found' ? 404 : 500
    
    // 返回错误响应
    return json({
      error: 'Failed to fetch product details',
      message: error.message,
      slug
    }, { 
      status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
