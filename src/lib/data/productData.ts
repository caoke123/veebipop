import { getWcApiWithRetry } from '@/utils/woocommerce'
import { getCacheClient, getNamespaceVersion } from '@/utils/cache'
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
async function resolveCategoryId(categorySlug: string): Promise<number | undefined> {
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

export async function fetchProductDetail(slug: string, includeRelated: boolean = true): Promise<ProductDetailResult> {
  if (!slug) {
    throw new Error('Slug parameter is required')
  }

  // Build cache key
  const cacheClient = getCacheClient()
  const nsVersion = await getNamespaceVersion('product-detail')
  const cacheKey = `product-detail-${slug}-${includeRelated ? 'with-related' : 'no-related'}-${nsVersion}`

  try {
    // Try cache first
    const cached = await cacheClient.get(cacheKey)
    if (cached) {
      console.log(`[CACHE HIT] product-detail for slug: ${slug}`)
      return {
        ...cached as any,
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

        // If no related products, fetch fallback products from category
        if (relatedProducts.length === 0 && mainProduct.category) {
          const categoryId = await resolveCategoryId(mainProduct.category)
          if (categoryId) {
            fallbackProducts = await fetchFallbackProducts(String(categoryId), Number(mainProduct.id))
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
    await cacheClient.set(cacheKey, responseData, MAIN_PRODUCT_TTL)
    console.log(`[CACHE SET] product-detail for slug: ${slug} with TTL: ${MAIN_PRODUCT_TTL}s`)

    return {
      ...responseData,
      cacheStatus: 'SET',
      cacheKey
    }

  } catch (error: any) {
    console.error('Error in fetchProductDetail:', error)
    throw error
  }
}
