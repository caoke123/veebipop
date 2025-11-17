import { ProductType } from '@/type/ProductType'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STALE_WHILE_REVALIDATE = 10 * 60 * 1000 // 10 minutes

// In-memory cache for better performance
const cache = new Map<string, {
  data: ProductType[]
  timestamp: number
  isFetching: boolean
  meta?: {
    count: number
    category: string
    tag: string
    timestamp: number
    cacheExpiry: number
    hasMore: boolean
    isStale?: boolean
  }
}>()

// Generate cache key from parameters
function getCacheKey(subcategorySlug: string, parentCategorySlug: string, limit: number, tag: string): string {
  return `${subcategorySlug}-${parentCategorySlug}-${limit}-${tag}`
}

// Fetch products from a specific subcategory
export async function fetchProductsBySubcategory(
  subcategorySlug: string,
  limit: number = 3,
  tag: string = ''
): Promise<ProductType[]> {
  // If subcategorySlug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
  const subcategorySlugToUse = subcategorySlug === 'art-toy' ? 'art-toys' : subcategorySlug;
  
  const cacheKey = getCacheKey(subcategorySlugToUse, '', limit, tag)
  const now = Date.now()
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log(`Returning cached data for subcategory "${subcategorySlugToUse}"`)
    
    // Check if cache is expired based on metadata
    if (cached.meta && now > cached.meta.cacheExpiry) {
      console.log(`Cache expired for subcategory "${subcategorySlugToUse}" based on metadata`)
    }
    
    return cached.data
  }
  
  // If we're already fetching, wait for the existing request
  if (cached?.isFetching) {
    console.log(`Already fetching subcategory "${subcategorySlugToUse}", waiting...`)
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
      data: [],
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  try {
    const params = new URLSearchParams({
      category: subcategorySlugToUse,
      per_page: String(limit)
    })
    
    // Add tag if provided
    if (tag) {
      params.append('tag', tag)
    }
    
    const url = `/api/woocommerce/products/by-category-and-tag?${params.toString()}`
    console.log('Fetching products by subcategory from:', url)
    
    // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const res = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`)
    }
    
    const responseData = await res.json()
    // Handle new API response structure with metadata
    const products = Array.isArray(responseData) ? responseData : (responseData.data ? responseData.data : [])
    
    // Update cache with metadata
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = products
      updatedCache.timestamp = now
      updatedCache.isFetching = false
      // Store metadata if available
      if (responseData.meta) {
        updatedCache.meta = responseData.meta
      }
    }
    
    // Log metadata if available
    if (responseData.meta) {
      console.log(`API response metadata:`, responseData.meta)
    }
    
    console.log(`Successfully loaded ${products.length} products from subcategory "${subcategorySlugToUse}"`)
    return products
  } catch (e) {
    if (e && (e as any).name === 'AbortError') {
      console.debug(`Fetch aborted for subcategory "${subcategorySlugToUse}"`)
    } else {
      console.error(`Failed to load products from subcategory "${subcategorySlugToUse}"`, e)
    }
    
    // Return stale data if available
    const cached = cache.get(cacheKey)
    if (cached?.data && (now - cached.timestamp) < STALE_WHILE_REVALIDATE) {
      console.warn(`Returning stale data for subcategory "${subcategorySlugToUse}" due to fetch error`)
      
      // Mark as stale in metadata if not already
      if (cached.meta && !cached.meta.isStale) {
        cached.meta.isStale = true
      }
      
      cached.isFetching = false
      return cached.data
    }
    
    // Reset fetching flag on error
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.isFetching = false
    }
    
    return []
  }
}

