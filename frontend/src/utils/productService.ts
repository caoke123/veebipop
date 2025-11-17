import { wcToProductType, WcProduct } from '@/utils/wcAdapter'
import { ProductType } from '@/type/ProductType'

// Fetch a single product by ID.
// Primary source: WooCommerce proxy API
// Fallback: local Product.json served by Next API route
export async function fetchProductById(id: string | number): Promise<ProductType | null> {
  const pid = String(id)
  try {
    const res = await fetch(`/api/woocommerce/products/${encodeURIComponent(pid)}`, { cache: 'no-store' })
    if (res.ok) {
      // Handle 204 No Content response
      if (res.status === 204) {
        console.log('fetchProductById: API returned 204 No Content for product ID:', pid);
        return null;
      }
      const data = await res.json()
      // API already returns converted ProductType data
      return data as ProductType
    }
  } catch {
    // ignore and try fallback
  }

  // Fallback to local Product.json
  try {
    const res = await fetch('/Product.json')
    if (res.ok) {
      const arr = await res.json()
      const list: ProductType[] = Array.isArray(arr) ? arr : []
      const found = list.find(p => String(p.id) === pid) || null
      return found
    }
  } catch {
    // ignore
  }

  return null
}

// Fetch a single product by slug.
// Primary source: WooCommerce proxy list endpoint filtered by slug
// Fallback: local Product.json by matching slug
export async function fetchProductBySlug(slug: string): Promise<ProductType | null> {
  const s = String(slug).trim()
  if (!s) return null
  try {
    const res = await fetch(`/api/woocommerce/products?slug=${encodeURIComponent(s)}&per_page=1`, { cache: 'no-store' })
    if (res.ok) {
      // Handle 204 No Content response
      if (res.status === 204) {
        console.log('fetchProductBySlug: API returned 204 No Content for slug:', s);
        return null;
      }
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      if (list.length > 0) {
        const p = list[0] as WcProduct
        return wcToProductType(p)
      }
    }
  } catch {
    // ignore and try fallback
  }

  // Fallback to local Product.json
  try {
    const res = await fetch('/Product.json')
    if (res.ok) {
      const arr = await res.json()
      const list: ProductType[] = Array.isArray(arr) ? arr : []
      const found = list.find(p => String(p.slug) === s) || null
      return found
    }
  } catch {
    // ignore
  }

  return null
}