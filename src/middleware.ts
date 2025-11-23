import { NextRequest, NextResponse } from 'next/server'

// Redirect legacy product detail URLs to new slug-based URLs
export async function middleware(req: NextRequest) {
  const { pathname, searchParams, origin } = req.nextUrl

  // Only handle the old product detail route
  if (pathname === '/product/thumbnail-bottom') {
    const id = searchParams.get('id')
    if (id) {
      let slug: string | null = null

      // 1) Try WooCommerce proxy by ID
      try {
        const res = await fetch(`${origin}/api/woocommerce/products/${encodeURIComponent(id)}`, {
          headers: { accept: 'application/json' },
          cache: 'no-store',
        })
        if (res.ok) {
          const p = await res.json()
          const s = String(p?.slug || '').trim()
          if (s) slug = s
        }
      } catch {}

      // No fallback - only use WooCommerce API

      // If we resolved a slug, redirect permanently to the new path
      if (slug) {
        const url = new URL(`/product/${slug}`, origin)
        // Preserve other search params except legacy id
        req.nextUrl.searchParams.forEach((value, key) => {
          if (key !== 'id') url.searchParams.append(key, value)
        })
        return NextResponse.redirect(url, 308)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/product/thumbnail-bottom', '/product/thumbnail-bottom/'],
}