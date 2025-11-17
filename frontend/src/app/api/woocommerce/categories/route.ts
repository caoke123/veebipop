import { getWcApi } from '@/utils/woocommerce'
import { error } from '@/utils/apiResponse'
import crypto from 'crypto'

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const n = value ? parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function toBoolean(value: string | null): boolean | undefined {
  const v = (value ?? '').toLowerCase()
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

export async function GET(request: Request) {
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce environment variables are not configured')
    }
    const { searchParams } = new URL(request.url)
    const per_page = clampInt(searchParams.get('per_page'), 1, 100, 100)
    const hide_empty = toBoolean(searchParams.get('hide_empty'))
    const parent = searchParams.get('parent')
    const fieldsParam = searchParams.get('_fields')

    const params: Record<string, unknown> = { per_page }
    if (typeof hide_empty === 'boolean') params['hide_empty'] = hide_empty
    if (parent) params['parent'] = parent
    if (fieldsParam) params['_fields'] = fieldsParam

    const res = await wcApi.get('products/categories', params)
    const body = JSON.stringify(res.data)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'CDN-Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=2400',
      ETag: etag,
    })
    if (request.headers && new URL(request.url) && request.headers instanceof Headers) {
      // no-op
    }
    if (request.headers?.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
    return new Response(body, { status: 200, headers })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load categories', details)
  }
}