// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误

export const revalidate = 0

import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'
import { wcArrayToProductTypes } from '@/utils/wcAdapter'
import { NextRequest } from 'next/server'
import { getCache, setCache, CacheKeyBuilder } from '@/lib/cache'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

// Cache configuration
const CACHE_DURATION = 600 // 10 minutes cache for home data
const STALE_WHILE_REVALIDATE = 300 // 5 minutes stale while revalidate

// In-memory cache for better performance (fallback)
const cache = new Map<string, {
  data: any
  timestamp: number
  isFetching: boolean
}>()

export async function GET(request: NextRequest) {
  const now = Math.floor(Date.now() / 1000)
  const cacheKey = CacheKeyBuilder.homeData()
  
  // Try Upstash Redis cache first
  try {
    const redisCached = await getCache(cacheKey)
    if (redisCached) {
      console.log('Returning Upstash Redis cached home data')
      
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
    // Fall back to in-memory cache
  }
  
  // Fallback to in-memory cache
  const cached = cache.get('home-data')
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log('Returning in-memory cached home data')
    
    const headers = new Headers()
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Cache', 'HIT')
    headers.set('X-Cache-Source', 'Memory')
    
    const body = JSON.stringify(cached.data)
    
    return new Response(body, {
      status: 200,
      headers
    })
  }
  
  // If we're already fetching, return stale data if available
  if (cached?.isFetching) {
    if (cached.data && (now - cached.timestamp) < STALE_WHILE_REVALIDATE) {
      console.log('Returning stale home data')
      
      const headers = new Headers()
      headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
      headers.set('Content-Type', 'application/json')
      headers.set('X-Cache', 'STALE')
      headers.set('X-Cache-Source', 'Memory')
      
      const body = JSON.stringify(cached.data)
      
      return new Response(body, {
        status: 200,
        headers
      })
    }
    
    // Wait for fetch to complete
    let attempts = 0
    while (cached.isFetching && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (cached.data) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: new Headers({
          'Cache-Control': `public, max-age=${CACHE_DURATION}`,
          'Content-Type': 'application/json',
          'X-Cache': 'STALE',
          'X-Cache-Source': 'Memory'
        })
      })
    }
  }
  
  // Initialize cache entry
  if (!cached) {
    cache.set('home-data', {
      data: null,
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  const wcApi = getWcApi()
  if (!wcApi) {
    console.error('WooCommerce API not available - cannot fetch home data')
    return error(500, 'WooCommerce API not configured')
  }

  try {
    console.log('Fetching home data from WooCommerce')
    
    // Get category IDs and Home tag ID first
    const [artToysRes, charmsRes, inCarRes, homeTagRes] = await Promise.allSettled([
      wcApi.get('products/categories', { per_page: 1, slug: 'art-toys' }),
      wcApi.get('products/categories', { per_page: 1, slug: 'charms' }),
      wcApi.get('products/categories', { per_page: 1, slug: 'in-car-accessories' }),
      wcApi.get('products/tags', { per_page: 1, slug: 'home' })
    ])
    
    const artToysId = artToysRes.status === 'fulfilled' && artToysRes.value?.data?.[0]?.id
    const charmsId = charmsRes.status === 'fulfilled' && charmsRes.value?.data?.[0]?.id
    const inCarId = inCarRes.status === 'fulfilled' && inCarRes.value?.data?.[0]?.id
    const homeTagId = homeTagRes.status === 'fulfilled' && homeTagRes.value?.data?.[0]?.id
    
    // Fetch products for each category with home tag
    const [artProducts, charmProducts, carProducts] = await Promise.allSettled([
      artToysId && homeTagId ? wcApi.get('products', { 
        category: artToysId, 
        tag: homeTagId, 
        per_page: 3,
        status: 'publish'
      }) : Promise.resolve({ data: [] }),
      charmsId && homeTagId ? wcApi.get('products', { 
        category: charmsId, 
        tag: homeTagId, 
        per_page: 3,
        status: 'publish'
      }) : Promise.resolve({ data: [] }),
      inCarId && homeTagId ? wcApi.get('products', { 
        category: inCarId, 
        tag: homeTagId, 
        per_page: 3,
        status: 'publish'
      }) : Promise.resolve({ data: [] })
    ])
    
    // Process the results
    const artData = artProducts.status === 'fulfilled' && artProducts.value?.data 
      ? await wcArrayToProductTypes(artProducts.value.data) 
      : []
      
    const charmData = charmProducts.status === 'fulfilled' && charmProducts.value?.data 
      ? await wcArrayToProductTypes(charmProducts.value.data) 
      : []
      
    const carData = carProducts.status === 'fulfilled' && carProducts.value?.data 
      ? await wcArrayToProductTypes(carProducts.value.data) 
      : []
    
    const responseData = {
      artToys: artData,
      charms: charmData,
      inCarAccessories: carData,
      timestamp: now,
      cacheExpiry: now + (CACHE_DURATION * 1000)
    }
    
    // Update Upstash Redis cache
    try {
      await setCache(cacheKey, responseData, CACHE_DURATION)
      console.log('Updated Upstash Redis cache for home data')
    } catch (error) {
      console.error('Failed to update Upstash Redis cache:', error)
    }
    
    // Update in-memory cache as fallback
    const updatedCache = cache.get('home-data')
    if (updatedCache) {
      updatedCache.data = responseData
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }
    
    // Set cache headers
    const headers = new Headers()
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Cache', 'MISS')
    headers.set('X-Cache-Source', 'WooCommerce')
    
    const body = JSON.stringify(responseData)
    
    return new Response(body, {
      status: 200,
      headers
    })
    
  } catch (err: any) {
    // Reset fetching flag on error
    const updatedCache = cache.get('home-data')
    if (updatedCache) {
      updatedCache.isFetching = false
    }
    
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load home data', details)
  }
}