// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { json, error } from '@/utils/apiResponse'
import { bumpNamespaceVersion, getCacheClient } from '@/utils/cache'

function getHeader(req: Request, name: string): string | null {
  const v = req.headers.get(name) || req.headers.get(name.toLowerCase())
  return v ?? null
}

function isProductRelated(topic: string | null): boolean {
  if (!topic) return false
  const t = topic.toLowerCase()
  return (
    t.startsWith('product.') ||
    t.startsWith('product_category.') ||
    t.startsWith('product_attribute.') ||
    t.startsWith('product_tag.')
  )
}

export async function POST(req: Request) {
  const topic = getHeader(req, 'X-WC-Webhook-Topic')
  const signature = getHeader(req, 'X-WC-Webhook-Signature')
  const secret = process.env.WC_WEBHOOK_SECRET

  let raw = ''
  try {
    raw = await req.text()
  } catch {
    raw = ''
  }

  // Optional signature verification if secret is configured
  if (secret && signature) {
    try {
      const { createHmac } = await import('crypto')
      const calc = createHmac('sha256', secret).update(raw).digest('base64')
      if (calc !== signature) {
        return error(401, 'Invalid webhook signature')
      }
    } catch {
      // If crypto fails for some reason, treat as failure when secret is set
      return error(500, 'Webhook verification failed')
    }
  }

  // Parse body for potential future use
  let body: any = undefined
  try {
    body = raw ? JSON.parse(raw) : undefined
  } catch {
    body = undefined
  }

  let bumpedVersion: number | undefined
  if (isProductRelated(topic)) {
    bumpedVersion = await bumpNamespaceVersion('products')
  }

  const cacheClient = getCacheClient()
  return json({ ok: true, topic, bumpedVersion, received: !!body }, {
    headers: {
      'x-cache-store': cacheClient.store,
      'x-webhook-topic': String(topic ?? ''),
    },
  })
}