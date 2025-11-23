/**
 * CDN优化工具
 * 提供CDN配置、资源优化和性能监控
 */

// CDN配置接口
export interface CDNConfig {
  baseUrl: string
  zones: string[]
  cacheTTL: number
  compressionEnabled: boolean
  imageOptimization: boolean
  security: {
    httpsOnly: boolean
    tokenAuth?: string
  }
}

// CDN资源类型
export type CDNResourceType = 
  | 'image'
  | 'script'
  | 'style'
  | 'font'
  | 'video'
  | 'document'

// CDN优化选项
export interface CDNOptimizationOptions {
  resourceType: CDNResourceType
  quality?: number
  format?: string
  width?: number
  height?: number
  compression?: 'auto' | 'high' | 'medium' | 'low'
  cacheControl?: 'no-cache' | 'private' | 'public'
}

// CDN管理器
export class CDNManager {
  private config: CDNConfig
  private resourceCache = new Map<string, { url: string; timestamp: number }>()

  constructor(config: CDNConfig) {
    this.config = config
  }

  // 生成CDN URL
  generateCDNUrl(originalUrl: string, options?: CDNOptimizationOptions): string {
    try {
      const url = new URL(originalUrl)
      
      // 如果已经是CDN URL，直接返回
      if (this.isCDNUrl(originalUrl)) {
        return originalUrl
      }

      // 构建CDN基础URL
      const cdnBase = this.getCDNBaseUrl()
      
      // 生成资源路径
      let resourcePath = url.pathname
      
      // 应用优化参数
      if (options) {
        const params = new URLSearchParams()
        
        if (options.quality) {
          params.set('quality', options.quality.toString())
        }
        
        if (options.format) {
          params.set('format', options.format)
        }
        
        if (options.width) {
          params.set('w', options.width.toString())
        }
        
        if (options.height) {
          params.set('h', options.height.toString())
        }
        
        if (options.compression) {
          params.set('compression', options.compression)
        }
        
        if (options.cacheControl) {
          params.set('cache', options.cacheControl)
        }
        
        const paramString = params.toString()
        if (paramString) {
          resourcePath += (resourcePath.includes('?') ? '&' : '?') + paramString
        }
      }
      
      return `${cdnBase}${resourcePath}`
    } catch (error) {
      console.warn('Failed to generate CDN URL:', error)
      return originalUrl
    }
  }

  // 检查是否为CDN URL
  private isCDNUrl(url: string): boolean {
    return url.includes(this.config.baseUrl) || 
           this.config.zones.some(zone => url.includes(zone))
  }

  // 获取CDN基础URL
  private getCDNBaseUrl(): string {
    // 根据资源类型选择最优的CDN节点
    const zone = this.selectOptimalZone()
    return zone
  }

  // 选择最优CDN节点
  private selectOptimalZone(): string {
    // 简单的轮询策略，实际项目中可以使用地理位置或延迟检测
    const zones = this.config.zones.length > 0 ? this.config.zones : [this.config.baseUrl]
    const index = Math.floor(Math.random() * zones.length)
    return zones[index]
  }

  // 缓存CDN资源
  cacheResource(originalUrl: string, cdnUrl: string): void {
    this.resourceCache.set(originalUrl, {
      url: cdnUrl,
      timestamp: Date.now()
    })
  }

  // 获取缓存的CDN URL
  getCachedUrl(originalUrl: string): string | null {
    const cached = this.resourceCache.get(originalUrl)
    if (cached && (Date.now() - cached.timestamp) < this.config.cacheTTL * 1000) {
      return cached.url
    }
    return null
  }

  // 清理过期缓存
  cleanExpiredCache(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    this.resourceCache.forEach((cached, key) => {
      if (now - cached.timestamp > this.config.cacheTTL * 1000) {
        expiredKeys.push(key)
      }
    })
    
    expiredKeys.forEach(key => this.resourceCache.delete(key))
  }

  // 获取缓存统计
  getCacheStats(): {
    total: number
    cached: number
    hitRate: number
  } {
    const total = this.resourceCache.size
    const cached = Array.from(this.resourceCache.values()).filter(
      cached => Date.now() - cached.timestamp < this.config.cacheTTL * 1000
    ).length
    
    return {
      total,
      cached,
      hitRate: total > 0 ? (cached / total) * 100 : 0
    }
  }
}

// 图片CDN优化器
export class ImageCDNOptimizer {
  private cdnManager: CDNManager

  constructor(cdnManager: CDNManager) {
    this.cdnManager = cdnManager
  }

