// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getWcApiWithRetry } from '@/utils/woocommerce'
import { json } from '@/utils/apiResponse'
import { getCacheClient, getNamespaceVersion } from '@/utils/cache'
import { wcArrayToProductTypes, wcToProductType } from '@/utils/wcAdapter'
import { NextRequest } from 'next/server'

interface ProductDetailResponse {
  mainProduct: any
  relatedProducts: any[]
  fallbackProducts: any[]
}

// 缓存配置
const MAIN_PRODUCT_TTL = 3600 // 1小时
const RELATED_PRODUCTS_TTL = 7200 // 2小时
const FALLBACK_PRODUCTS_TTL = 1800 // 30分钟

// 获取主产品
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

// 获取相关产品（通过related_ids）
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

  // 过滤掉当前产品并转换格式
  const filtered = response.data.filter((product: any) => product.id !== excludeId)
  return await wcArrayToProductTypes(filtered)
}

// 获取兜底产品（同类目产品）
async function fetchFallbackProducts(category: string, excludeId?: number, limit: number = 8) {
  const wcApi = await getWcApiWithRetry()
  if (!wcApi) {
    throw new Error('WooCommerce API not available')
  }

  const response = await wcApi.get('products', {
    category,
    per_page: limit + 1, // 多获取一个以便过滤
    orderby: 'date',
    order: 'desc',
    _fields: 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
  })

  if (!response.data || !Array.isArray(response.data)) {
    return []
  }

  // 过滤掉当前产品并限制数量
  const filtered = response.data
    .filter((product: any) => product.id !== excludeId)
    .slice(0, limit)

  return await wcArrayToProductTypes(filtered)
}

// 解析分类ID
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const includeRelated = searchParams.get('includeRelated') === 'true'

  if (!slug) {
    return json({ error: 'slug parameter is required' }, { status: 400 })
  }

  // 构建缓存键
  const cacheClient = getCacheClient()
  const nsVersion = await getNamespaceVersion('product-detail')
  const cacheKey = `product-detail-${slug}-${includeRelated ? 'with-related' : 'no-related'}-${nsVersion}`

  try {
    // 尝试从缓存获取
    const cached = await cacheClient.get(cacheKey)
    if (cached) {
      console.log(`[CACHE HIT] product-detail for slug: ${slug}`)
      return json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      })
    }

    console.log(`[CACHE MISS] product-detail for slug: ${slug}`)

    // 并行获取所有数据
    const promises: Promise<any>[] = [fetchMainProduct(slug)]
    
    if (includeRelated) {
      promises.push(
        fetchMainProduct(slug).then(async (mainProduct) => {
          let relatedProducts: any[] = []
          let fallbackProducts: any[] = []

          try {
            // 获取相关产品
            if (mainProduct?.related_ids && mainProduct.related_ids.length > 0) {
              relatedProducts = await fetchRelatedProductsByIds(mainProduct.related_ids, parseInt(mainProduct.id))
            }

            // 如果没有相关产品，获取兜底产品
            if (relatedProducts.length === 0 && mainProduct?.category) {
              const categoryId = await resolveCategoryId(mainProduct.category)
              if (categoryId) {
                fallbackProducts = await fetchFallbackProducts(String(categoryId), parseInt(mainProduct.id))
              }
            }
          } catch (error) {
            console.error('Error fetching related products:', error)
            // 如果相关产品获取失败，尝试获取兜底产品
            if (mainProduct?.category) {
              const categoryId = await resolveCategoryId(mainProduct.category)
              if (categoryId) {
                fallbackProducts = await fetchFallbackProducts(String(categoryId), parseInt(mainProduct.id))
              }
            }
          }

          return { relatedProducts, fallbackProducts }
        })
      )
    }

    const results = await Promise.all(promises)
    const mainProduct = results[0]
    
    let relatedProducts: any[] = []
    let fallbackProducts: any[] = []

    if (includeRelated && results[1]) {
      relatedProducts = results[1].relatedProducts || []
      fallbackProducts = results[1].fallbackProducts || []
    }

    const responseData: ProductDetailResponse = {
      mainProduct,
      relatedProducts,
      fallbackProducts
    }

    // 缓存结果
    await cacheClient.set(cacheKey, responseData, MAIN_PRODUCT_TTL)

    console.log(`[CACHE SET] product-detail for slug: ${slug} with TTL: ${MAIN_PRODUCT_TTL}s`)

    return json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Key': cacheKey,
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })

  } catch (error: any) {
    console.error('Error in product-detail API:', error)
    
    // 返回错误响应
    return json({
      error: 'Failed to fetch product details',
      message: error.message,
      slug
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}