import { NextRequest } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import crypto from 'crypto'

export async function GET(_req: NextRequest) {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
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
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
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

    const body = JSON.stringify(brands)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'CDN-Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=2400',
      ETag: etag,
    })
    return new Response(body, { status: 200, headers })
  } catch (err) {
    console.error('brands route error', err)
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
}