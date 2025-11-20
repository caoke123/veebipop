/**
 * 数据库查询优化工具
 * 提供查询优化、批处理和缓存策略
 */

// 查询性能监控
export class QueryPerformanceMonitor {
  private queries = new Map<string, {
    count: number
    totalTime: number
    averageTime: number
    lastExecuted: number
    slowQueries: number
  }>()

  recordQuery(queryKey: string, executionTime: number, isSlow = false): void {
    const existing = this.queries.get(queryKey) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      lastExecuted: 0,
      slowQueries: 0
    }

    existing.count++
    existing.totalTime += executionTime
    existing.averageTime = existing.totalTime / existing.count
    existing.lastExecuted = Date.now()
    if (isSlow) existing.slowQueries++

    this.queries.set(queryKey, existing)
  }

  getStats(): Array<{
    queryKey: string
    count: number
    averageTime: number
    totalTime: number
    slowQueries: number
    lastExecuted: number
  }> {
    return Array.from(this.queries.entries()).map(([queryKey, stats]) => ({
      queryKey,
      ...stats
    }))
  }

  getSlowQueries(threshold = 1000): Array<{
    queryKey: string
    count: number
    averageTime: number
    slowQueries: number
  }> {
    return this.getStats()
      .filter(stat => stat.averageTime > threshold)
      .map(({ queryKey, count, averageTime, slowQueries }) => ({
        queryKey,
        count,
        averageTime,
        slowQueries
      }))
  }

  clear(): void {
    this.queries.clear()
  }
}

// 查询批处理管理器
export class QueryBatcher {
  private batchQueue = new Map<string, any[]>()
  private batchTimeouts = new Map<string, NodeJS.Timeout>()
  private batchHandlers = new Map<string, (items: any[]) => Promise<any>>()

  constructor(
    private defaultBatchSize = 10,
    private defaultBatchDelay = 50
  ) {}

  // 注册批处理处理器
  registerBatchHandler<T>(
    batchKey: string,
    handler: (items: T[]) => Promise<any>,
    options: {
      batchSize?: number
      batchDelay?: number
    } = {}
  ): void {
    this.batchHandlers.set(batchKey, handler as (items: any[]) => Promise<any>)
  }

  // 添加项目到批处理队列
  addToBatch<T>(batchKey: string, item: T): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, [])
      }

      const queue = this.batchQueue.get(batchKey)!
      queue.push({ item, resolve, reject })

      // 如果队列达到批处理大小，立即执行
      if (queue.length >= this.defaultBatchSize) {
        this.processBatch(batchKey)
      } else {
        // 否则设置延迟执行
        this.scheduleBatch(batchKey)
      }
    })
  }

  // 调度批处理
  private scheduleBatch(batchKey: string): void {
    if (this.batchTimeouts.has(batchKey)) {
      return // 已调度
    }

    const timeout = setTimeout(() => {
      this.processBatch(batchKey)
    }, this.defaultBatchDelay)

    this.batchTimeouts.set(batchKey, timeout)
  }

  // 处理批处理
  private async processBatch(batchKey: string): Promise<void> {
    const timeout = this.batchTimeouts.get(batchKey)
    if (timeout) {
      clearTimeout(timeout)
      this.batchTimeouts.delete(batchKey)
    }

    const queue = this.batchQueue.get(batchKey)
    if (!queue || queue.length === 0) return

    this.batchQueue.delete(batchKey)

    const handler = this.batchHandlers.get(batchKey)
    if (!handler) {
      // 没有处理器，拒绝所有请求
      queue.forEach(({ reject }) => reject(new Error(`No batch handler for ${batchKey}`)))
      return
    }

    try {
      const items = queue.map(({ item }) => item)
      const results = await handler(items)

      // 分发结果到对应的Promise
      queue.forEach(({ resolve }, index) => {
        resolve(results[index])
      })
    } catch (error) {
      // 批处理失败，拒绝所有请求
      queue.forEach(({ reject }) => reject(error))
    }
  }

  // 清理批处理队列
  clearBatch(batchKey: string): void {
    const timeout = this.batchTimeouts.get(batchKey)
    if (timeout) {
      clearTimeout(timeout)
      this.batchTimeouts.delete(batchKey)
    }

    const queue = this.batchQueue.get(batchKey)
    if (queue) {
      queue.forEach(({ reject }) => {
        reject(new Error('Batch cleared'))
      })
      this.batchQueue.delete(batchKey)
    }
  }

  // 获取批处理状态
  getBatchStatus(): Array<{
    batchKey: string
    queueSize: number
    isScheduled: boolean
  }> {
    return Array.from(this.batchQueue.keys()).map(batchKey => ({
      batchKey,
      queueSize: this.batchQueue.get(batchKey)?.length || 0,
      isScheduled: this.batchTimeouts.has(batchKey)
    }))
  }
}

