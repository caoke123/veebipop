// src/lib/cache.ts
import { redis } from './redis'

const VERSION = process.env.CACHE_VERSION || '2'

export async function getCache<T>(key: string): Promise<T | null> {
  const fullKey = `cache:${VERSION}:${key}`
  try {
    const raw = await redis.get(fullKey)
    if (!raw) return null
    
    // 处理可能的字符串或对象
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch (parseError) {
        console.warn(`缓存JSON解析失败 for key ${fullKey}:`, parseError)
        // 如果解析失败，删除无效缓存
        await redis.del(fullKey)
        return null
      }
    }
    
    // 如果已经是对象，直接返回
    return raw as T
  } catch (error) {
    console.error(`缓存获取错误 for key ${fullKey}:`, error)
    return null
  }
}

export async function setCache<T>(key: string, data: T, ttl: number) {
  const fullKey = `cache:${VERSION}:${key}`
  try {
    // 确保数据是可序列化的
    const serializedData = JSON.stringify(data)
    await redis.set(fullKey, serializedData, { ex: ttl })
  } catch (error) {
    console.error(`缓存设置错误 for key ${fullKey}:`, error)
    // 不抛出错误，避免影响主流程
  }
}

export async function deleteCache(key: string) {
  const fullKey = `cache:${VERSION}:${key}`
  await redis.del(fullKey)
}

// 缓存键生成器
export class CacheKeyBuilder {
  private static readonly PREFIX = 'anvogue_cache:';

  /**
   * 生成产品缓存键
   */
  static products(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${this.PREFIX}products:${sortedParams}`;
  }

  /**
   * 生成首页数据缓存键
   */
  static homeData(): string {
    return `${this.PREFIX}home_data`;
  }

  /**
   * 生成首页轮播缓存键
   */
  static homeBanners(): string {
    return `${this.PREFIX}home_banners`;
  }

  /**
   * 生成分类缓存键
   */
  static categories(): string {
    return `${this.PREFIX}categories`;
  }

  /**
   * 生成品牌缓存键
   */
  static brands(): string {
    return `${this.PREFIX}brands`;
  }

  /**
   * 生成产品详情缓存键
   */
  static productDetail(productId: number | string): string {
    return `${this.PREFIX}product_detail:${productId}`;
  }
}

// 缓存管理器
export class CacheManager {
  /**
   * 获取缓存数据
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      
      // 检查是否是有效的JSON字符串
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (parseError) {
          console.warn('缓存JSON解析失败，清除无效缓存:', parseError);
          await redis.del(key);
          return null;
        }
      }
      
      // 如果不是字符串，直接返回
      return value as T;
    } catch (error) {
      console.error('缓存获取错误:', error);
      return null;
    }
  }

  /**
   * 设置缓存数据
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      await redis.set(key, serializedValue, { ex: ttlSeconds });
      return true;
    } catch (error) {
      console.error('缓存设置错误:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('缓存删除错误:', error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('缓存检查错误:', error);
      return false;
    }
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<boolean> {
    try {
      const pattern = `${CacheKeyBuilder['PREFIX']}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('缓存清除错误:', error);
      return false;
    }
  }

  /**
   * 获取或设置缓存（缓存穿透保护）
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T | null> {
    try {
      // 尝试从缓存获取
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // 缓存未命中，获取数据
      const data = await fetcher();
      if (data !== null) {
        // 设置缓存
        await this.set(key, data, ttlSeconds);
      }
      return data;
    } catch (error) {
      console.error('缓存操作错误:', error);
      // 降级处理：直接获取数据
      try {
        return await fetcher();
      } catch (fetchError) {
        console.error('数据获取失败:', fetchError);
        return null;
      }
    }
  }
}

// 导出单例实例
export const cacheManager = new CacheManager();