// Fetch products from a subcategory without tag filtering
export async function fetchSubcategoryProducts(
  subcategorySlug: string,
  parentCategorySlug: string = '',
  limit: number = 3
): Promise<ProductType[]> {
  // If subcategorySlug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
  const subcategorySlugToUse = subcategorySlug === 'art-toy' ? 'art-toys' : subcategorySlug;
  
  const cacheKey = getCacheKey(subcategorySlugToUse, '', limit, '')
  const now = Date.now()
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log(`Returning cached data for subcategory "${subcategorySlugToUse}"`)
    
    // Check if cache is expired based on metadata
    if (cached.meta && now > cached.meta.cacheExpiry) {
      console.log(`Cache expired for subcategory "${subcategorySlugToUse}" based on metadata`)
    }
    
    return cached.data
  }
  
  // If we're already fetching, wait for the existing request
  if (cached?.isFetching) {
    console.log(`Already fetching subcategory "${subcategorySlugToUse}", waiting...`)
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
      data: [],
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  try {
    const params = new URLSearchParams({
      category: subcategorySlugToUse,
      per_page: String(limit)
    })
    
    const url = `/api/woocommerce/products?${params.toString()}`
    console.log('Fetching products by subcategory from:', url)
    
    // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const res = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`)
    }
    
    const responseData = await res.json()
    // Handle API response structure
    const products = Array.isArray(responseData) ? responseData : (responseData.data ? responseData.data : [])
    
    // Update cache with metadata
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = products
      updatedCache.timestamp = now
      updatedCache.isFetching = false
      // Store metadata if available
      if (responseData.meta) {
        updatedCache.meta = responseData.meta
      }
    }
    
    // Log metadata if available
    if (responseData.meta) {
      console.log(`API response metadata:`, responseData.meta)
    }
    
    console.log(`Successfully loaded ${products.length} products from subcategory "${subcategorySlugToUse}"`)
    return products
  } catch (e) {
    if (e && (e as any).name === 'AbortError') {
      console.debug(`Fetch aborted for subcategory "${subcategorySlugToUse}"`)
    } else {
      console.error(`Failed to load products from subcategory "${subcategorySlugToUse}"`, e)
    }
    
    // Return stale data if available
    const currentCache = cache.get(cacheKey)
    if (currentCache && currentCache.data && (now - currentCache.timestamp) < STALE_WHILE_REVALIDATE) {
      console.warn(`Returning stale data for subcategory "${subcategorySlugToUse}"`)
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

// Fetch products from a subcategory, and if not enough, fill with parent category products
export async function fetchSubcategoryProductsWithFallback(
  subcategorySlug: string,
  parentCategorySlug: string = 'art-toys',
  limit: number = 3,
  tag: string = ''
): Promise<ProductType[]> {
  // If subcategorySlug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
  const subcategorySlugToUse = subcategorySlug === 'art-toy' ? 'art-toys' : subcategorySlug;
  
  const cacheKey = getCacheKey(subcategorySlugToUse, parentCategorySlug, limit, tag)
  const now = Date.now()
  const cached = cache.get(cacheKey)
  
  // Return cached data if valid
  if (cached && cached.data && (now - cached.timestamp) < CACHE_DURATION && !cached.isFetching) {
    console.log(`Returning cached fallback data for subcategory "${subcategorySlugToUse}"`)
    
    // Check if cache is expired based on metadata
    if (cached.meta && now > cached.meta.cacheExpiry) {
      console.log(`Fallback cache expired for subcategory "${subcategorySlugToUse}" based on metadata`)
    }
    
    return cached.data
  }
  
  // If we're already fetching, wait for the existing request
  if (cached?.isFetching) {
    console.log(`Already fetching fallback data for subcategory "${subcategorySlugToUse}", waiting...`)
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
      data: [],
      timestamp: 0,
      isFetching: true
    })
  } else {
    cached.isFetching = true
  }

  try {
    // First, try to get products from the subcategory
    let products = await fetchProductsBySubcategory(subcategorySlugToUse, limit, tag)
    
    // If not enough products, get products from the parent category
    if (products.length < limit) {
      console.log(`Not enough products in subcategory "${subcategorySlugToUse}" (${products.length}/${limit}), fetching from parent category "${parentCategorySlug}"`)
      
      // Get products from parent category, excluding those already fetched
      const parentProducts = await fetchProductsBySubcategory(parentCategorySlug, limit, tag)
      
      // Filter out products that are already in the list
      const existingIds = new Set(products.map(p => p.id))
      const additionalProducts = parentProducts.filter(p => !existingIds.has(p.id))
      
      // Combine and limit to the requested number
      products = [...products, ...additionalProducts].slice(0, limit)
    }
    
    // Update cache
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.data = products
      updatedCache.timestamp = now
      updatedCache.isFetching = false
    }
    
    console.log(`Returning ${products.length} products for subcategory "${subcategorySlugToUse}" with fallback`)
    return products
  } catch (e) {
    if (e && (e as any).name === 'AbortError') {
      console.debug(`Fetch aborted for subcategory "${subcategorySlugToUse}" (fallback)`)
    } else {
      console.error(`Failed to load products for subcategory "${subcategorySlugToUse}" with fallback`, e)
    }
    
    // Return stale data if available
    const cached = cache.get(cacheKey)
    if (cached?.data && (now - cached.timestamp) < STALE_WHILE_REVALIDATE) {
      console.warn(`Returning stale fallback data for subcategory "${subcategorySlugToUse}" due to fetch error`)
      
      // Mark as stale in metadata if not already
      if (cached.meta && !cached.meta.isStale) {
        cached.meta.isStale = true
      }
      
      cached.isFetching = false
      return cached.data
    }
    
    // Reset fetching flag on error
    const updatedCache = cache.get(cacheKey)
    if (updatedCache) {
      updatedCache.isFetching = false
    }
    
    return []
  }
}

/**
 * Smart prefetch function that preloads data for tabs the user is likely to click
 * Based on hover and proximity to current active tab
 */
