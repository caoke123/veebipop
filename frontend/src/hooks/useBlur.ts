"use client"
import { useQuery } from '@tanstack/react-query'

async function fetchBlur(url: string) {
  try {
    const res = await fetch(`/api/image/blur?url=${encodeURIComponent(url)}`)
    if (!res.ok) {
      console.warn(`Blur generation failed for ${url}, falling back to no blur`)
      return ''
    }
    const data = await res.json()
    return String(data.blurDataURL || '')
  } catch (error) {
    console.warn(`Blur generation error for ${url}, falling back to no blur:`, error)
    return ''
  }
}

export function useBlur(url?: string) {
  const src = String(url || '')
  const isHttp = /^https?:\/\//.test(src)
  const isPlaceholder = src.includes('/images/product/1000x1000.png')
  return useQuery({
    queryKey: ['blur', src],
    queryFn: () => fetchBlur(src),
    enabled: !!src && isHttp && !isPlaceholder,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1, // Allow one retry for blur generation
    refetchOnWindowFocus: false,
  })
}