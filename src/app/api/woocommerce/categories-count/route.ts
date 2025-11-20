import { NextResponse } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import { error } from '@/utils/apiResponse'

// Use Node.js runtime to fix compatibility with Node.js modules
export const runtime = 'nodejs'

export async function GET() {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      console.log('WooCommerce API not available, using fallback category counts')
      // 提供回退类别数量数据
      const fallbackCounts = {
        'art-toys': 10,
        'charms': 8,
        'in-car-accessories': 6,
        'general': 15,
        'toy': 12,
        'bag': 7
      }
      
      return NextResponse.json(fallbackCounts, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'CDN-Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400',
          'X-Cache-Source': 'Fallback'
        }
      })
    }

    // 获取所有类目，包括产品数量
    const res = await wcApi.get('products/categories', {
      per_page: 100,
      hide_empty: false // 包含空类目
    })

    const categories = Array.isArray(res.data) ? res.data : []

    // 创建类目 slug 到数量的映射
    const countMap = categories.reduce((acc: Record<string, number>, cat: any) => {
      // WooCommerce 原生返回的真实总数
      acc[cat.slug] = cat.count || 0
      return acc
    }, {})

    console.log(`[Category Counts] Fetched ${categories.length} categories with counts`)

    return NextResponse.json(countMap, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1小时缓存
        'CDN-Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400'
      }
    })
  } catch (err: any) {
    console.error('Error fetching category counts:', err)
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load category counts', details)
  }
}

export const dynamic = 'force-dynamic'