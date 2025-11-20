/**
 * 图片优化工具
 * 提供图片预加载、格式转换和性能优化功能
 */

// 图片格式检测
export function getImageFormat(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase()
  if (extension) {
    return extension
  }
  
  // 从URL路径检测格式
  if (url.includes('.webp')) return 'webp'
  if (url.includes('.avif')) return 'avif'
  if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpeg'
  if (url.includes('.png')) return 'png'
  if (url.includes('.gif')) return 'gif'
  if (url.includes('.svg')) return 'svg'
  
  return 'unknown'
}

// 检查是否为优化过的图片
export function isOptimizedImage(url: string): boolean {
  return url.includes('-optimized.') || 
         url.includes('.webp') || 
         url.includes('.avif') ||
         url.includes('_thumb') ||
         url.includes('_small') ||
         url.includes('_medium') ||
         url.includes('_large')
}

// 生成优化后的图片URL
export function getOptimizedImageUrl(originalUrl: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
} = {}): string {
  const { width, height, quality = 80, format = 'webp' } = options
  
  try {
    const url = new URL(originalUrl)
    
    // 如果已经是优化过的格式，直接返回
    if (url.searchParams.has('w') || url.searchParams.has('h')) {
      return originalUrl
    }
    
    // 添加优化参数
    if (width) url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    url.searchParams.set('q', quality.toString())
    url.searchParams.set('fm', format)
    
    return url.toString()
  } catch {
    // 如果URL解析失败，返回原始URL
    return originalUrl
  }
}

// 图片预加载管理器
class ImagePreloader {
  private preloadedImages = new Set<string>()
  private preloadQueue: string[] = []
  private isProcessing = false
  
  // 预加载单个图片
  preloadImage(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(url)) {
        resolve()
        return
      }
      
      const img = new Image()
      
      img.onload = () => {
        this.preloadedImages.add(url)
        resolve()
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`))
      }
      
      // 设置优先级
      if (priority === 'high') {
        img.fetchPriority = 'high'
      } else {
        img.fetchPriority = 'low'
      }
      
      img.src = url
    })
  }
  
  // 批量预加载图片
  async preloadBatch(urls: string[], concurrency: number = 3): Promise<void> {
    const chunks = []
    for (let i = 0; i < urls.length; i += concurrency) {
      chunks.push(urls.slice(i, i + concurrency))
    }
    
    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url => this.preloadImage(url).catch(() => {}))
      )
    }
  }
  
  // 智能预加载：根据视口位置预加载
  smartPreload(urls: string[], viewportImages: string[] = []): void {
    // 高优先级：视口内的图片
    const highPriority = viewportImages.filter(url => urls.includes(url))
    
    // 低优先级：视口外的图片
    const lowPriority = urls.filter(url => !viewportImages.includes(url))
    
    // 立即预加载高优先级图片
    highPriority.forEach(url => {
      this.preloadImage(url, 'high').catch(() => {})
    })
    
    // 延迟预加载低优先级图片
    if (lowPriority.length > 0) {
      requestIdleCallback(() => {
        this.preloadBatch(lowPriority, 2).catch(() => {})
      })
    }
  }
  
  // 清理预加载缓存
  clearCache(): void {
    this.preloadedImages.clear()
    this.preloadQueue = []
  }
  
  // 获取预加载状态
  getPreloadStatus(): { total: number; preloaded: number; percentage: number } {
    const total = this.preloadedImages.size + this.preloadQueue.length
    const preloaded = this.preloadedImages.size
    const percentage = total > 0 ? (preloaded / total) * 100 : 0
    
    return { total, preloaded, percentage }
  }
}

// 全局图片预加载器实例
export const imagePreloader = new ImagePreloader()

// 响应式图片尺寸生成
export function generateResponsiveSizes(
  baseUrl: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536]
): { srcSet: string; sizes: string } {
  const srcSet = breakpoints
    .map(width => `${getOptimizedImageUrl(baseUrl, { width })} ${width}w`)
    .join(', ')
  
  const sizes = breakpoints
    .map((width, index) => {
      if (index === 0) return `(max-width: ${width}px) ${width}px`
      if (index === breakpoints.length - 1) return `${width}px`
      return `(max-width: ${width}px) ${width}px`
    })
    .join(', ')
  
  return { srcSet, sizes }
}

// 图片质量评估
export function assessImageQuality(url: string): {
  format: string
  isOptimized: boolean
  recommendations: string[]
} {
  const format = getImageFormat(url)
  const isOptimized = isOptimizedImage(url)
  const recommendations: string[] = []
  
  // 格式建议
  if (format === 'jpeg' || format === 'png') {
    recommendations.push('考虑转换为 WebP 格式以减少文件大小')
  }
  
  if (format === 'png' && !url.includes('logo') && !url.includes('icon')) {
    recommendations.push('对于照片类图片，JPEG 格式通常更合适')
  }
  
  // 优化建议
  if (!isOptimized) {
    recommendations.push('使用优化后的图片版本')
  }
  
  // 尺寸建议
  if (!url.includes('w=') && !url.includes('h=')) {
    recommendations.push('添加响应式尺寸参数')
  }
  
  return {
    format,
    isOptimized,
    recommendations
  }
}

// 图片懒加载配置
export const lazyLoadConfig = {
  rootMargin: '50px', // 提前50px开始加载
  threshold: 0.1, // 10%可见时开始加载
  loading: 'lazy' as const,
}

// 关键图片预加载策略
export function preloadCriticalImages(): void {
  const criticalImages = [
    // 首页轮播图
    'https://image.nv315.top/art%20toys4-optimized.webp',
    'https://image.nv315.top/images/slide-3-optimized.webp',
    'https://image.nv315.top/images/s11-3-optimized.webp',
    // Logo和品牌图片
    '/images/favicon.ico',
  ]
  
  // 在页面加载完成后立即预加载
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      imagePreloader.preloadBatch(criticalImages, 2).catch(() => {})
    })
  }
}

// 图片性能监控
export class ImagePerformanceMonitor {
  private metrics = new Map<string, {
    loadTime: number
    size: number
    format: string
    timestamp: number
  }>()
  
  recordImageLoad(url: string, loadTime: number, size: number): void {
    this.metrics.set(url, {
      loadTime,
      size,
      format: getImageFormat(url),
      timestamp: Date.now()
    })
  }
  
  getMetrics(): Array<{
    url: string
    loadTime: number
    size: number
    format: string
    timestamp: number
  }> {
    return Array.from(this.metrics.entries()).map(([url, metrics]) => ({
      url,
      ...metrics
    }))
  }
  
  getAverageLoadTime(): number {
    const metrics = this.getMetrics()
    if (metrics.length === 0) return 0
    
    const total = metrics.reduce((sum, m) => sum + m.loadTime, 0)
    return total / metrics.length
  }
  
  getSlowImages(threshold: number = 1000): Array<{
    url: string
    loadTime: number
    size: number
    format: string
  }> {
    return this.getMetrics()
      .filter(m => m.loadTime > threshold)
      .map(({ url, loadTime, size, format }) => ({
        url,
        loadTime,
        size,
        format
      }))
  }
  
  clear(): void {
    this.metrics.clear()
  }
}

// 全局图片性能监控器
export const imagePerformanceMonitor = new ImagePerformanceMonitor()