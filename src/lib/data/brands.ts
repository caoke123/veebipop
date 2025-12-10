import { getWcApi } from '@/utils/woocommerce'

export interface Brand {
  id: number
  name: string
  slug: string
  count?: number
  image?: {
    src: string
  } | null
}

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return []
    }

    // Find the Brand attribute (common naming: "Brand", slug may be "pa_brand")
    const attrsRes = await wcApi.get('products/attributes')
    const attrs = Array.isArray(attrsRes.data) ? attrsRes.data : []
    const brandAttr = attrs.find((a: any) => {
      const name = String(a?.name || '').toLowerCase()
      const slug = String(a?.slug || '').toLowerCase()
      return name.includes('brand') || slug === 'pa_brand' || slug === 'brand'
    })

    if (!brandAttr || typeof brandAttr?.id !== 'number') {
      return []
    }

    // Fetch terms for brand attribute
    const termsRes = await wcApi.get(`products/attributes/${brandAttr.id}/terms`, { per_page: 100 })
    const terms = Array.isArray(termsRes.data) ? termsRes.data : []
    const brands = terms.map((t: any) => ({
      id: t?.id,
      name: String(t?.name || ''),
      slug: String(t?.slug || ''),
      count: typeof t?.count === 'number' ? t.count : undefined,
      image: t?.image || null,
    }))

    return brands
  } catch (err: any) {
    console.error('Failed to fetch brands:', err)
    
    // 如果是 401 错误，说明认证失败，记录详细信息
    if (err.response?.status === 401) {
      console.error('WooCommerce API 认证失败 - 检查环境变量:', {
        url: process.env.WOOCOMMERCE_URL,
        hasConsumerKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
        hasConsumerSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
        errorDetails: err.response?.data
      })
    }
    
    return []
  }
}
