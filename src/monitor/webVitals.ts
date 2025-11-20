import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// 性能阈值配置
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte (ms)
  
  // Custom metrics
  apiResponseTime: { good: 1000, needsImprovement: 2000 }, // API响应时间 (ms)
  pageLoadTime: { good: 3000, needsImprovement: 5000 }, // 页面加载时间 (ms)
}

// 获取性能评级
function getPerformanceRating(metric: string, value: number): 'good' | 'needsImprovement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS]
  if (!threshold) return 'poor'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needsImprovement'
  return 'poor'
}

// 发送性能数据到分析端点
function sendToAnalytics(metricName: string, value: number, rating: string, additionalData?: any) {
  const payload = {
    metric: metricName,
    value,
    rating,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    ...additionalData
  }
  
  // 使用sendBeacon API确保在页面卸载时也能发送数据
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    navigator.sendBeacon('/api/analytics/performance', blob)
  } else {
    // 回退到fetch
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // 忽略分析失败，不影响用户体验
    })
  }
}

// 监控Core Web Vitals
export function reportWebVitals() {
  try {
    // LCP (Largest Contentful Paint)
    getLCP((metric) => {
      const rating = getPerformanceRating('LCP', metric.value)
      sendToAnalytics('LCP', metric.value, rating, {
        id: metric.id,
        url: (metric as any).url || ''
      })
    })
    
    // FID (First Input Delay)
    getFID((metric) => {
      const rating = getPerformanceRating('FID', metric.value)
      sendToAnalytics('FID', metric.value, rating, {
        id: metric.id,
        name: (metric as any).name || '',
        event: (metric as any).event || ''
      })
    })
    
    // CLS (Cumulative Layout Shift)
    getCLS((metric) => {
      const rating = getPerformanceRating('CLS', metric.value)
      sendToAnalytics('CLS', metric.value, rating, {
        id: metric.id
      })
    })
    
    // FCP (First Contentful Paint)
    getFCP((metric) => {
      const rating = getPerformanceRating('FCP', metric.value)
      sendToAnalytics('FCP', metric.value, rating, {
        id: metric.id,
        url: (metric as any).url || ''
      })
    })
    
    // TTFB (Time to First Byte)
    getTTFB((metric) => {
      const rating = getPerformanceRating('TTFB', metric.value)
      sendToAnalytics('TTFB', metric.value, rating, {
        id: metric.id,
        url: (metric as any).url || ''
      })
    })
  } catch (error) {
    console.warn('Failed to report web vitals:', error)
  }
}

// 监控API响应时间
export function reportApiResponseTime(url: string, duration: number) {
  const rating = getPerformanceRating('apiResponseTime', duration)
  sendToAnalytics('apiResponseTime', duration, rating, {
    url,
    type: 'api'
  })
}

// 监控页面加载时间
export function reportPageLoadTime(loadTime: number) {
  const rating = getPerformanceRating('pageLoadTime', loadTime)
  sendToAnalytics('pageLoadTime', loadTime, rating)
}

// 性能预算检查
export function checkPerformanceBudget(metrics: Record<string, number>) {
  const violations: string[] = []
  
  Object.entries(metrics).forEach(([metric, value]) => {
    const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS]
    if (threshold && value > threshold.needsImprovement) {
      violations.push(`${metric}: ${value}ms (threshold: ${threshold.needsImprovement}ms)`)
    }
  })
  
  if (violations.length > 0) {
    console.warn('Performance budget violations:', violations)
    sendToAnalytics('performanceBudgetViolation', violations.length, 'poor', {
      violations
    })
  }
  
  return violations.length === 0
}

// 初始化性能监控
export function initPerformanceMonitoring() {
  // 只在生产环境启用
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  
  // 监控Core Web Vitals
  reportWebVitals()
  
  // 监控页面加载时间
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
        reportPageLoadTime(loadTime)
      }
    })
    
    // 监控长任务
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 超过50ms的任务
            sendToAnalytics('longTask', entry.duration, 'needsImprovement', {
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration
            })
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // longtask可能不被所有浏览器支持
        console.warn('Long task monitoring not supported:', e)
      }
    }
  }
}