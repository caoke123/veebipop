import { NextRequest, NextResponse } from 'next/server';
import { cacheManager, CacheKeyBuilder } from './cache';

/**
 * 缓存中间件配置选项
 */
export interface CacheMiddlewareOptions {
  /** 缓存时间（秒），默认5分钟 */
  ttl?: number;
  /** 缓存键生成函数 */
  keyGenerator?: (req: NextRequest) => string;
  /** 是否缓存GET请求，默认true */
  cacheGetRequests?: boolean;
  /** 是否缓存POST请求，默认false */
  cachePostRequests?: boolean;
  /** 缓存键前缀 */
  keyPrefix?: string;
  /** 自定义缓存条件 */
  shouldCache?: (req: NextRequest, response?: NextResponse) => boolean;
}

/**
 * 默认缓存配置
 */
const DEFAULT_OPTIONS: Required<CacheMiddlewareOptions> = {
  ttl: 300, // 5分钟
  keyGenerator: (req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const search = url.search;
    return `${pathname}${search}`;
  },
  cacheGetRequests: true,
  cachePostRequests: false,
  keyPrefix: 'api_cache:',
  shouldCache: () => true,
};

/**
 * 创建缓存中间件
 */
export function createCacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async function cacheMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // 检查是否应该缓存此请求
    const method = req.method;
    const shouldCacheByMethod = 
      (method === 'GET' && config.cacheGetRequests) ||
      (method === 'POST' && config.cachePostRequests);

    if (!shouldCacheByMethod) {
      return handler(req);
    }

    // 生成缓存键
    const cacheKey = `${config.keyPrefix}${config.keyGenerator(req)}`;

    try {
      // 尝试从缓存获取响应
      const cachedResponse = await cacheManager.get<CachedResponse>(cacheKey);
      if (cachedResponse) {
        // 创建新的响应对象
        const response = new NextResponse(cachedResponse.body, {
          status: cachedResponse.status,
          headers: cachedResponse.headers,
        });

        // 添加缓存标识头
        response.headers.set('X-Cache', 'HIT');
        response.headers.set('X-Cache-Key', cacheKey);
        
        return response;
      }
    } catch (error) {
      console.error('缓存获取错误:', error);
      // 继续处理请求，不中断服务
    }

    // 缓存未命中，执行处理器
    const response = await handler(req);

    // 检查是否应该缓存响应
    if (config.shouldCache(req, response)) {
      try {
        // 只缓存成功的响应
        if (response.status >= 200 && response.status < 300) {
          const body = await response.text();
          
          // 创建缓存数据
          const cachedResponse: CachedResponse = {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body,
          };

          // 设置缓存
          await cacheManager.set(cacheKey, cachedResponse, config.ttl);
          
          // 添加缓存标识头
          response.headers.set('X-Cache', 'MISS');
          response.headers.set('X-Cache-Key', cacheKey);
          response.headers.set('X-Cache-TTL', config.ttl.toString());
        }
      } catch (error) {
        console.error('缓存设置错误:', error);
        // 不影响正常响应
      }
    }

    return response;
  };
}

/**
 * 缓存的响应数据结构
 */
interface CachedResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * 预定义的缓存中间件
 */

// 产品列表缓存中间件
export const productCacheMiddleware = createCacheMiddleware({
  ttl: 600, // 10分钟
  keyPrefix: 'products:',
  keyGenerator: (req) => {
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    return CacheKeyBuilder.products(Object.fromEntries(params.entries()));
  },
});

// 首页数据缓存中间件
export const homeDataCacheMiddleware = createCacheMiddleware({
  ttl: 900, // 15分钟
  keyPrefix: 'home_data:',
  keyGenerator: () => CacheKeyBuilder.homeData(),
});

// 分类数据缓存中间件
export const categoriesCacheMiddleware = createCacheMiddleware({
  ttl: 3600, // 1小时
  keyPrefix: 'categories:',
  keyGenerator: () => CacheKeyBuilder.categories(),
});

// 品牌数据缓存中间件
export const brandsCacheMiddleware = createCacheMiddleware({
  ttl: 3600, // 1小时
  keyPrefix: 'brands:',
  keyGenerator: () => CacheKeyBuilder.brands(),
});

/**
 * 清除缓存的工具函数
 */
export class CacheInvalidator {
  /**
   * 清除产品相关缓存
   */
  static async clearProductCache(): Promise<void> {
    try {
      const redis = require('./redis').redis;
      const pattern = `${CacheKeyBuilder['PREFIX']}products:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('清除产品缓存错误:', error);
    }
  }

  /**
   * 清除首页缓存
   */
  static async clearHomeDataCache(): Promise<void> {
    try {
      await cacheManager.del(CacheKeyBuilder.homeData());
    } catch (error) {
      console.error('清除首页缓存错误:', error);
    }
  }

  /**
   * 清除分类缓存
   */
  static async clearCategoriesCache(): Promise<void> {
    try {
      await cacheManager.del(CacheKeyBuilder.categories());
    } catch (error) {
      console.error('清除分类缓存错误:', error);
    }
  }

  /**
   * 清除品牌缓存
   */
  static async clearBrandsCache(): Promise<void> {
    try {
      await cacheManager.del(CacheKeyBuilder.brands());
    } catch (error) {
      console.error('清除品牌缓存错误:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  static async clearAllCache(): Promise<void> {
    try {
      await cacheManager.clear();
    } catch (error) {
      console.error('清除所有缓存错误:', error);
    }
  }
}

/**
 * 缓存统计信息
 */
export class CacheStats {
  /**
   * 获取缓存命中率统计
   */
  static async getCacheStats(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    // 这里可以实现更复杂的统计逻辑
    // 目前返回模拟数据
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
    };
  }
}

export default {
  createCacheMiddleware,
  productCacheMiddleware,
  homeDataCacheMiddleware,
  categoriesCacheMiddleware,
  brandsCacheMiddleware,
  CacheInvalidator,
  CacheStats,
};