export function prefetchAdjacentTabs(
  currentTab: string,
  allTabs: string[],
  subcategories: Array<{ slug: string; name: string }>,
  parentCategorySlug: string = 'art-toys',
  limit: number = 3,
  tag: string = ''
): void {
  const currentIndex = allTabs.indexOf(currentTab)
  
  // Only prefetch if we have a valid current index
  if (currentIndex === -1) return
  
  // Determine adjacent tabs (previous and next)
  const adjacentIndices = [
    currentIndex - 1, // Previous tab
    currentIndex + 1  // Next tab
  ].filter(index => index >= 0 && index < allTabs.length)
  
  // Prefetch data for adjacent tabs
  adjacentIndices.forEach(index => {
    const tabName = allTabs[index]
    
    // Skip 'Top' tab as it's handled differently
    if (tabName === 'Top') return
    
    const subcategory = subcategories.find(sub => sub.name === tabName)
    if (!subcategory) return
    
    // Check if already cached
    // If subcategory.slug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
    const subcategorySlugToUse = subcategory.slug === 'art-toy' ? 'art-toys' : subcategory.slug;
    const cacheKey = getCacheKey(subcategorySlugToUse, parentCategorySlug, limit, tag)
    const cached = cache.get(cacheKey)
    const needsPrefetch = !cached || 
                        !cached.data || 
                        (Date.now() - cached.timestamp) > CACHE_DURATION
    
    if (!needsPrefetch) return
    
    // Prefetch with a slight delay to not interfere with current loading
    setTimeout(() => {
      fetchSubcategoryProductsWithFallback(
        subcategorySlugToUse,
        parentCategorySlug,
        limit,
        tag
      ).then(() => {
        console.log(`Prefetched data for adjacent tab: ${tabName}`)
      }).catch(error => {
        console.warn(`Failed to prefetch data for tab "${tabName}":`, error)
      })
    }, 100) // Small delay to not interfere with current operations
  })
}

/**
 * Preload products for all subcategories to improve performance
 * Optimized version with priority-based loading and better error handling
 */
export async function preloadSubcategoryProducts(
  subcategories: Array<{ slug: string; name: string }>,
  parentCategorySlug: string = 'art-toys',
  limit: number = 3,
  tag: string = ''
): Promise<void> {
  try {
    // Create a map to track cache status before starting
    const cacheStatus = new Map<string, boolean>()
    
    // Check which subcategories need preloading
    const subcategoriesToPreload = subcategories.filter(subcategory => {
      // If subcategory.slug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
      const subcategorySlugToUse = subcategory.slug === 'art-toy' ? 'art-toys' : subcategory.slug;
      const cacheKey = getCacheKey(subcategorySlugToUse, parentCategorySlug, limit, tag)
      const cached = cache.get(cacheKey)
      const needsPreload = !cached || 
                          !cached.data || 
                          (Date.now() - cached.timestamp) > CACHE_DURATION
      
      cacheStatus.set(subcategory.slug, needsPreload)
      return needsPreload
    })
    
    if (subcategoriesToPreload.length === 0) {
      console.log('All subcategories already cached, skipping preload')
      return
    }
    
    console.log(`Preloading ${subcategoriesToPreload.length} subcategories out of ${subcategories.length}`)
    
    // Split into high priority (first 2) and low priority (rest)
    const highPriority = subcategoriesToPreload.slice(0, 2)
    const lowPriority = subcategoriesToPreload.slice(2)
    
    // Load high priority subcategories first
    const highPriorityPromises = highPriority.map(subcategory => {
      // If subcategory.slug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
      const subcategorySlugToUse = subcategory.slug === 'art-toy' ? 'art-toys' : subcategory.slug;
      return fetchSubcategoryProductsWithFallback(
        subcategorySlugToUse,
        parentCategorySlug,
        limit,
        tag
      ).catch(error => {
        console.warn(`Failed to preload high priority products for subcategory "${subcategory.name}":`, error)
        return [] as ProductType[]
      })
    })
    
    // Wait for high priority to complete before starting low priority
    await Promise.all(highPriorityPromises)
    
    // Load low priority subcategories with a delay to not block the main thread
    const lowPriorityPromises = lowPriority.map((subcategory, index) => 
      new Promise<void>(resolve => {
        // Stagger the low priority requests to avoid overwhelming the server
        setTimeout(() => {
          // If subcategory.slug is "art-toy", use "art-toys" since that's the actual category in WooCommerce
          const subcategorySlugToUse = subcategory.slug === 'art-toy' ? 'art-toys' : subcategory.slug;
          fetchSubcategoryProductsWithFallback(
            subcategorySlugToUse,
            parentCategorySlug,
            limit,
            tag
          ).then(() => {
            console.log(`Preloaded low priority subcategory: ${subcategory.name}`)
            resolve()
          }).catch(error => {
            console.warn(`Failed to preload low priority products for subcategory "${subcategory.name}":`, error)
            resolve()
          })
        }, index * 200) // 200ms delay between each request
      })
    )
    
    // Don't wait for low priority promises to resolve
    Promise.all(lowPriorityPromises).catch(error => {
      console.warn('Error in low priority preloading:', error)
    })
    
    console.log(`High priority preloading completed for ${highPriority.length} subcategories`)
  } catch (error) {
    console.warn('Failed to preload subcategory products:', error)
  }
}