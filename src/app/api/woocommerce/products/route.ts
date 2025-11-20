import { getWcApiWithRetry } from '@/utils/woocommerce'
import crypto from 'crypto'
import { json, error } from '@/utils/apiResponse'
import { getCacheClient, getNamespaceVersion } from '@/utils/cache'
import { wcArrayToProductTypes } from '@/utils/wcAdapter'

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const n = value ? parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

// Simple global in-memory cache with TTL
type CacheEntry = { data: any[]; total?: number; totalPages?: number }
const DEFAULT_TTL_MS = Number(process.env.WC_PRODUCTS_CACHE_TTL_MS || 120_000)

function buildCacheKey(keyParts: Record<string, unknown>) {
  // Ensure stable key by sorting keys
  const entries = Object.entries(keyParts).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return JSON.stringify(Object.fromEntries(entries))
}

function headerNumber(headers: any, name: string): number | undefined {
  if (!headers) return undefined
  const lower = headers[name.toLowerCase()]
  const raw = lower ?? headers[name]
  const num = parseInt(String(raw ?? ''), 10)
  return Number.isNaN(num) ? undefined : num
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // Use maximum per_page by default to reduce round trips
  const per_page = clampInt(searchParams.get('per_page'), 1, 100, 100)
  // Always start from page 1 to merge all pages
  const startPage = 1
  const search = searchParams.get('search') ?? undefined
  const orderby = searchParams.get('orderby') ?? undefined
  const order = searchParams.get('order') ?? undefined
  // Filter by slug (WooCommerce supports exact match on slug)
  const slugParam = searchParams.get('slug') ?? undefined
  const categoryParam = searchParams.get('category')
  // New filters
  const onSaleParam = (searchParams.get('on_sale') ?? '').toLowerCase()
  const priceMinParam = searchParams.get('price_min')
  const priceMaxParam = searchParams.get('price_max')
  const refresh = (searchParams.get('refresh') ?? '').toLowerCase() === 'true'
  const defaultFields = 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data,related_ids'
  const fieldsParam = searchParams.get('_fields') ?? defaultFields
  
  // Always ensure meta_data and categories are included in fields, regardless of source
  let finalFieldsParam = fieldsParam
  if (!finalFieldsParam.includes('meta_data')) {
    finalFieldsParam = finalFieldsParam + ',meta_data'
  }
  if (!finalFieldsParam.includes('categories')) {
    finalFieldsParam = finalFieldsParam + ',categories'
  }
  
  // Debug logging
  console.log('[API DEBUG] fieldsParam:', fieldsParam)
  console.log('[API DEBUG] finalFieldsParam:', finalFieldsParam)
  console.log('[API DEBUG] finalFieldsParam includes meta_data:', finalFieldsParam.includes('meta_data'))
  console.log('[API DEBUG] finalFieldsParam includes categories:', finalFieldsParam.includes('categories'))
  const mergeParam = (searchParams.get('merge') ?? '').toLowerCase()
  const mergeAll = mergeParam === 'false' ? false : true
  const pageParam = clampInt(searchParams.get('page'), 1, 1000, 1)
  const no304 = (searchParams.get('no304') ?? '').toLowerCase() === 'true'
  const requireImagesParam = (searchParams.get('require_images') ?? '').toLowerCase() === 'true'

  const wcApi = await getWcApiWithRetry()
  if (!wcApi) {
    return json([], { headers: { 'x-wc-proxy': 'missing-env' } })
  }

  // Resolve category slug -> id if needed
  let categoryId: number | undefined
  let includeSubcategories = false
  
  if (categoryParam) {
    const maybeId = Number(categoryParam)
    if (!Number.isNaN(maybeId) && maybeId > 0) {
      categoryId = maybeId
      includeSubcategories = true // Include subcategories when using ID
    } else {
      const slug = categoryParam.toLowerCase()
      try {
        const catRes = await wcApi.get('products/categories', { per_page: 1, slug })
        const cats = Array.isArray(catRes.data) ? catRes.data : []
        if (cats.length && typeof cats[0]?.id === 'number') {
          categoryId = cats[0].id
          includeSubcategories = true // Include subcategories when using slug
        }
      } catch {
        // ignore; fallback to no category filter
      }
    }
  }

  // Build cache key using filters and namespace version (ignoring page because we merge all pages)
  const nsVersion = await getNamespaceVersion('products')
  const cacheKey = buildCacheKey({
    nsVersion,
    per_page,
    search,
    orderby,
    order,
    slug: slugParam,
    categoryId,
    on_sale: onSaleParam === 'true' ? true : undefined,
    price_min: priceMinParam ? clampInt(priceMinParam, 0, 1_000_000, 0) : undefined,
    price_max: priceMaxParam ? clampInt(priceMaxParam, 0, 1_000_000, 0) : undefined,
    merge: mergeAll,
    page: mergeAll ? undefined : pageParam,
    require_images: requireImagesParam ? true : undefined,
    _fields: finalFieldsParam, // Include fields in cache key
  })
  const cacheClient = getCacheClient()
  const ttlSeconds = Math.max(1, Math.floor(DEFAULT_TTL_MS / 1000))
  const hit = !refresh ? ((await cacheClient.get(cacheKey)) as CacheEntry | undefined) : undefined
  if (hit) {
    const convertedHit = await wcArrayToProductTypes(hit.data)
    const body = JSON.stringify(convertedHit)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headersInit: Record<string, string> = {
      'x-cache': 'hit',
      'x-cache-store': cacheClient.store,
      'x-cache-namespace-version': String(nsVersion),
      'x-wc-total': String(hit.total ?? ''),
      'x-wc-total-pages': String(hit.totalPages ?? ''),
      'x-wc-batch-per_page': String(per_page),
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'CDN-Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=2400',
      ETag: etag,
    }
    if (!no304 && req.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers: new Headers(headersInit) })
    }
    return new Response(body, { status: 200, headers: new Headers(headersInit) })
  }

  try {
    console.log('WooCommerce API: Starting product fetch with params:', {
      per_page,
      startPage,
      search,
      orderby,
      order,
      categoryParam,
      onSaleParam,
      priceMinParam,
      priceMaxParam
    })
    
    const allProducts: any[] = []
    let page = startPage
    let totalPages: number | undefined
    let total: number | undefined
    let lastBatchLen = 0

    if (!mergeAll) {
      const params: Record<string, unknown> = { per_page, page: pageParam }
      if (search) params['search'] = search
      if (orderby) params['orderby'] = orderby
      if (order) params['order'] = order
      if (slugParam) params['slug'] = slugParam
      if (categoryId) {
        if (includeSubcategories) {
          try {
            const getSubcategories = async (parentId: number): Promise<number[]> => {
              try {
                const subCatRes = await wcApi.get('products/categories', { parent: parentId, per_page: 100 })
                const subCategories = Array.isArray(subCatRes.data) ? subCatRes.data : []
                const subIds: number[] = []
                for (const subcat of subCategories) {
                  if (typeof subcat?.id === 'number') {
                    subIds.push(subcat.id)
                    try {
                      const deeperSubs = await getSubcategories(subcat.id)
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
            const allCategoryIds = [categoryId, ...subIds]
            params['category'] = allCategoryIds.join(',')
            console.log(`Category ${categoryId} includes subcategories with IDs (single page): ${subIds.join(', ')}`)
          } catch {
            params['category'] = categoryId
          }
        } else {
          params['category'] = categoryId
        }
      }
      if (onSaleParam === 'true') params['on_sale'] = true
      if (priceMinParam) params['min_price'] = clampInt(priceMinParam, 0, 1_000_000, 0)
      if (priceMaxParam) params['max_price'] = clampInt(priceMaxParam, 0, 1_000_000, 0)
      // Use finalFieldsParam which already includes meta_data
      params['_fields'] = finalFieldsParam
      const res = await wcApi.get('products', params)
        console.log('WooCommerce API: Single page response', {
          dataLength: res.data?.length,
          headers: res.headers,
          hasData: !!res.data,
          isArray: Array.isArray(res.data),
          hasMetaData: res.data && Array.isArray(res.data) && res.data.length > 0 && !!res.data[0].meta_data,
          hasCategories: res.data && Array.isArray(res.data) && res.data.length > 0 && !!res.data[0].categories,
          fieldsRequested: params._fields
        })
        const batch = Array.isArray(res.data) ? res.data : []
        
        // Enhanced logging after fetching products
        console.log('[API DEBUG] Single page fetch completed:', {
          totalProducts: batch.length,
          requestedFields: params._fields,
          responseHeaders: res.headers,
          timestamp: new Date().toISOString()
        })
        
        if (batch.length > 0) {
          const firstProduct = batch[0]
          console.log('[API DEBUG] Raw WooCommerce product keys:', Object.keys(firstProduct))
          console.log('[API DEBUG] Raw product has categories:', 'categories' in firstProduct)
          console.log('[API DEBUG] Raw product has meta_data:', 'meta_data' in firstProduct)
          
          if (firstProduct.meta_data) {
            console.log('[API DEBUG] Sample meta_data field:', JSON.stringify(firstProduct.meta_data, null, 2))
            console.log('[API DEBUG] meta_data field type:', typeof firstProduct.meta_data)
            console.log('[API DEBUG] meta_data is array:', Array.isArray(firstProduct.meta_data))
          }
          
          if (firstProduct.categories) {
            console.log('[API DEBUG] Sample categories field:', JSON.stringify(firstProduct.categories, null, 2))
            console.log('[API DEBUG] categories field type:', typeof firstProduct.categories)
            console.log('[API DEBUG] categories is array:', Array.isArray(firstProduct.categories))
          }
          
          // Log sample of all fields to verify what we received
          console.log('[API DEBUG] Complete first product sample:', JSON.stringify(firstProduct, null, 2))
        }
        
      allProducts.push(...batch)
      const headers = res.headers || {}
      totalPages = headerNumber(headers, 'x-wp-totalpages') ?? headerNumber(headers, 'X-WP-TotalPages')
      total = headerNumber(headers, 'x-wp-total') ?? headerNumber(headers, 'X-WP-Total')
    } else {
      do {
        const params: Record<string, unknown> = { per_page, page }
        if (search) params['search'] = search
        if (orderby) params['orderby'] = orderby
        if (order) params['order'] = order
        if (slugParam) params['slug'] = slugParam
        if (categoryId) {
          // If we want to include subcategories, we need to get all subcategory IDs first
          if (includeSubcategories) {
            try {
              // Recursively get all subcategories
              const getSubcategories = async (parentId: number): Promise<number[]> => {
                try {
                  const subCatRes = await wcApi.get('products/categories', { parent: parentId, per_page: 100 })
                  const subCategories = Array.isArray(subCatRes.data) ? subCatRes.data : []
                  const subIds: number[] = []
                  
                  for (const subcat of subCategories) {
                    if (typeof subcat?.id === 'number') {
                      subIds.push(subcat.id)
                      // Recursively get subcategories of this subcategory
                      try {
                        const deeperSubs = await getSubcategories(subcat.id)
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
              const allCategoryIds = [categoryId, ...subIds]
              params['category'] = allCategoryIds.join(',')
              console.log(`Category ${categoryId} includes subcategories with IDs: ${subIds.join(', ')}`)
            } catch {
              // If we can't get subcategories, just use the main category
              params['category'] = categoryId
            }
          } else {
            params['category'] = categoryId
          }
        }
        // Forward WooCommerce-supported filters
        if (onSaleParam === 'true') params['on_sale'] = true
        if (priceMinParam) params['min_price'] = clampInt(priceMinParam, 0, 1_000_000, 0)
        if (priceMaxParam) params['max_price'] = clampInt(priceMaxParam, 0, 1_000_000, 0)
        // Use finalFieldsParam which already includes meta_data
        params['_fields'] = finalFieldsParam

        const res = await wcApi.get('products', params)
        console.log('WooCommerce API: Multi-page response', {
          page,
          dataLength: res.data?.length,
          headers: res.headers,
          hasData: !!res.data,
          isArray: Array.isArray(res.data),
          hasMetaData: res.data && Array.isArray(res.data) && res.data.length > 0 && !!res.data[0].meta_data,
          hasCategories: res.data && Array.isArray(res.data) && res.data.length > 0 && !!res.data[0].categories,
          fieldsRequested: params._fields
        })
        const pageBatch = Array.isArray(res.data) ? res.data : []
        
        // Enhanced logging after fetching products for each page
        console.log('[API DEBUG] Multi-page fetch completed for page:', {
          pageNumber: page,
          productsOnPage: pageBatch.length,
          totalProductsSoFar: allProducts.length + pageBatch.length,
          requestedFields: params._fields,
          responseHeaders: res.headers,
          timestamp: new Date().toISOString()
        })
        
        if (pageBatch.length > 0) {
          const firstProduct = pageBatch[0]
          console.log('[API DEBUG] Raw WooCommerce product keys (page ' + page + '):', Object.keys(firstProduct))
          console.log('[API DEBUG] Raw product has categories (page ' + page + '):', 'categories' in firstProduct)
          console.log('[API DEBUG] Raw product has meta_data (page ' + page + '):', 'meta_data' in firstProduct)
          
          if (firstProduct.meta_data) {
            console.log('[API DEBUG] Sample meta_data field (page ' + page + '):', JSON.stringify(firstProduct.meta_data, null, 2))
            console.log('[API DEBUG] meta_data field type (page ' + page + '):', typeof firstProduct.meta_data)
            console.log('[API DEBUG] meta_data is array (page ' + page + '):', Array.isArray(firstProduct.meta_data))
          }
          
          if (firstProduct.categories) {
            console.log('[API DEBUG] Sample categories field (page ' + page + '):', JSON.stringify(firstProduct.categories, null, 2))
            console.log('[API DEBUG] categories field type (page ' + page + '):', typeof firstProduct.categories)
            console.log('[API DEBUG] categories is array (page ' + page + '):', Array.isArray(firstProduct.categories))
          }
          
          // Log sample of all fields to verify what we received (only for first page to avoid spam)
          if (page === 1) {
            console.log('[API DEBUG] Complete first product sample (page ' + page + '):', JSON.stringify(firstProduct, null, 2))
          }
        }
        
        lastBatchLen = pageBatch.length
        allProducts.push(...pageBatch)

        const headers = res.headers || {}
        const tp = headerNumber(headers, 'x-wp-totalpages') ?? headerNumber(headers, 'X-WP-TotalPages')
        if (typeof tp === 'number' && tp > 0) totalPages = tp
        const tt = headerNumber(headers, 'x-wp-total') ?? headerNumber(headers, 'X-WP-Total')
        if (typeof tt === 'number' && tt > 0) total = tt

        page += 1
        // Continue while: if we have totalPages, use it; otherwise fallback to batch-length check
      } while (totalPages ? page <= totalPages : lastBatchLen === per_page)
    }

    // Convert WooCommerce products to our ProductType format with parent categories
    console.log(`[API LOG] Fetched a total of ${allProducts.length} products from WooCommerce.`);
    const convertedProducts = await wcArrayToProductTypes(allProducts);
    console.log(`[API LOG] Converted to ${convertedProducts.length} products.`);
    
    // Debug: Check if categories and meta_data are in the converted products
    if (convertedProducts.length > 0) {
      const firstProduct = convertedProducts[0]
      console.log('[API DEBUG] Converted product keys:', Object.keys(firstProduct))
      console.log('[API DEBUG] Converted product has categories:', 'categories' in firstProduct)
      console.log('[API DEBUG] Converted product has meta_data:', 'meta_data' in firstProduct)
      if ('categories' in firstProduct) {
        console.log('[API DEBUG] Converted categories:', firstProduct.categories)
      }
      if ('meta_data' in firstProduct) {
        console.log('[API DEBUG] Converted meta_data length:', firstProduct.meta_data?.length || 0)
      }
    }
    const envHostsRaw = [process.env.WOOCOMMERCE_URL, process.env.NEXT_PUBLIC_WOOCOMMERCE_URL].filter(Boolean) as string[]
    const envHosts = envHostsRaw.map((v) => {
      try { return new URL(v).hostname } catch { return null }
    }).filter(Boolean) as string[]
    const extraDomains = (process.env.IMAGE_ALLOWED_DOMAINS || '').split(',').map(s => s.trim()).filter(Boolean)
    const allowedDomains = Array.from(new Set(['pixypic.net', 'image.nv315.top', 'localhost', '127.0.0.1', ...envHosts, ...extraDomains]))
    const byAllowedDomain = (url: string | undefined) => {
      if (!url || typeof url !== 'string') return false
      try {
        const u = new URL(url)
        return allowedDomains.some(d => u.hostname.endsWith(d))
      } catch { return false }
    }
    const sanitizedProducts = convertedProducts.map((p: any) => {
      const imgs = Array.isArray(p.images) ? p.images.filter((u: string) => byAllowedDomain(u)) : []
      const thumbs = Array.isArray((p as any).thumbImage) ? (p as any).thumbImage.filter((u: string) => byAllowedDomain(u)) : []
      const next = { ...p, images: imgs, thumbImage: thumbs }
      return next
    })
    const filteredProducts = requireImagesParam
      ? sanitizedProducts.filter((p: any) => Array.isArray(p.images) && p.images.length > 0)
      : sanitizedProducts
    
    console.log(`[API LOG] Filtered down to ${filteredProducts.length} products before sending response.`);

    // Diagnostics: count empty images
    const emptyImageCount = filteredProducts.filter(p => !Array.isArray((p as any).images) || (p as any).images.length === 0).length
    const isEmptySuccess = filteredProducts.length === 0 || emptyImageCount === filteredProducts.length

    // Save to cache (only non-failure). Empty success uses shorter TTL
    if (allProducts.length > 0) {
      const entry: CacheEntry = { data: allProducts, total, totalPages }
      const preferLongTTL = (!mergeAll && pageParam === 1 && requireImagesParam)
      const ttl = isEmptySuccess ? Math.max(1, Math.floor(30)) : (preferLongTTL ? 600 : ttlSeconds)
      console.log('WC Cache write', { cacheKey, page: pageParam, total: total ?? convertedProducts.length, emptyImageCount, ttlSeconds: ttl })
      await cacheClient.set(cacheKey, entry, ttl)
    }

    // Defensive check: if no products left after processing, return 204 No Content
    if (filteredProducts.length === 0) {
      console.warn('[API WARN] No products left after processing. Returning 204 No Content.');
      // Return 204 No Content status code, this is the standard way to indicate successful request processing but no content to return
      return new Response(null, { status: 204 });
    }

    const body = JSON.stringify(filteredProducts)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headersInit: Record<string, string> = {
      'x-cache': 'miss',
      'x-cache-store': cacheClient.store,
      'x-cache-namespace-version': String(nsVersion),
      'x-wc-total': String(total ?? ''),
      'x-wc-total-pages': String(totalPages ?? ''),
      'x-wc-batch-per_page': String(per_page),
      'x-wc-empty-images': String(emptyImageCount),
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'CDN-Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=2400',
      ETag: etag,
    }
    if (!no304 && req.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers: new Headers(headersInit) })
    }
    return new Response(body, { status: 200, headers: new Headers(headersInit) })
  } catch (err: any) {
    console.error('WooCommerce API: Error fetching products', {
      error: err,
      message: err?.message,
      response: err?.response,
      status: err?.response?.status,
      data: err?.response?.data,
      stack: err?.stack
    })
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load products', details)
  }
}
