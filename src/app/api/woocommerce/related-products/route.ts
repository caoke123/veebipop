import { NextResponse } from 'next/server'
import { fetchCombinedRelatedProducts } from '@/lib/data/productData'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const relatedIdsParam = searchParams.get('related_ids')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const mainProductId = parseInt(id, 10)
    const relatedIds = relatedIdsParam 
      ? relatedIdsParam.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : []

    const products = await fetchCombinedRelatedProducts(
      mainProductId,
      category || undefined,
      relatedIds
    )

    // Set cache control headers for client-side caching
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    }

    return NextResponse.json(products, { headers })
  } catch (error) {
    console.error('Error in related-products API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    )
  }
}
