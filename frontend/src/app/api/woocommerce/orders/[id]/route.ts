import { NextRequest } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import { json, error, badRequest, notFound } from '@/utils/apiResponse'
import crypto from 'crypto'

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context?.params?.id
  if (!id) return notFound('order id is required')
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce API client not configured properly')
    }
    const { searchParams } = new URL(request.url)
    const fields = searchParams.get('_fields') ?? undefined
    const res = await wcApi.get(`orders/${encodeURIComponent(id)}`, fields ? { _fields: fields } : undefined)
    const body = JSON.stringify(res.data)
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"'
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=120, stale-while-revalidate=600',
      ETag: etag,
    })
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
    return new Response(body, { status: 200, headers })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load order', details)
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const id = context?.params?.id
  if (!id) return notFound('order id is required')
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce API client not configured properly')
    }
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid JSON body')
    }
    const res = await wcApi.put(`orders/${encodeURIComponent(id)}`, body)
    return json({ success: true, order: res.data })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to update order', details)
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
