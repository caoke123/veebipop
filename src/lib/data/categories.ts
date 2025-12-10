import { getWcApi } from '@/utils/woocommerce'

export interface Category {
  id: number
  name: string
  slug: string
  parent: number
  count: number
  image?: {
    src: string
  } | null
}

export async function fetchCategories(params: {
  per_page?: number
  hide_empty?: boolean
  parent?: number
  _fields?: string
} = {}): Promise<Category[]> {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      console.log('WooCommerce API not available, using fallback categories')
      return [
        { id: 1, name: 'Art Toys', slug: 'art-toys', parent: 0, count: 10 },
        { id: 2, name: 'Charms', slug: 'charms', parent: 0, count: 8 },
        { id: 3, name: 'In-Car Accessories', slug: 'in-car-accessories', parent: 0, count: 6 },
        { id: 4, name: 'General', slug: 'general', parent: 0, count: 15 },
        { id: 5, name: 'Toys', slug: 'toy', parent: 0, count: 12 },
        { id: 6, name: 'Bags', slug: 'bag', parent: 0, count: 7 }
      ]
    }

    const apiParams: Record<string, unknown> = { 
      per_page: params.per_page || 100 
    }
    
    if (typeof params.hide_empty === 'boolean') {
      apiParams['hide_empty'] = params.hide_empty
    }
    
    if (params.parent !== undefined) {
      apiParams['parent'] = params.parent
    }
    
    if (params._fields) {
      apiParams['_fields'] = params._fields
    }

    const res = await wcApi.get('products/categories', apiParams)
    return Array.isArray(res.data) ? res.data : []
  } catch (err: any) {
    console.error('Failed to load categories:', err.message)
    return []
  }
}