// 查询优化器
export class QueryOptimizer {
  private static instance: QueryOptimizer
  private performanceMonitor = new QueryPerformanceMonitor()
  private batcher = new QueryBatcher()

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  // 优化查询参数
  optimizeQueryParams(params: Record<string, any>): Record<string, any> {
    const optimized: Record<string, any> = {}

    // 移除空值和undefined
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        optimized[key] = value
      }
    })

    // 优化数值参数
    if (optimized.per_page) {
      optimized.per_page = Math.min(Math.max(1, Number(optimized.per_page)), 100)
    }

    if (optimized.page) {
      optimized.page = Math.max(1, Number(optimized.page))
    }

    // 优化价格参数
    if (optimized.min_price !== undefined) {
      optimized.min_price = Math.max(0, Number(optimized.min_price))
    }

    if (optimized.max_price !== undefined) {
      optimized.max_price = Math.max(0, Number(optimized.max_price))
    }

    return optimized
  }

  // 创建优化的字段选择器
  createFieldSelector(fields: string[]): string {
    // 移除重复字段并排序
    const uniqueFields = Array.from(new Set(fields)).sort()
    
    // 只选择必要的字段以减少数据传输
    const essentialFields = [
      'id', 'name', 'slug', 'price', 'regular_price', 'sale_price',
      'average_rating', 'stock_quantity', 'images', 'short_description',
      'categories', 'attributes', 'date_created'
    ]
    
    const requestedFields = uniqueFields.filter(field => 
      essentialFields.includes(field) || field.startsWith('meta_data')
    )
    
    return requestedFields.join(',')
  }

  // 执行带性能监控的查询
  async executeWithMonitoring<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      slowThreshold?: number
      enableRetry?: boolean
      maxRetries?: number
    } = {}
  ): Promise<T> {
    const {
      slowThreshold = 1000,
      enableRetry = true,
      maxRetries = 3
    } = options

    const startTime = performance.now()
    let lastError: any

    for (let attempt = 1; attempt <= (enableRetry ? maxRetries : 1); attempt++) {
      try {
        const result = await queryFn()
        const executionTime = performance.now() - startTime
        
        // 记录查询性能
        this.performanceMonitor.recordQuery(
          queryKey,
          executionTime,
          executionTime > slowThreshold
        )

        return result
      } catch (error) {
        lastError = error
        
        if (attempt < (enableRetry ? maxRetries : 1)) {
          // 指数退避重试
          const delay = Math.pow(2, attempt - 1) * 100
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  // 批量查询优化
  async batchQuery<T, R>(
    items: T[],
    batchKey: string,
    queryFn: (batch: T[]) => Promise<R[]>,
    options: {
      batchSize?: number
      batchDelay?: number
    } = {}
  ): Promise<R[]> {
    const { batchSize = 10, batchDelay = 50 } = options

    // 注册批处理器
    this.batcher.registerBatchHandler(batchKey, queryFn, {
      batchSize,
      batchDelay
    })

    // 将所有项目添加到批处理队列
    const promises = items.map(item => 
      this.batcher.addToBatch(batchKey, item)
    )

    try {
      const results = await Promise.all(promises)
      return results
    } finally {
      // 清理批处理器
      this.batcher.clearBatch(batchKey)
    }
  }

  // 获取性能统计
  getPerformanceStats(): {
    queries: Array<{
      queryKey: string
      count: number
      averageTime: number
      totalTime: number
      slowQueries: number
      lastExecuted: number
    }>
    slowQueries: Array<{
      queryKey: string
      count: number
      averageTime: number
      slowQueries: number
    }>
    batchStatus: Array<{
      batchKey: string
      queueSize: number
      isScheduled: boolean
    }>
  } {
    return {
      queries: this.performanceMonitor.getStats(),
      slowQueries: this.performanceMonitor.getSlowQueries(),
      batchStatus: this.batcher.getBatchStatus()
    }
  }

  // 清理性能数据
  clearPerformanceData(): void {
    this.performanceMonitor.clear()
  }
}

// 查询构建器
export class QueryBuilder {
  private params: Record<string, any> = {}
  private selectedFields: string[] = []

  // 添加参数
  param(key: string, value: any): QueryBuilder {
    this.params[key] = value
    return this
  }

  // 添加字段
  field(field: string): QueryBuilder {
    this.selectedFields.push(field)
    return this
  }

  // 添加多个字段
  fields(fields: string[]): QueryBuilder {
    this.selectedFields.push(...fields)
    return this
  }

  // 构建查询对象
  build(): {
    params: Record<string, any>
    fields: string
  } {
    const optimizer = QueryOptimizer.getInstance()
    
    return {
      params: optimizer.optimizeQueryParams(this.params),
      fields: optimizer.createFieldSelector(this.selectedFields)
    }
  }

  // 构建查询字符串
  buildQueryString(): string {
    const { params, fields } = this.build()
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.set(key, String(value))
      }
    })

    if (this.selectedFields.length > 0) {
      searchParams.set('_fields', this.selectedFields.join(','))
    }

    return searchParams.toString()
  }
}

// 全局实例
export const queryOptimizer = QueryOptimizer.getInstance()
export const queryBuilder = () => new QueryBuilder()