  // 优化图片URL
  optimizeImageUrl(
    originalUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
      responsive?: boolean
    } = {}
  ): string | { src: string; srcset: string } {
    // 检查缓存
    const cached = this.cdnManager.getCachedUrl(originalUrl)
    if (cached) {
      return cached
    }

    // 生成响应式图片URL
    if (options.responsive && options.width) {
      const breakpoints = [320, 640, 768, 1024, 1280, 1536]
      const srcset = breakpoints
        .map(width => {
          const optimizedUrl = this.cdnManager.generateCDNUrl(originalUrl, {
            resourceType: 'image',
            width,
            height: options.height,
            quality: options.quality || 85,
            format: options.format || 'webp',
            compression: 'auto'
          })
          return `${optimizedUrl} ${width}w`
        })
        .join(', ')
      
      return {
        src: this.cdnManager.generateCDNUrl(originalUrl, {
          resourceType: 'image',
          width: options.width,
          height: options.height,
          quality: options.quality || 85,
          format: options.format || 'webp'
        }),
        srcset: srcset
      }
    }

    // 生成单个优化图片URL
    const optimizedUrl = this.cdnManager.generateCDNUrl(originalUrl, {
      resourceType: 'image',
      width: options.width,
      height: options.height,
      quality: options.quality || 85,
      format: options.format || 'webp',
      compression: 'auto'
    })

    // 缓存结果
    this.cdnManager.cacheResource(originalUrl, optimizedUrl)

    return optimizedUrl
  }

  // 生成图片预加载标签
  generatePreloadTags(urls: string[]): string {
    return urls
      .map(url => {
        const optimizedUrl = this.optimizeImageUrl(url)
        return `<link rel="preload" as="image" href="${optimizedUrl}">`
      })
      .join('\n')
  }
}

// 资源CDN优化器
export class AssetCDNOptimizer {
  private cdnManager: CDNManager

  constructor(cdnManager: CDNManager) {
    this.cdnManager = cdnManager
  }

  // 优化静态资源URL
  optimizeAssetUrl(
    originalUrl: string,
    resourceType: CDNResourceType
  ): string {
    // 检查缓存
    const cached = this.cdnManager.getCachedUrl(originalUrl)
    if (cached) {
      return cached
    }

    // 生成优化URL
    const optimizedUrl = this.cdnManager.generateCDNUrl(originalUrl, {
      resourceType,
      compression: 'high'
    })

    // 缓存结果
    this.cdnManager.cacheResource(originalUrl, optimizedUrl)

    return optimizedUrl
  }

  // 生成资源预加载标签
  generatePreloadTags(assets: Array<{ url: string; type: CDNResourceType }>): string {
    return assets
      .map(asset => {
        const optimizedUrl = this.optimizeAssetUrl(asset.url, asset.type)
        const asAttribute = asset.type === 'script' ? 'script' : 'style'
        return `<link rel="preload" as="${asAttribute}" href="${optimizedUrl}">`
      })
      .join('\n')
  }
}

// CDN性能监控
export class CDNPerformanceMonitor {
  private metrics = new Map<string, {
    requests: number
    totalBytes: number
    averageResponseTime: number
    errors: number
    lastAccess: number
  }>()

  recordRequest(url: string, responseTime: number, bytes: number, isError: boolean): void {
    const existing = this.metrics.get(url) || {
      requests: 0,
      totalBytes: 0,
      averageResponseTime: 0,
      errors: 0,
      lastAccess: 0
    }

    existing.requests++
    existing.totalBytes += bytes
    existing.averageResponseTime = (existing.averageResponseTime * (existing.requests - 1) + responseTime) / existing.requests
    existing.lastAccess = Date.now()
    if (isError) existing.errors++

    this.metrics.set(url, existing)
  }

  getMetrics(): Array<{
    url: string
    requests: number
    totalBytes: number
    averageResponseTime: number
    errors: number
    errorRate: number
    lastAccess: number
  }> {
    return Array.from(this.metrics.entries()).map(([url, metrics]) => ({
      url,
      ...metrics,
      errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0
    }))
  }

  clear(): void {
    this.metrics.clear()
  }
}

// 默认CDN配置
export const defaultCDNConfig: CDNConfig = {
  baseUrl: 'https://cdn.veebipop.com',
  zones: [
    'https://cdn1.veebipop.com',
    'https://cdn2.veebipop.com',
    'https://cdn3.veebipop.com'
  ],
  cacheTTL: 3600, // 1小时
  compressionEnabled: true,
  imageOptimization: true,
  security: {
    httpsOnly: true
  }
}

// 创建CDN管理器实例
export const cdnManager = new CDNManager(defaultCDNConfig)
export const imageOptimizer = new ImageCDNOptimizer(cdnManager)
export const assetOptimizer = new AssetCDNOptimizer(cdnManager)
export const cdnPerformanceMonitor = new CDNPerformanceMonitor()

// 工具函数
export const cdnUtils = {
  // 检查URL是否应该使用CDN
  shouldUseCDN: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.protocol === 'https:' && 
             (parsedUrl.hostname.includes('image.nv315.top') ||
              parsedUrl.hostname.includes('pixypic.net') ||
              parsedUrl.hostname.includes('localhost'))
    } catch {
      return false
    }
  },

  // 生成CDN响应头
  generateCacheHeaders: (maxAge: number = 3600): Headers => {
    const headers = new Headers()
    headers.set('Cache-Control', `public, max-age=${maxAge}`)
    headers.set('Expires', new Date(Date.now() + maxAge * 1000).toUTCString())
    headers.set('ETag', `"${Date.now()}"`)
    return headers
  },

  // 生成CDN安全令牌
  generateSecurityToken: (url: string, secret: string): string => {
    const timestamp = Date.now()
    const signature = Buffer.from(`${url}:${timestamp}:${secret}`).toString('base64')
    return `${signature}:${timestamp}`
  }
}