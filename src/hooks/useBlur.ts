"use client"
import { useQuery } from '@tanstack/react-query'

// 内存缓存，避免重复请求
const blurCache = new Map<string, string>()
const CACHE_SIZE_LIMIT = 100

// 清理最旧的缓存项
function cleanCache() {
  if (blurCache.size > CACHE_SIZE_LIMIT) {
    const firstKey = blurCache.keys().next().value
    if (firstKey) {
      blurCache.delete(firstKey)
    }
  }
}

async function fetchBlur(url: string): Promise<string> {
  // 检查内存缓存
  if (blurCache.has(url)) {
    return blurCache.get(url)!
  }

  try {
    const res = await fetch(`/api/image/blur?url=${encodeURIComponent(url)}`, {
      cache: 'force-cache', // 强制使用浏览器缓存
      next: { revalidate: 86400 }, // 24小时缓存
    })
    
    if (!res.ok) {
      console.warn(`Blur generation failed for ${url}, falling back to no blur`)
      return ''
    }
    
    const data = await res.json()
    const blurDataURL = String(data.blurDataURL || '')
    
    // 缓存结果
    cleanCache()
    blurCache.set(url, blurDataURL)
    
    return blurDataURL
  } catch (error) {
    console.warn(`Blur generation error for ${url}, falling back to no blur:`, error)
    return ''
  }
}

export function useBlur(url?: string) {
  const src = String(url || '')
  const isHttp = /^https?:\/\//.test(src)
  const isPlaceholder = src.includes('/images/product/1000x1000.png')
  const isOptimized = src.includes('-optimized.webp') // 优化的WebP图片不需要模糊
  
  return useQuery({
    queryKey: ['blur', src],
    queryFn: () => fetchBlur(src),
    enabled: !!src && isHttp && !isPlaceholder && !isOptimized,
    staleTime: 24 * 60 * 60 * 1000, // 24小时
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7天
    retry: 0, // 不重试，避免延迟
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 优化：使用预取数据
    initialData: () => blurCache.get(src),
  })
}

// 预加载模糊数据
export function preloadBlur(url: string) {
  const isHttp = /^https?:\/\//.test(url)
  const isPlaceholder = url.includes('/images/product/1000x1000.png')
  const isOptimized = url.includes('-optimized.webp')
  
  if (isHttp && !isPlaceholder && !isOptimized) {
    fetchBlur(url)
  }
}

// 批量预加载
export function preloadBlurBatch(urls: string[]) {
  urls.forEach(url => preloadBlur(url))
}