import { useQuery } from '@tanstack/react-query'
import { wcToProductType } from '@/utils/wcAdapter'
import { ProductType } from '@/type/ProductType'

type WooCommerceProduct = any

async function fetchProductDetail(slug: string) {
  const params = new URLSearchParams()
  params.set('slug', slug)
  params.set('per_page', '1')
  params.set(
    '_fields',
    'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
  )
  const res = await fetch(`/api/woocommerce/products?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load product')
  const list = await res.json()
  const first = Array.isArray(list) && list.length > 0 ? list[0] : null
  if (!first) throw new Error('Product not found')
  
  // Convert WooCommerce product to ProductType format
  return await wcToProductType(first)
}

// New function to fetch related products by category
async function fetchRelatedProducts(category: string, excludeId?: number, limit: number = 8) {
  const params = new URLSearchParams()
  params.set('category', category)
  params.set('per_page', String(limit + 1)) // Get one extra to account for exclusion
  params.set(
    '_fields',
    'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,images.src,short_description,description,categories,attributes,tags,date_created,meta_data'
  )
  const res = await fetch(`/api/woocommerce/products?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load related products')
  const list = await res.json()
  
  // Filter out the current product and convert to ProductType format
  const filteredList = Array.isArray(list)
    ? list.filter((product: WooCommerceProduct) => product.id !== excludeId).slice(0, limit)
    : []
    
  // Convert each product to ProductType format
  const convertedProducts = await Promise.all(
    filteredList.map((product: WooCommerceProduct) => wcToProductType(product))
  )
    
  return convertedProducts
}

// Function to fetch related products using WooCommerce related_ids
async function fetchRelatedProductsById(productId: number, limit: number = 8) {
  try {
    // First, get the product with related_ids
    const productRes = await fetch(
      `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products/${productId}?_fields=id,name,short_description,price,images,related_ids`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64'),
        },
        next: { revalidate: 1800 }, // 30分钟缓存
      }
    )
    
    if (!productRes.ok) {
      console.log('Failed to fetch product for related_ids, falling back to category-based products')
      return []
    }
    
    const product = await productRes.json()
    console.log('相关产品IDs:', product.related_ids)
    
    if (!product.related_ids || product.related_ids.length === 0) {
      console.log('No related_ids found, returning empty array for fallback')
      return []
    }
    
    // Fetch the related products using the IDs
    const relatedRes = await fetch(
      `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?include=${product.related_ids.join(',')}&per_page=${limit}`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64'),
        },
        next: { revalidate: 1800 },
      }
    )
    
    if (!relatedRes.ok) {
      console.log('Failed to fetch related products, returning empty array')
      return []
    }
    
    const relatedProducts = await relatedRes.json()
    console.log('实际获取到相关产品:', relatedProducts.length)
    
    // Convert each product to ProductType format
    const convertedProducts = await Promise.all(
      (Array.isArray(relatedProducts) ? relatedProducts : []).map((product: WooCommerceProduct) => wcToProductType(product))
    )
    
    return convertedProducts
  } catch (error) {
    console.error('Error fetching related products by ID:', error)
    return []
  }
}

// Function to fetch fallback products from same category
async function fetchFallbackProducts(category: string, excludeId?: number, limit: number = 8) {
  try {
    const params = new URLSearchParams()
    params.set('category', category)
    params.set('per_page', String(limit))
    params.set(
      '_fields',
      'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data'
    )
    
    const res = await fetch(`/api/woocommerce/products?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to load fallback products')
    const list = await res.json()
    
    // Filter out the current product and limit results
    const filteredList = Array.isArray(list)
      ? list.filter((product: WooCommerceProduct) => product.id !== excludeId).slice(0, limit)
      : []
      
    console.log(`获取到 ${filteredList.length} 个同类目兜底产品`)
    
    // Convert each product to ProductType format
    const convertedProducts = await Promise.all(
      filteredList.map((product: WooCommerceProduct) => wcToProductType(product))
    )
      
    return convertedProducts
  } catch (error) {
    console.error('Error fetching fallback products:', error)
    return []
  }
}

export function useProductDetail(slug: string, initial?: ProductType | null) {
  return useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => fetchProductDetail(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    retry: 2,
    // Use initial data directly if provided (should be in ProductType format from server)
    initialData: initial,
  })
}

// Hook for fetching related products - DEPRECATED
// Use the new product-detail API instead which fetches related products in parallel
export function useRelatedProducts(category: string, excludeId?: number, enabled?: boolean) {
  console.warn('useRelatedProducts Hook is deprecated. Use the new product-detail API instead.')
  
  return useQuery({
    queryKey: ['related-products', category, excludeId],
    queryFn: async () => {
      // Return empty array since this hook is deprecated
      // Related products should now be fetched via the product-detail API
      return []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: false, // Disable this hook by default
    initialData: [], // Provide empty array as default
  })
}