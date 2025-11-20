'use client';

import { useState, useEffect } from 'react';

// 简单的Card组件
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

interface CacheStatus {
  redisStatus: string;
  supportedActions: string[];
  supportedTypes: string[];
}

interface CacheStats {
  type: string;
  totalKeys?: number;
  exists?: boolean;
  key?: string;
  sampleKeys?: string[];
  error?: string;
  keyPatterns?: {
    products: number;
    homeData: number;
    categories: number;
    brands: number;
  };
}

export default function CacheStatusPage() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCacheStatus();
  }, []);

  const fetchCacheStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取缓存状态
      const statusResponse = await fetch('/api/admin/cache');
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setCacheStatus(statusData.data);
      } else {
        setError(statusData.message);
      }

      // 获取缓存统计
      const statsResponse = await fetch('/api/admin/cache?type=all', { method: 'PUT' });
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setCacheStats(statsData.data);
      } else {
        setError(statsData.message);
      }
    } catch (err) {
      setError(`获取缓存状态失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (type: string) => {
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`缓存清除成功: ${data.message}`);
        fetchCacheStatus(); // 刷新状态
      } else {
        alert(`缓存清除失败: ${data.message}`);
      }
    } catch (err) {
      alert(`缓存清除失败: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载缓存状态中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 text-lg font-semibold">错误</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">缓存状态监控</h1>
        <button
          onClick={fetchCacheStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          刷新状态
        </button>
      </div>

      {/* Redis连接状态 */}
      <Card>
        <CardHeader>
          <CardTitle>Redis连接状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                cacheStatus?.redisStatus === 'connected'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="font-medium">
              {cacheStatus?.redisStatus === 'connected' ? '已连接' : '未连接'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 缓存统计 */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle>缓存统计信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cacheStats.keyPatterns && (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {cacheStats.keyPatterns.products}
                    </div>
                    <div className="text-sm text-gray-600">产品缓存</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats.keyPatterns.homeData}
                    </div>
                    <div className="text-sm text-gray-600">首页缓存</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {cacheStats.keyPatterns.categories}
                    </div>
                    <div className="text-sm text-gray-600">分类缓存</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {cacheStats.keyPatterns.brands}
                    </div>
                    <div className="text-sm text-gray-600">品牌缓存</div>
                  </div>
                </>
              )}
            </div>
            {cacheStats.totalKeys !== undefined && (
              <div className="mt-4 text-center">
                <span className="text-lg font-medium">
                  总缓存键数: {cacheStats.totalKeys}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 缓存管理操作 */}
      <Card>
        <CardHeader>
          <CardTitle>缓存管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => clearCache('products')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              清除产品缓存
            </button>
            <button
              onClick={() => clearCache('home-data')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              清除首页缓存
            </button>
            <button
              onClick={() => clearCache('categories')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              清除分类缓存
            </button>
            <button
              onClick={() => clearCache('brands')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              清除品牌缓存
            </button>
            <button
              onClick={() => clearCache('all')}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
            >
              清除所有缓存
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 支持的操作类型 */}
      {cacheStatus && (
        <Card>
          <CardHeader>
            <CardTitle>支持的操作类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">支持的操作:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {cacheStatus.supportedActions.map((action) => (
                    <li key={action} className="text-sm">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">支持的缓存类型:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {cacheStatus.supportedTypes.map((type) => (
                    <li key={type} className="text-sm">
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能提示 */}
      <Card>
        <CardHeader>
          <CardTitle>性能优化提示</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Redis缓存可以显著提高API响应速度</p>
            <p>• 产品列表缓存时间: 10分钟</p>
            <p>• 首页数据缓存时间: 15分钟</p>
            <p>• 分类和品牌缓存时间: 1小时</p>
            <p>• 当Redis未连接时，系统会自动回退到内存缓存</p>
            <p>• 建议定期清理过期缓存以释放内存空间</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}