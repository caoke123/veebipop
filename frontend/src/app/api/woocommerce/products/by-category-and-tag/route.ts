import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'
import { wcArrayToProductTypes } from '@/utils/wcAdapter'
import { NextRequest } from 'next/server'

// Cache configuration
const CACHE_DURATION = 10 * 60
const STALE_WHILE_REVALIDATE = 20 * 60

// In-memory cache for better performance
const cache = new Map<string, {
  data: any[]
  timestamp: number
  isFetching: boolean
}>()

// Generate cache key from parameters
function getCacheKey(category: string, tag: string, per_page: number): string {
  return `${category}-${tag}-${per_page}`
}

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const n = value ? parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const per_page = clampInt(searchParams.get('per_page'), 1, 100, 10)

  if (!category || !tag) {
    return error(400, 'Both category and tag parameters are required')
  }

  const cacheKey = getCacheKey(category, tag, per_page)
  const now = Math.floor(Date.now() / 1000) // Current time in seconds
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log(`Returning cached data for category "${category}" and tag "${tag}"`)
    
    const optimizedProducts = await wcArrayToProductTypes(cached.data.slice(0, per_page))
    const response = {
      data: optimizedProducts,
      meta: {
        count: optimizedProducts.length,
        category: category,
        tag: tag,
        timestamp: cached.timestamp,
        cacheExpiry: cached.timestamp + (CACHE_DURATION * 1000),
        hasMore: cached.data.length > per_page
      }
    }
    
    // Set cache headers for browser caching
    const headers = new Headers()
    headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`)
    headers.set('CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE * 2}`)
    headers.set('Content-Type', 'application/json')
    const body = JSON.stringify(response)
    const etag = `W/"${Buffer.from(body).toString('base64url')}"`
    headers.set('ETag', etag)
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
    return new Response(body, {
      status: 200,
      headers
    })
  }
  
  // If we're already fetching, return stale data if available, otherwise wait
  if (cached?.isFetching) {
    console.log(`Already fetching data for category "${category}" and tag "${tag}"`)
    
    // Return stale data if available
    if (cached.data && (now - cached.timestamp) < STALE_WHILE_REVALIDATE) {
      console.log(`Returning stale data for category "${category}" and tag "${tag}"`)
      
      const optimizedProducts = await wcArrayToProductTypes(cached.data.slice(0, per_page))
      const response = {
        data: optimizedProducts,
        meta: {
          count: optimizedProducts.length,
          category: category,
          tag: tag,
          timestamp: cached.timestamp,
          cacheExpiry: cached.timestamp + (CACHE_DURATION * 1000),
          hasMore: cached.data.length > per_page,
          isStale: true
        }
      }
      
      const headers = new Headers()
      headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`)
      headers.set('CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE * 2}`)
      headers.set('Content-Type', 'application/json')
      const body = JSON.stringify(response)
      const etag = `W/"${Buffer.from(body).toString('base64url')}"`
      headers.set('ETag', etag)
      if (request.headers.get('if-none-match') === etag) {
        return new Response(null, { status: 304, headers })
      }
      return new Response(body, {
        status: 200,
        headers
      })
    }
    
    // Wait for the fetch to complete (simple polling)
    let attempts = 0
    while (cached.isFetching && attempts < 30) { // Max 3 seconds wait
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (cached.data) {
      const optimizedProducts = await wcArrayToProductTypes(cached.data.slice(0, per_page))
      const response = {
        data: optimizedProducts,
        meta: {
          count: optimizedProducts.length,
          category: category,
          tag: tag,
          timestamp: cached.timestamp,
          cacheExpiry: cached.timestamp + (CACHE_DURATION * 1000),
          hasMore: cached.data.length > per_page
        }
      }
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: new Headers({
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE * 2}`,
          'Content-Type': 'application/json'
        })
      })
    }
  }
  
  // Initialize cache entry if it doesn't exist
  if (!cached) {
    cache.set(cacheKey, {
      data: [],
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  const wcApi = getWcApi()
  if (!wcApi) {
    return error(500, 'WooCommerce environment variables are not configured')
  }

  try {
    // First, get the category ID from the slug
    let categoryId: number | undefined
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

    // Get all subcategories of the requested category
    let allCategoryIds: number[] = []
    if (categoryId) {
      allCategoryIds.push(categoryId)
      
      // For in-car-accessories (ID: 85), we know it has subcategories like Seatbelt Covers (ID: 86)
      if (categoryId === 85) {
        allCategoryIds.push(86) // Seatbelt Covers
        console.log(`Added known subcategory ID 86 for in-car-accessories`)
      }
      
      // Try to get other subcategories dynamically, but don't fail if it errors
      try {
        // Add timeout for subcategory fetching to prevent hanging
        const subcategoryTimeout = setTimeout(() => {
          console.log('Subcategory fetching timed out, proceeding with available categories')
        }, 10000) // 10 second timeout for subcategory fetching
        
        // Get all subcategories recursively with depth limit to prevent infinite loops
        const getSubcategories = async (parentId: number, depth = 0): Promise<number[]> => {
          // Limit recursion depth to prevent performance issues
          if (depth > 3) {
            console.log(`Maximum recursion depth reached for parent ${parentId}`)
            return []
          }
          
          try {
            const subRes = await wcApi.get('products/categories', { parent: parentId, per_page: 100 })
            const subcats = Array.isArray(subRes.data) ? subRes.data : []
            const subIds: number[] = []
            
            for (const subcat of subcats) {
              if (typeof subcat?.id === 'number') {
                subIds.push(subcat.id)
                // Recursively get subcategories of this subcategory with depth tracking
                try {
                  const deeperSubs = await getSubcategories(subcat.id, depth + 1)
                  subIds.push(...deeperSubs)
                } catch (err) {
                  console.log(`Error getting subcategories of ${subcat.id}:`, err)
                }
              }
            }
            
            return subIds
          } catch (err) {
            console.log(`Error getting subcategories for parent ${parentId}:`, err)
            return []
          }
        }
        
        const subIds = await getSubcategories(categoryId)
        clearTimeout(subcategoryTimeout)
        
        if (subIds.length > 0) {
          allCategoryIds.push(...subIds)
          console.log(`Category ${category} (ID: ${categoryId}) has subcategories with IDs: ${subIds.join(', ')}`)
        } else {
          console.log(`No subcategories found for category ${category}`)
        }
      } catch (err) {
        console.log('Error getting subcategories:', err)
      }
    }

    // Try using tag parameter first (if supported)
    let products: any[] = []
    
    try {
      // Add timeout for the entire product fetching process
      const productFetchTimeout = setTimeout(() => {
        console.log('Product fetching timed out, will return empty results')
      }, 18000) // 18 second timeout for product fetching
      
      // Try direct tag filtering with optimized parameters
      const fieldsParam = searchParams.get('_fields') ?? undefined
      const defaultFields = 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,tags,categories,date_created'
      const productParams: Record<string, unknown> = { 
        per_page,
        category: categoryId,
        tag: tag,
        status: 'publish',
        _fields: fieldsParam ?? defaultFields
      }
      
      try {
        const productsRes = await wcApi.get('products', productParams)
        products = Array.isArray(productsRes.data) ? productsRes.data : []
        console.log(`Direct tag filtering returned ${products.length} products`)
      } catch (apiError) {
        console.log('WooCommerce API error during direct tag filtering:', apiError)
        products = []
      }
      
      // If no products found with direct tag filtering, try manual filtering
      if (products.length === 0) {
        console.log('No products found with direct tag filtering, trying manual filtering')
        
        try {
          // Fallback: Get all products in the category and filter manually
          const categoryParams: Record<string, unknown> = { 
            per_page: 100, // Get more products to filter
            category: categoryId,
            status: 'publish',
            _fields: fieldsParam ?? defaultFields
          }
          
          const categoryRes = await wcApi.get('products', categoryParams)
          const categoryProducts = Array.isArray(categoryRes.data) ? categoryRes.data : []
          
          console.log(`Found ${categoryProducts.length} products in category`)
          
          // Filter products that have the specified tag
          products = categoryProducts.filter((product: any) => {
            if (!product.tags || !Array.isArray(product.tags)) {
              console.log(`Product ${product.name} has no tags array`)
              return false
            }
            
            // Check if product belongs to the requested category or any of its subcategories
            const belongsToCategory = product.categories && Array.isArray(product.categories) && 
              product.categories.some((cat: any) => 
                allCategoryIds.includes(cat.id) || cat.slug.toLowerCase() === category.toLowerCase()
              )
            
            if (!belongsToCategory) {
              return false
            }
            
            const hasTag = product.tags.some((productTag: any) => 
              productTag.slug && productTag.slug.toLowerCase() === tag.toLowerCase()
            )
            
            if (hasTag) {
              console.log(`Product ${product.name} has tag ${tag} and belongs to category ${category}`)
            }
            
            return hasTag
          })
          
          console.log(`Manual filtering returned ${products.length} products from ${categoryProducts.length} category products`)
        } catch (manualFilterError) {
          console.log('Error during manual filtering:', manualFilterError)
          products = []
        }
      }
      
      clearTimeout(productFetchTimeout)
    } catch (tagError) {
      console.log('Product fetching process failed completely:', tagError)
      products = []
    }

    // Convert to ProductType format with only necessary fields
    const optimizedProducts = await wcArrayToProductTypes(products.slice(0, per_page))
    
    // Create optimized response structure with metadata
    const response = {
      data: optimizedProducts,
      meta: {
        count: optimizedProducts.length,
        category: category,
        tag: tag,
        timestamp: now,
        cacheExpiry: now + (CACHE_DURATION * 1000),
        hasMore: products.length > per_page
      }
    }
    
    // Update cache
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = products
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }

    // Set cache headers for better caching
    const headers = new Headers()
    headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`)
    headers.set('CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION * 2}, stale-while-revalidate=${STALE_WHILE_REVALIDATE * 2}`)
    headers.set('Content-Type', 'application/json')
    const body = JSON.stringify(response)
    const etag = `W/"${Buffer.from(body).toString('base64url')}"`
    headers.set('ETag', etag)
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
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
    return error(status, 'Failed to load products', details)
  }
}