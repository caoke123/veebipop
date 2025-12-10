import { getWcApiWithRetry } from '@/utils/woocommerce'
import { getCache, setCache } from '@/lib/cache'
import { wcArrayToProductTypes, wcToProductType } from '@/utils/wcAdapter'
import { ProductType } from '@/type/ProductType'

export interface ProductDetailResult {
  mainProduct: ProductType
  relatedProducts: ProductType[]
  fallbackProducts: ProductType[]
  cacheStatus?: 'HIT' | 'MISS' | 'SET'
  cacheKey?: string
}

// Cache configuration
const MAIN_PRODUCT_TTL = 3600 // 1 hour
const RELATED_PRODUCTS_TTL = 7200 // 2 hours
const FALLBACK_PRODUCTS_TTL = 1800 // 30 minutes

// Helper: Fetch main product
async function fetchMainProduct(slug: string) {
  const wcApi = await getWcApiWithRetry()
  if (!wcApi) {
    throw new Error('WooCommerce API not available')
  }

  const response = await wcApi.get('products', {
    slug,
    per_page: 1,
    _fields: 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data,related_ids'
  })

  if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('Product not found')
  }

  return await wcToProductType(response.data[0])
}

// Helper: Fetch related products by IDs
async function fetchRelatedProductsByIds(relatedIds: number[], excludeId?: number) {
  if (!relatedIds || relatedIds.length === 0) {
    return []
  }

  const wcApi = await getWcApiWithRetry()
  if (!wcApi) {
    throw new Error('WooCommerce API not available')
  }

  const response = await wcApi.get('products', {
    include: relatedIds.join(','),
    per_page: 8,
    _fields: 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
  })

  if (!response.data || !Array.isArray(response.data)) {
    return []
  }

  // Filter out current product and convert
  const filtered = response.data.filter((product: any) => product.id !== excludeId)
  return await wcArrayToProductTypes(filtered)
}

// Helper: Fetch fallback products (same category)
async function fetchFallbackProducts(category: string, excludeId?: number, limit: number = 8) {
  const wcApi = await getWcApiWithRetry()
  if (!wcApi) {
    throw new Error('WooCommerce API not available')
  }

  const response = await wcApi.get('products', {
    category,
    per_page: limit + 1, // Fetch one more to handle exclusion
    orderby: 'date',
    order: 'desc',
    _fields: 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
  })

  if (!response.data || !Array.isArray(response.data)) {
    return []
  }

  // Filter out current product and limit
  const filtered = response.data
    .filter((product: any) => product.id !== excludeId)
    .slice(0, limit)

  return await wcArrayToProductTypes(filtered)
}

// Helper: Resolve category ID from slug
export async function resolveCategoryId(categorySlug: string): Promise<number | undefined> {
  const wcApi = await getWcApiWithRetry()
  if (!wcApi) {
    return undefined
  }

  try {
    const response = await wcApi.get('products/categories', {
      slug: categorySlug,
      per_page: 1
    })

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].id
    }
  } catch (error) {
    console.error('Error resolving category ID:', error)
  }

  return undefined
}

