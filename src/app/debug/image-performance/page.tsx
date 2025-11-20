"use client"

import React, { useState, useEffect } from 'react'
import { imagePerformanceMonitor, imagePreloader } from '@/lib/imageOptimizer'

interface ImageMetric {
  url: string
  loadTime: number
  size: number
  format: string
  timestamp: number
}

export default function ImagePerformancePage() {
  const [metrics, setMetrics] = useState<ImageMetric[]>([])
  const [averageLoadTime, setAverageLoadTime] = useState(0)
  const [slowImages, setSlowImages] = useState<ImageMetric[]>([])
  const [preloadStatus, setPreloadStatus] = useState({ total: 0, preloaded: 0, percentage: 0 })

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = imagePerformanceMonitor.getMetrics()
      setMetrics(currentMetrics)
      setAverageLoadTime(imagePerformanceMonitor.getAverageLoadTime())
      setSlowImages(imagePerformanceMonitor.getSlowImages(1000).map(img => ({
        ...img,
        timestamp: Date.now() // 添加缺失的 timestamp 属性
      })))
    }

    const updatePreloadStatus = () => {
      setPreloadStatus(imagePreloader.getPreloadStatus())
    }

    // 初始加载
    updateMetrics()
    updatePreloadStatus()

    // 定期更新
    const interval = setInterval(() => {
      updateMetrics()
      updatePreloadStatus()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const clearMetrics = () => {
    imagePerformanceMonitor.clear()
    setMetrics([])
    setAverageLoadTime(0)
    setSlowImages([])
  }

  const clearPreloadCache = () => {
    imagePreloader.clearCache()
    setPreloadStatus({ total: 0, preloaded: 0, percentage: 0 })
  }

  const testImageLoad = async () => {
    const testImages = [
      'https://image.nv315.top/art%20toys4-optimized.webp',
      'https://image.nv315.top/images/slide-3-optimized.webp',
      'https://image.nv315.top/images/s11-3-optimized.webp',
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/600/400?random=2'
    ]

    for (const imageUrl of testImages) {
      try {
        const startTime = performance.now()
        await imagePreloader.preloadImage(imageUrl, 'high')
        const loadTime = performance.now() - startTime
        imagePerformanceMonitor.recordImageLoad(imageUrl, loadTime, 0)
      } catch (error) {
        console.error(`Failed to load test image: ${imageUrl}`, error)
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片性能监控</h1>
        <p className="text-gray-600">实时监控和分析图片加载性能</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* 性能统计卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">性能统计</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>平均加载时间:</span>
              <span className="font-mono">{averageLoadTime.toFixed(2)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>已加载图片:</span>
              <span className="font-mono">{metrics.length}</span>
            </div>
            <div className="flex justify-between">
              <span>慢速图片 ({'>'}1s):</span>
              <span className="font-mono text-red-600">{slowImages.length}</span>
            </div>
          </div>
        </div>

        {/* 预加载状态卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">预加载状态</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>总图片数:</span>
              <span className="font-mono">{preloadStatus.total}</span>
            </div>
            <div className="flex justify-between">
              <span>已预加载:</span>
              <span className="font-mono text-green-600">{preloadStatus.preloaded}</span>
            </div>
            <div className="flex justify-between">
              <span>完成度:</span>
              <span className="font-mono">{preloadStatus.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">操作</h3>
          <div className="space-y-2">
            <button
              onClick={testImageLoad}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              测试图片加载
            </button>
            <button
              onClick={clearMetrics}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              清除性能数据
            </button>
            <button
              onClick={clearPreloadCache}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              清除预加载缓存
            </button>
          </div>
        </div>
      </div>

      {/* 慢速图片列表 */}
      {slowImages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-red-600">慢速图片 ({'>'}1s)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">URL</th>
                  <th className="px-4 py-2 text-left">加载时间</th>
                  <th className="px-4 py-2 text-left">格式</th>
                  <th className="px-4 py-2 text-left">大小</th>
                </tr>
              </thead>
              <tbody>
                {slowImages.map((image, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 truncate max-w-xs">{image.url}</td>
                    <td className="px-4 py-2 font-mono text-red-600">{image.loadTime.toFixed(2)}ms</td>
                    <td className="px-4 py-2">{image.format}</td>
                    <td className="px-4 py-2">{image.size ? `${(image.size / 1024).toFixed(1)}KB` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 所有图片性能详情 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">图片性能详情</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">加载时间</th>
                <th className="px-4 py-2 text-left">格式</th>
                <th className="px-4 py-2 text-left">大小</th>
                <th className="px-4 py-2 text-left">时间戳</th>
              </tr>
            </thead>
            <tbody>
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    暂无图片加载数据
                  </td>
                </tr>
              ) : (
                metrics.map((image, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 truncate max-w-xs">{image.url}</td>
                    <td className="px-4 py-2 font-mono">
                      <span className={image.loadTime > 1000 ? 'text-red-600' : 'text-green-600'}>
                        {image.loadTime.toFixed(2)}ms
                      </span>
                    </td>
                    <td className="px-4 py-2">{image.format}</td>
                    <td className="px-4 py-2">{image.size ? `${(image.size / 1024).toFixed(1)}KB` : 'N/A'}</td>
                    <td className="px-4 py-2 font-mono">
                      {new Date(image.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 性能建议 */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">性能优化建议</h3>
        <div className="space-y-3">
          {slowImages.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">
                <strong>发现 {slowImages.length} 张慢速图片</strong> - 建议优化图片格式、压缩或使用CDN加速
              </p>
            </div>
          )}
          
          {averageLoadTime > 500 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                <strong>平均加载时间较长</strong> - 建议启用图片预加载和懒加载
              </p>
            </div>
          )}
          
          {preloadStatus.percentage < 50 && metrics.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                <strong>预加载率较低</strong> - 建议增加关键图片的预加载
              </p>
            </div>
          )}
          
          {metrics.length === 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-800">
                <strong>暂无数据</strong> - 点击"测试图片加载"按钮开始性能测试
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}