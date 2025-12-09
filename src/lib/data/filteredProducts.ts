
import { getWcApi } from '@/utils/woocommerce'
import { wcArrayToProductTypes } from '@/utils/wcAdapter'
import { getCache, setCache, CacheKeyBuilder } from '@/lib/cache'
import { ProductType } from '@/type/ProductType'

// Cache configuration
const CACHE_DURATION = 3600 // 1 hour cache for filtered products
const CATEGORY_CACHE_DURATION = 86400 // 24 hours cache for category mapping

// In-memory cache for better performance (fallback) within the same lambda instance
const cache = new Map<string, {
  data: any
  timestamp: number
  isFetching: boolean
}>()

export interface FilterParams {
  per_page?: number
  page?: number
  category?: string
  on_sale?: boolean
  price_min?: string
  price_max?: string
  orderby?: string
  order?: string
  search?: string
}

function getCacheKey(params: FilterParams): string {
  // Convert FilterParams to Record<string, any> for CacheKeyBuilder
  const record: Record<string, any> = {}
  if (params.per_page) record.per_page = params.per_page
  if (params.page) record.page = params.page
  if (params.category) record.category = params.category
  if (params.on_sale !== undefined) record.on_sale = params.on_sale
  if (params.price_min) record.price_min = params.price_min
  if (params.price_max) record.price_max = params.price_max
  if (params.orderby) record.orderby = params.orderby
  if (params.order) record.order = params.order
  if (params.search) record.search = params.search
  
  return CacheKeyBuilder.products(record)
}

function clampInt(value: string | number | undefined | null, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null) return fallback
  const n = typeof value === 'string' ? parseInt(value, 10) : value
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export async function fetchFilteredProducts(params: FilterParams) {
  const per_page = clampInt(params.per_page, 1, 100, 9)
  const page = clampInt(params.page, 1, 1000, 1)
  
  // Normalize params for cache key
  const normalizedParams: FilterParams = {
    ...params,
    per_page,
    page
  }
  
  const cacheKey = getCacheKey(normalizedParams)
  const now = Math.floor(Date.now() / 1000)
  
  // 1. Try Upstash Redis cache first
  try {
    const redisCached = await getCache(cacheKey)
    if (redisCached) {
      console.log('Returning Upstash Redis cached filtered products')
      return {
        data: redisCached as any,
        source: 'Upstash Redis',
        status: 200
      }
    }
  } catch (error) {
    console.error('Upstash Redis cache error:', error)
  }
  
  // 2. Check in-memory cache
  const cached = cache.get(cacheKey)
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log('Returning in-memory cached filtered products')
    return {
      data: cached.data,
      source: 'Memory',
      status: 200
    }
  }
  
  // Handle concurrent fetching (deduplication within same instance)
  if (cached?.isFetching) {
    let attempts = 0
    while (cached.isFetching && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    if (cached.data) {
       return {
         data: cached.data,
         source: 'Memory (Waited)',
         status: 200
       }
    }
  }
  
  // Initialize in-memory cache lock
  if (!cached) {
    cache.set(cacheKey, {
      data: null,
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      throw new Error('WooCommerce API not configured')
    }

    console.log('Fetching filtered products from WooCommerce')
    
    // Resolve category ID from slug
    let categoryId: number | undefined
    if (params.category) {
      const maybeId = Number(params.category)
      if (!Number.isNaN(maybeId) && maybeId > 0) {
        categoryId = maybeId
      } else {
        const slug = params.category.toLowerCase()
        const catCacheKey = `category_id_map:${slug}`
        
        try {
           const cachedId = await getCache<number>(catCacheKey)
           if (cachedId) {
             categoryId = cachedId
           }
        } catch (e) { console.error('Category cache read error', e) }

        if (!categoryId) {
            try {
              const catRes = await wcApi.get('products/categories', { per_page: 1, slug })
              const cats = Array.isArray(catRes.data) ? catRes.data : []
              if (cats.length && typeof cats[0]?.id === 'number') {
                categoryId = cats[0].id
                await setCache(catCacheKey, categoryId, CATEGORY_CACHE_DURATION)
              }
            } catch {
              // ignore
            }
        }
      }
    }

    // Build WooCommerce API parameters
    const wcParams: Record<string, unknown> = { 
      per_page,
      page,
      status: 'publish'
    }
    
    if (categoryId) wcParams['category'] = categoryId
    if (params.on_sale) wcParams['on_sale'] = true
    if (params.price_min) wcParams['min_price'] = clampInt(params.price_min, 0, 1_000_000, 0)
    if (params.price_max) wcParams['max_price'] = clampInt(params.price_max, 0, 1_000_000, 100000)
    if (params.orderby) wcParams['orderby'] = params.orderby
    if (params.order) wcParams['order'] = params.order
    if (params.search) wcParams['search'] = params.search
    
    wcParams['_fields'] = 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
    
    const res = await wcApi.get('products', wcParams)
    const products = Array.isArray(res.data) ? res.data : []
    
    const optimizedProducts = await wcArrayToProductTypes(products)
    
    const finalProducts = optimizedProducts.filter(product => {
      return Array.isArray(product.images) && product.images.length > 0
    })
    
    const responseData = {
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
      await setCache(cacheKey, responseData, CACHE_DURATION)
    } catch (error) {
      console.error('Failed to update Upstash Redis cache:', error)
    }
    
    // Update in-memory cache
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = responseData
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }
    
    return {
      data: responseData,
      source: 'WooCommerce',
      status: 200
    }

  } catch (error) {
    // Release lock on error
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
        updatedCache.isFetching = false
    }
    throw error
  }
}
