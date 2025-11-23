import { useQuery } from '@tanstack/react-query'
import { timedFetch } from '@/utils/timedFetch'

type ResponseMeta = { count?: number; hasMore?: boolean; isStale?: boolean }
type Product = any

async function fetchProducts(category: string, parentCategory: string, limit: number, tag?: string) {
  let categoryToUse = category
  if (categoryToUse === 'art-toy') categoryToUse = 'art-toys'
  const params = new URLSearchParams()
  params.set('category', categoryToUse)
  params.set('per_page', String(limit))
  if (tag) params.set('tag', tag)
  const res = await timedFetch(`/api/woocommerce/products/by-category-and-tag?${params.toString()}`)
  if (!res.ok) throw new Error('Failed')
  const data = await res.json()
  return data as { data: Product[]; meta?: ResponseMeta }
}

export function useProductList(category: string, parentCategory: string, limit: number, tag?: string) {
  return useQuery({
    queryKey: ['products', category, tag, limit],
    queryFn: () => fetchProducts(category, parentCategory, limit, tag),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    retry: 2,
  })
}