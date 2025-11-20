import { NextRequest, NextResponse } from 'next/server';
import { cacheManager, CacheKeyBuilder } from '@/lib/cache';

export const runtime = 'edge'

// 缓存失效工具类
class CacheInvalidator {
  /**
   * 清除产品相关缓存
   */
  static async clearProductCache(): Promise<void> {
    try {
      const { redis } = await import('@/lib/redis');
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
 * 缓存管理API路由
 * 支持清除特定类型的缓存或全部缓存
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const type = searchParams.get('type');

    // 检查Upstash Redis连接状态
    try {
      // Upstash Redis doesn't have a direct status check like ioredis
      // We'll try a simple operation to verify connectivity
      const { redis } = await import('@/lib/redis');
      await redis.get('connection_test');
      
      return NextResponse.json({
        success: true,
        message: '缓存状态查询成功',
        data: {
          redisStatus: 'connected',
          supportedActions: ['clear', 'status'],
          supportedTypes: [
            'products',
            'home-data',
            'categories',
            'brands',
            'all'
          ]
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Upstash Redis连接失败',
        error: String(error)
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '缓存状态查询失败',
      error: String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type } = body;

    if (!action) {
      return NextResponse.json({
        success: false,
        message: '缺少action参数'
      }, { status: 400 });
    }

    let result = { success: false, message: '', clearedKeys: 0 };

    switch (action) {
      case 'clear':
        if (!type) {
          return NextResponse.json({
            success: false,
            message: '清除缓存需要指定type参数'
          }, { status: 400 });
        }

        switch (type) {
          case 'products':
            await CacheInvalidator.clearProductCache();
            result = {
              success: true,
              message: '产品缓存清除成功',
              clearedKeys: -1 // 无法精确统计
            };
            break;

          case 'home-data':
            await CacheInvalidator.clearHomeDataCache();
            result = {
              success: true,
              message: '首页数据缓存清除成功',
              clearedKeys: 1
            };
            break;

          case 'categories':
            await CacheInvalidator.clearCategoriesCache();
            result = {
              success: true,
              message: '分类缓存清除成功',
              clearedKeys: 1
            };
            break;

          case 'brands':
            await CacheInvalidator.clearBrandsCache();
            result = {
              success: true,
              message: '品牌缓存清除成功',
              clearedKeys: 1
            };
            break;

          case 'all':
            await CacheInvalidator.clearAllCache();
            result = {
              success: true,
              message: '所有缓存清除成功',
              clearedKeys: -1 // 无法精确统计
            };
            break;

          default:
            return NextResponse.json({
              success: false,
              message: `不支持的缓存类型: ${type}`,
              supportedTypes: ['products', 'home-data', 'categories', 'brands', 'all']
            }, { status: 400 });
        }
        break;

      case 'warmup':
        // 预热缓存 - 可以在这里实现预热逻辑
        result = {
          success: true,
          message: '缓存预热功能待实现',
          clearedKeys: 0
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          message: `不支持的操作: ${action}`,
          supportedActions: ['clear', 'warmup']
        }, { status: 400 });
    }

    // 记录缓存操作日志
    console.log(`Cache ${action} operation: ${type} - ${result.message}`);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        action,
        type,
        clearedKeys: result.clearedKeys,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json({
      success: false,
      message: '缓存管理操作失败',
      error: String(error)
    }, { status: 500 });
  }
}

/**
 * 获取缓存统计信息
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let stats = {};

    switch (type) {
      case 'products':
        // 获取产品缓存统计
        try {
          const redis = require('@/lib/redis').redis;
          const pattern = `${CacheKeyBuilder['PREFIX']}products:*`;
          const keys = await redis.keys(pattern);
          stats = {
            type: 'products',
            totalKeys: keys.length,
            sampleKeys: keys.slice(0, 5)
          };
        } catch (error) {
          stats = { type: 'products', error: String(error) };
        }
        break;

      case 'home-data':
        // 检查首页数据缓存
        try {
          const exists = await cacheManager.exists(CacheKeyBuilder.homeData());
          stats = {
            type: 'home-data',
            exists,
            key: CacheKeyBuilder.homeData()
          };
        } catch (error) {
          stats = { type: 'home-data', error: String(error) };
        }
        break;

      case 'categories':
        // 检查分类缓存
        try {
          const exists = await cacheManager.exists(CacheKeyBuilder.categories());
          stats = {
            type: 'categories',
            exists,
            key: CacheKeyBuilder.categories()
          };
        } catch (error) {
          stats = { type: 'categories', error: String(error) };
        }
        break;

      case 'brands':
        // 检查品牌缓存
        try {
          const exists = await cacheManager.exists(CacheKeyBuilder.brands());
          stats = {
            type: 'brands',
            exists,
            key: CacheKeyBuilder.brands()
          };
        } catch (error) {
          stats = { type: 'brands', error: String(error) };
        }
        break;

      case 'all':
        // 获取所有缓存统计
        try {
          const { redis } = await import('@/lib/redis');
          const pattern = `${CacheKeyBuilder['PREFIX']}*`;
          const keys = await redis.keys(pattern);
          stats = {
            type: 'all',
            totalKeys: keys.length,
            keyPatterns: {
              products: keys.filter((k: string) => k.includes('products:')).length,
              homeData: keys.filter((k: string) => k.includes('home_data')).length,
              categories: keys.filter((k: string) => k.includes('categories')).length,
              brands: keys.filter((k: string) => k.includes('brands')).length
            }
          };
        } catch (error) {
          stats = { type: 'all', error: String(error) };
        }
        break;

      default:
        return NextResponse.json({
          success: false,
          message: `不支持的统计类型: ${type}`,
          supportedTypes: ['products', 'home-data', 'categories', 'brands', 'all']
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '缓存统计信息获取成功',
      data: stats
    });

  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json({
      success: false,
      message: '缓存统计获取失败',
      error: String(error)
    }, { status: 500 });
  }
}