// New Helper: Fetch combined related products (for API use)
export async function fetchCombinedRelatedProducts(
  mainProductId: number,
  categorySlug: string | undefined,
  relatedIds: number[] = []
): Promise<ProductType[]> {
  const TARGET_COUNT = 8
  
  // Strategy: 
  // 1. If we have enough related_ids (>= 8), just fetch those.
  // 2. Otherwise, fetch related_ids AND fallback category products in parallel to save time.
  
  const tasks: Promise<ProductType[]>[] = []
  
  // Task 1: Fetch by related IDs
  if (relatedIds.length > 0) {
    tasks.push(fetchRelatedProductsByIds(relatedIds, mainProductId))
  } else {
    tasks.push(Promise.resolve([]))
  }
  
  // Task 2: Fetch by Category (if needed)
  // We fetch if relatedIds < 8. Even if we don't strictly "need" to parallelize if relatedIds are enough,
  // usually manual related products are few. So parallel fetching is safer for speed.
  // Exception: if relatedIds.length >= 8, we might skip category fetch to save resources, 
  // but the user wants speed. Let's assume if >= 8, we skip category.
  if (categorySlug && relatedIds.length < TARGET_COUNT) {
     tasks.push(resolveCategoryId(categorySlug).then(catId => {
       if (catId) {
         // Fetch enough to cover the gap + buffer
         return fetchFallbackProducts(String(catId), mainProductId, TARGET_COUNT + 2)
       }
       return []
     }))
  } else {
    tasks.push(Promise.resolve([]))
  }
  
  const [relatedResults, categoryResults] = await Promise.all(tasks)
  
  // Merge: related first, then category
  const combined = [...relatedResults]
  const existingIds = new Set(combined.map(p => p.id))
  
  for (const p of categoryResults) {
    if (combined.length >= TARGET_COUNT) break
    if (!existingIds.has(p.id) && p.id !== String(mainProductId)) {
      combined.push(p)
      existingIds.add(p.id)
    }
  }
  
  return combined.slice(0, TARGET_COUNT)
}

export async function fetchProductDetail(slug: string, includeRelated: boolean = true): Promise<ProductDetailResult> {
  if (!slug) {
    throw new Error('Slug parameter is required')
  }

  // Build cache key
  const cacheKey = `product-detail-${slug}-${includeRelated ? 'with-related' : 'no-related'}`

  try {
    // Try cache first
    const cached = await getCache<ProductDetailResult>(cacheKey)
    if (cached) {
      console.log(`[CACHE HIT] product-detail for slug: ${slug}`)
      return {
        ...cached,
        cacheStatus: 'HIT',
        cacheKey
      }
    }

    console.log(`[CACHE MISS] product-detail for slug: ${slug}`)

    // Fetch main product first
    const mainProduct = await fetchMainProduct(slug)
    
    let relatedProducts: ProductType[] = []
    let fallbackProducts: ProductType[] = []

    if (includeRelated) {
      try {
        // Fetch related products if IDs exist
        if (mainProduct.related_ids && mainProduct.related_ids.length > 0) {
          relatedProducts = await fetchRelatedProductsByIds(mainProduct.related_ids, Number(mainProduct.id))
        }

        // 2. Check if we need more products to fill up to 8
        const TARGET_COUNT = 8
        if (relatedProducts.length < TARGET_COUNT && mainProduct.category) {
          const categoryId = await resolveCategoryId(mainProduct.category)
          
          if (categoryId) {
            // Calculate how many more we need
            const needed = TARGET_COUNT - relatedProducts.length
            
            // Fetch enough potential candidates (limit + some buffer for duplicates)
            // We fetch TARGET_COUNT + 2 to ensure we have enough after filtering
            const candidates = await fetchFallbackProducts(String(categoryId), Number(mainProduct.id), TARGET_COUNT + 2)
            
            // Filter out products that are already in relatedProducts
            const relatedIds = new Set(relatedProducts.map(p => p.id))
            const newFallbacks = candidates
              .filter(p => !relatedIds.has(p.id))
              .slice(0, needed)
              
            fallbackProducts = newFallbacks
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
        // Try fallback if related fetch failed
        if (mainProduct.category) {
            try {
                const categoryId = await resolveCategoryId(mainProduct.category)
                if (categoryId) {
                    fallbackProducts = await fetchFallbackProducts(String(categoryId), Number(mainProduct.id))
                }
            } catch (fallbackError) {
                console.error('Error fetching fallback products:', fallbackError)
            }
        }
      }
    }

    const responseData = {
      mainProduct,
      relatedProducts,
      fallbackProducts
    }

    // Set cache
    await setCache(cacheKey, responseData, MAIN_PRODUCT_TTL)
    console.log(`[CACHE SET] product-detail for slug: ${slug} with TTL: ${MAIN_PRODUCT_TTL}s`)

    return {
      ...responseData,
      cacheStatus: 'SET',
      cacheKey
    }
  } catch (error) {
    console.error('Error in fetchProductDetail:', error)
    throw error
  }
}
