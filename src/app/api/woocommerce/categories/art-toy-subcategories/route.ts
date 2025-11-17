import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'

export async function GET(request: Request) {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce environment variables are not configured')
    }

    // First, get the Art Toys category to find its ID
    const artToysRes = await wcApi.get('products/categories', { slug: 'art-toys' })
    
    if (!artToysRes.data || artToysRes.data.length === 0) {
      return error(404, 'Art Toys category not found')
    }

    const artToysCategory = artToysRes.data[0]
    const artToysId = artToysCategory.id

    // Get subcategories of Art Toys
    const subcategoriesRes = await wcApi.get('products/categories', { 
      parent: artToysId,
      hide_empty: false
    })

    // Process subcategories to fix encoding issues
    const processedSubcategories = subcategoriesRes.data.map((subcat: any) => {
      // Fix encoding for Chinese characters
      if (subcat.name && subcat.name.includes('澶ф紓浜?')) {
        subcat.name = '大漂亮'
      }
      return subcat
    })

    return json({
      parent: artToysCategory,
      subcategories: processedSubcategories
    })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load Art Toys subcategories', details)
  }
}