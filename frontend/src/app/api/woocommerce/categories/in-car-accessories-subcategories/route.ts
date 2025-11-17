import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'

export async function GET(request: Request) {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce environment variables are not configured')
    }

    // First, get the In-Car Accessories category to find its ID
    const inCarAccessoriesRes = await wcApi.get('products/categories', { slug: 'in-car-accessories' })
    
    if (!inCarAccessoriesRes.data || inCarAccessoriesRes.data.length === 0) {
      return error(404, 'In-Car Accessories category not found')
    }

    const inCarAccessoriesCategory = inCarAccessoriesRes.data[0]
    const inCarAccessoriesId = inCarAccessoriesCategory.id

    // Get subcategories of In-Car Accessories
    const subcategoriesRes = await wcApi.get('products/categories', { 
      parent: inCarAccessoriesId,
      hide_empty: false
    })

    return json({
      parent: inCarAccessoriesCategory,
      subcategories: subcategoriesRes.data
    })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load In-Car Accessories subcategories', details)
  }
}