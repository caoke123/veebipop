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

export function useProductDetail(slug: string, initial?: ProductType | null) {
  return useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => fetchProductDetail(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    // Use initial data directly if provided (should be in ProductType format from server)
    initialData: initial,
  })
}

// Hook for fetching related products
export function useRelatedProducts(category: string, excludeId?: number, enabled?: boolean) {
  return useQuery({
    queryKey: ['related-products', category, excludeId],
    queryFn: () => fetchRelatedProducts(category, excludeId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!category && enabled !== false, // Only run if category is provided and not explicitly disabled
    initialData: [], // Provide empty array as default
  })
}