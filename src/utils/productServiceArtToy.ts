import { ProductType } from '@/type/ProductType'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STALE_WHILE_REVALIDATE = 10 * 60 * 1000 // 10 minutes

// In-memory cache for better performance
let cache: Map<string, {
  data: ProductType[] | null
  timestamp: number
  isFetching: boolean
}> = new Map()

// Get cache key from parameters
function getCacheKey(category: string, tag: string, limit: number): string {
  return `${category}-${tag}-${limit}`
}

// Get cache key for category-only requests
function getCategoryCacheKey(category: string, limit: number): string {
  return `category-${category}-${limit}`
}

// Fetch products that belong to a specific category and have a specific tag
export async function fetchProductsByCategoryAndTag(
  category: string,
  tag: string,
  limit: number = 10,
  forceRefresh: boolean = false
): Promise<ProductType[]> {
  // If category is "art-toy", use "art-toys" since that's the actual category in WooCommerce
  const categoryToUse = category === 'art-toy' ? 'art-toys' : category;
  
  const cacheKey = getCacheKey(categoryToUse, tag, limit)
  const now = Date.now()
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !forceRefresh && !cached.isFetching) {
    return cached.data
  }
  
  // If we're already fetching, wait for the existing request
  if (cached?.isFetching) {
    // Wait for the fetch to complete (simple polling)
    let attempts = 0
    while (cached.isFetching && attempts < 50) { // Max 5 seconds wait
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (cached.data) {
      return cached.data
    }
  }
  
  // Initialize cache entry if it doesn't exist
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
    // Use relative URL instead of hardcoded host
    const params = new URLSearchParams({
      category: categoryToUse,
      tag,
      per_page: String(limit)
    })
    
    const url = `/api/woocommerce/products/by-category-and-tag?${params.toString()}`
    console.log('Fetching products by category and tag from:', url)
    
    const res = await fetch(url, { 
      method: 'GET',
      headers: {
        'Cache-Control': 'max-age=0', // Bypass browser cache
      },
      cache: 'force-cache', // Use Next.js cache
    })
    
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`)
    }
    
    // Handle 204 No Content response
    if (res.status === 204) {
      console.log('fetchProductsByCategoryAndTag: API returned 204 No Content for category:', categoryToUse, 'tag:', tag);
      const products: ProductType[] = [];
      // Update cache
      const updatedCache = cache.get(cacheKey)
      if (updatedCache) {
        updatedCache.data = products
        updatedCache.timestamp = now
        updatedCache.isFetching = false
      }
      return products;
    }
    
    const data = await res.json()
    // Extract products from API response
    const products = data.data || []
    
    // Update cache
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = products
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }
    
    console.log(`Successfully loaded ${products.length} products from WooCommerce for category "${categoryToUse}" and tag "${tag}"`)
    return products
  } catch (e) {
    console.error(`Failed to load products from WooCommerce API for category "${categoryToUse}" and tag "${tag}"`, e)
    
    // Return stale data if available
    const currentCache = cache.get(cacheKey)
    if (currentCache && currentCache.data && (now - currentCache.timestamp) < STALE_WHILE_REVALIDATE) {
      console.warn('Returning stale data due to fetch error')
      return currentCache.data
    }
    
    return []
  } finally {
    const currentCache = cache.get(cacheKey)
    if (currentCache) {
      currentCache.isFetching = false
    }
  }
}

// Fetch products that belong to a specific category (without tag filtering)
export async function fetchProductsByCategory(
  category: string,
  limit: number = 10,
  forceRefresh: boolean = false
): Promise<ProductType[]> {
  // If category is "art-toy", use "art-toys" since that's the actual category in WooCommerce
  const categoryToUse = category === 'art-toy' ? 'art-toys' : category;
  
  const cacheKey = getCategoryCacheKey(categoryToUse, limit)
  const now = Date.now()
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !forceRefresh && !cached.isFetching) {
    return cached.data
  }
  
  // If we're already fetching, wait for the existing request
  if (cached?.isFetching) {
    // Wait for the fetch to complete (simple polling)
    let attempts = 0
    while (cached.isFetching && attempts < 50) { // Max 5 seconds wait
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (cached.data) {
      return cached.data
    }
  }
  
  // Initialize cache entry if it doesn't exist
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
    // Use relative URL instead of hardcoded host
    const params = new URLSearchParams({
      category: categoryToUse,
      per_page: String(limit)
    })
    
    const url = `/api/woocommerce/products?${params.toString()}`
    console.log('Fetching products by category from:', url)
    
    const res = await fetch(url, { 
      method: 'GET',
      headers: {
        'Cache-Control': 'max-age=0', // Bypass browser cache
      },
      cache: 'force-cache', // Use Next.js cache
    })
    
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`)
    }
    
    // Handle 204 No Content response
    if (res.status === 204) {
      console.log('fetchProductsByCategory: API returned 204 No Content for category:', categoryToUse);
      const products: ProductType[] = [];
      // Update cache
      const updatedCache = cache.get(cacheKey)
      if (updatedCache) {
        updatedCache.data = products
        updatedCache.timestamp = now
        updatedCache.isFetching = false
      }
      return products;
    }
    
    const data = await res.json()
    // Extract products from API response
    const products = Array.isArray(data) ? data : (data.data ? data.data : [])
    
    // Update cache
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = products
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }
    
    console.log(`Successfully loaded ${products.length} products from WooCommerce for category "${categoryToUse}"`)
    return products
  } catch (e) {
    console.error(`Failed to load products from WooCommerce API for category "${categoryToUse}"`, e)
    
    // Return stale data if available
    const currentCache = cache.get(cacheKey)
    if (currentCache && currentCache.data && (now - currentCache.timestamp) < STALE_WHILE_REVALIDATE) {
      console.warn('Returning stale data due to fetch error')
      return currentCache.data
    }
    
    return []
  } finally {
    const currentCache = cache.get(cacheKey)
    if (currentCache) {
      currentCache.isFetching = false
    }
  }
}

// Fetch Art Toy products with Home tag
export async function fetchArtToyHomeProducts(limit: number = 4): Promise<ProductType[]> {
  return fetchProductsByCategoryAndTag('art-toys', 'home', limit)
}

/**
 * Preload Art Toy products for better performance
 */
export async function preloadArtToyHomeProducts(limit: number = 4): Promise<void> {
  try {
    // Call the fetch function but don't wait for it
    fetchProductsByCategoryAndTag('art-toys', 'home', limit).catch(error => {
      console.warn('Failed to preload Art Toy products:', error)
    })
  } catch (error) {
    // Ignore preloading errors
  }
}