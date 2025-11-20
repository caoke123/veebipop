import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'
import { wcArrayToProductTypes } from '@/utils/wcAdapter'
import { NextRequest } from 'next/server'
import { getCache, setCache, CacheKeyBuilder } from '@/lib/cache'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

// Cache configuration
const CACHE_DURATION = 1800 // 30 minutes cache for filtered products (increased for Upstash Redis)
const STALE_WHILE_REVALIDATE = 600 // 10 minutes stale while revalidate

// In-memory cache for better performance (fallback)
const cache = new Map<string, {
  data: any
  timestamp: number
  isFetching: boolean
}>()

// Generate cache key from filter parameters
function getCacheKey(params: Record<string, any>): string {
  return CacheKeyBuilder.products(params)
}

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const n = value ? parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function toBoolean(value: string | null): boolean | undefined {
  const v = (value ?? '').toLowerCase()
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract filter parameters
  const per_page = clampInt(searchParams.get('per_page'), 1, 100, 100)
  const page = clampInt(searchParams.get('page'), 1, 1000, 1)
  const category = searchParams.get('category')
  const onSale = toBoolean(searchParams.get('on_sale'))
  const priceMin = searchParams.get('price_min')
  const priceMax = searchParams.get('price_max')
  const orderby = searchParams.get('orderby')
  const order = searchParams.get('order')
  const search = searchParams.get('search')
  
  // Build cache key from all filter parameters
  const filterParams = {
    per_page,
    page,
    category,
    on_sale: onSale,
    price_min: priceMin,
    price_max: priceMax,
    orderby,
    order,
    search
  }
  
  const cacheKey = getCacheKey(filterParams)
  const now = Math.floor(Date.now() / 1000)
  
  // Try Upstash Redis cache first
  try {
    const redisCached = await getCache(cacheKey)
    if (redisCached) {
      console.log('Returning Upstash Redis cached filtered products')
      
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
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log('Returning in-memory cached filtered products')
    
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
      console.log('Returning stale filtered products')
      
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
    cache.set(cacheKey, {
      data: null,
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  const wcApi = getWcApi()
  if (!wcApi) {
    console.log('WooCommerce API not available, using fallback data for filtered products')
    // 回退到本地Product.json数据
    try {
      const fs = require('fs')
      const path = require('path')
      const productDataPath = path.join(process.cwd(), 'public', 'Product.json')
      const productData = JSON.parse(fs.readFileSync(productDataPath, 'utf-8'))
      
      // 根据过滤条件筛选产品
      let filteredProducts = Array.isArray(productData) ? productData : []
      
      // 类别过滤
      if (category && category !== '') {
        filteredProducts = filteredProducts.filter((product: any) => {
          const productCategory = product.category?.toLowerCase() || ''
          const requestedCategory = category.toLowerCase()
          return productCategory === requestedCategory
        })
      }
      
      // 特价过滤
      if (onSale) {
        filteredProducts = filteredProducts.filter((product: any) => product.sale === true)
      }
      
      // 价格过滤
      if (priceMin || priceMax) {
        filteredProducts = filteredProducts.filter((product: any) => {
          const productPrice = Number(product.price) || 0
          const minPrice = priceMin ? Number(priceMin) : 0
          const maxPrice = priceMax ? Number(priceMax) : Infinity
          return productPrice >= minPrice && productPrice <= maxPrice
        })
      }
      
      // 限制返回的产品数量
      const limitedProducts = filteredProducts.slice(0, per_page)
      
      const response = {
        data: limitedProducts,
        meta: {
          count: limitedProducts.length,
          page: page,
          per_page: per_page,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / per_page),
          timestamp: now,
          cacheExpiry: now + (CACHE_DURATION * 1000),
          isFallback: true
        }
      }
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: new Headers({
          'Cache-Control': `public, max-age=${CACHE_DURATION}`,
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-Cache-Source': 'Fallback'
        })
      })
    } catch (fallbackError) {
      console.error('Fallback data error:', fallbackError)
      return error(500, 'WooCommerce environment variables are not configured and fallback data failed')
    }
  }

  try {
    console.log('Fetching filtered products from WooCommerce')
    
    // Resolve category ID from slug
    let categoryId: number | undefined
    if (category) {
      const maybeId = Number(category)
      if (!Number.isNaN(maybeId) && maybeId > 0) {
        categoryId = maybeId
      } else {
        const slug = category.toLowerCase()
        try {
          const catRes = await wcApi.get('products/categories', { per_page: 1, slug })
          const cats = Array.isArray(catRes.data) ? catRes.data : []
          if (cats.length && typeof cats[0]?.id === 'number') {
            categoryId = cats[0].id
          }
        } catch {
          // ignore; fallback to no category filter
        }
      }
    }

    // Build WooCommerce API parameters
    const wcParams: Record<string, unknown> = { 
      per_page,
      page,
      status: 'publish'
    }
    
    if (categoryId) {
      wcParams['category'] = categoryId
    }
    
    if (onSale) {
      wcParams['on_sale'] = true
    }
    
    if (priceMin) {
      wcParams['min_price'] = clampInt(priceMin, 0, 1_000_000, 0)
    }
    
    if (priceMax) {
      wcParams['max_price'] = clampInt(priceMax, 0, 1_000_000, 100)
    }
    
    if (orderby) {
      wcParams['orderby'] = orderby
    }
    
    if (order) {
      wcParams['order'] = order
    }
    
    if (search) {
      wcParams['search'] = search
    }
    
    // Only request necessary fields to reduce payload
    wcParams['_fields'] = 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
    
    // Fetch products from WooCommerce
    const res = await wcApi.get('products', wcParams)
    const products = Array.isArray(res.data) ? res.data : []
    
    // Convert to ProductType format
    const optimizedProducts = await wcArrayToProductTypes(products)
    
    // Apply additional client-side filtering that WooCommerce doesn't support
    const finalProducts = optimizedProducts.filter(product => {
      // Only return products with images
      return Array.isArray(product.images) && product.images.length > 0
    })
    
    const response = {
      data: finalProducts,
      meta: {
        count: finalProducts.length,
        page: page,
        per_page: per_page,
        total: res.headers?.['x-wp-total'] || finalProducts.length,
        totalPages: res.headers?.['x-wp-totalpages'] || 1,
        timestamp: now,
        cacheExpiry: now + (CACHE_DURATION * 1000)
      }
    }
    
    // Update Upstash Redis cache
    try {
      await setCache(cacheKey, response, CACHE_DURATION)
      console.log('Updated Upstash Redis cache for filtered products')
    } catch (error) {
      console.error('Failed to update Upstash Redis cache:', error)
    }
    
    // Update in-memory cache as fallback
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = response
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }
    
    // Set cache headers
    const headers = new Headers()
    headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}`)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Cache', 'MISS')
    headers.set('X-Cache-Source', 'WooCommerce')
    
    const body = JSON.stringify(response)
    
    return new Response(body, {
      status: 200,
      headers
    })
    
  } catch (err: any) {
    // Reset fetching flag on error
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.isFetching = false
    }
    
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load filtered products', details)
  }
}