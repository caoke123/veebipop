import { fetchCategories } from '@/lib/data/categories'
import { error } from '@/utils/apiResponse'
import crypto from 'crypto'

// Use Node.js runtime to fix compatibility with Node.js modules
export const runtime = 'nodejs'

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
    const { searchParams } = new URL(request.url)
    const per_page = clampInt(searchParams.get('per_page'), 1, 100, 100)
    const hide_empty = toBoolean(searchParams.get('hide_empty'))
    const parent = searchParams.get('parent') ? parseInt(searchParams.get('parent')!, 10) : undefined
    const fieldsParam = searchParams.get('_fields') || undefined

    const categories = await fetchCategories({
      per_page,
      hide_empty,
      parent,
      _fields: fieldsParam
    })

    const body = JSON.stringify(categories)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
      ETag: etag,
    })
    
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
    
    return new Response(body, { status: 200, headers })
  } catch (err: any) {
    return error(500, 'Failed to load categories', { message: err.message })
  }
}