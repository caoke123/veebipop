import { getWcApi } from '@/utils/woocommerce'
import { json, error } from '@/utils/apiResponse'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const wcApi = getWcApi()
    
    if (!wcApi) {
      return error(500, 'WooCommerce environment variables are not configured')
    }

    // First, get the category by slug to find its ID
    const categoryRes = await wcApi.get('products/categories', { slug })
    
    if (!categoryRes.data || categoryRes.data.length === 0) {
      return error(404, `Category '${slug}' not found`)
    }

    const category = categoryRes.data[0]
    const categoryId = category.id

    // Get subcategories of the specified category
    const subcategoriesRes = await wcApi.get('products/categories', { 
      parent: categoryId,
      hide_empty: false
    })

    // Process subcategories to fix encoding issues
    const processedSubcategories = subcategoriesRes.data.map((subcat: any) => {
      // Fix encoding for Chinese characters if needed
      if (subcat.name && subcat.name.includes('澶ф紓浜?')) {
        subcat.name = '大漂亮'
      }
      return subcat
    })

    return json({
      parent: category,
      subcategories: processedSubcategories
    })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, `Failed to load subcategories for category '${params.slug}'`, details)
  }
}