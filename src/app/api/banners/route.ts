// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误

export const revalidate = 0

import { json, error } from '@/utils/apiResponse'
import { NextRequest } from 'next/server'
import { getCache, setCache, CacheKeyBuilder } from '@/lib/cache'

export const runtime = 'nodejs'

// Cache configuration
const CACHE_DURATION = 3600 // 1 hour cache for banners

export async function GET(request: NextRequest) {
  const now = Math.floor(Date.now() / 1000)
  const cacheKey = CacheKeyBuilder.homeBanners()
  
  // Try Upstash Redis cache first
  try {
    const redisCached = await getCache(cacheKey)
    if (redisCached) {
      console.log('Returning Upstash Redis cached banners')
      
      const headers = new Headers()
      headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
      headers.set('Content-Type', 'application/json')
      headers.set('X-Cache', 'HIT')
      headers.set('X-Cache-Source', 'Upstash Redis')
      
      const body = JSON.stringify(redisCached)
      
      return new Response(body, {
        status: 200,
        headers
      })
    }
  } catch (error) {
    console.error('Upstash Redis cache error:', error)
  }
  
  // 返回默认轮播数据
  const defaultBanners = [
    {
      id: 1,
      image: "https://assets.veebipop.com/art%20toys4-optimized.webp",
      title: "Partner with us",
      subtitle: "Define the trendy Market",
      buttonText: "Shop Now",
      link: "/shop",
      badge: "China Direct",
      textPosition: "left"
    },
    {
      id: 2,
      image: "https://assets.veebipop.com/images/slide-3-optimized.webp",
      title: "Unmatched Quality",
      subtitle: "Every detail is perfect",
      buttonText: "Shop Now",
      link: "/shop",
      badge: "Premium Quality",
      textPosition: "left"
    },
    {
      id: 3,
      image: "https://assets.veebipop.com/images/s11-3-optimized.webp",
      title: "Fresh and Tasty",
      subtitle: "Summer Sale Collections",
      buttonText: "Shop Now",
      link: "/shop",
      badge: "New Arrival",
      textPosition: "left"
    }
  ]
  
  const responseData = {
    banners: defaultBanners,
    timestamp: now,
    cacheExpiry: now + (CACHE_DURATION * 1000)
  }
  
  // Update Upstash Redis cache
  try {
    await setCache(cacheKey, responseData, CACHE_DURATION)
    console.log('Updated Upstash Redis cache for banners')
  } catch (error) {
    console.error('Failed to update Upstash Redis cache:', error)
  }
  
  // Set cache headers
  const headers = new Headers()
  headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
  headers.set('Content-Type', 'application/json')
  headers.set('X-Cache', 'MISS')
  headers.set('X-Cache-Source', 'Default')
  
  const body = JSON.stringify(responseData)
  
  return new Response(body, {
    status: 200,
    headers
  })
}