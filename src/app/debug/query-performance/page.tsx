"use client"

import React, { useState, useEffect } from 'react'
import { queryOptimizer } from '@/lib/queryOptimizer'

interface QueryStats {
  queryKey: string
  count: number
  averageTime: number
  totalTime: number
  slowQueries: number
  lastExecuted: number
}

interface BatchStatus {
  batchKey: string
  queueSize: number
  isScheduled: boolean
}

export default function QueryPerformancePage() {
  const [stats, setStats] = useState<QueryStats[]>([])
  const [slowQueries, setSlowQueries] = useState<QueryStats[]>([])
  const [batchStatus, setBatchStatus] = useState<BatchStatus[]>([])
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)

  useEffect(() => {
    const updateStats = () => {
      const performanceStats = queryOptimizer.getPerformanceStats()
      setStats(performanceStats.queries)
      setSlowQueries(performanceStats.slowQueries as any)
      setBatchStatus(performanceStats.batchStatus)
    }

    // 初始加载
    updateStats()

    // 定期更新
    const interval = setInterval(updateStats, 2000)

    return () => clearInterval(interval)
  }, [])

  const clearStats = () => {
    queryOptimizer.clearPerformanceData()
    setStats([])
    setSlowQueries([])
    setBatchStatus([])
  }

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getPerformanceLevel = (avgTime: number): {
    level: 'excellent' | 'good' | 'fair' | 'poor'
    color: string
    bgColor: string
  } => {
    if (avgTime < 100) {
      return { level: 'excellent', color: 'text-green-600', bgColor: 'bg-green-50' }
    } else if (avgTime < 300) {
      return { level: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    } else if (avgTime < 1000) {
      return { level: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    } else {
      return { level: 'poor', color: 'text-red-600', bgColor: 'bg-red-50' }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">数据库查询性能监控</h1>
        <p className="text-gray-600">实时监控和分析数据库查询性能</p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">总查询数</h3>
          <div className="text-3xl font-bold text-blue-600">{stats.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">慢查询数</h3>
          <div className="text-3xl font-bold text-red-600">{slowQueries.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">平均响应时间</h3>
          <div className="text-3xl font-bold">
            {stats.length > 0 
              ? formatDuration(stats.reduce((sum, stat) => sum + stat.averageTime, 0) / stats.length)
              : '0ms'
            }
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">活跃批处理</h3>
          <div className="text-3xl font-bold text-green-600">
            {batchStatus.filter(status => status.isScheduled).length}
          </div>
        </div>
      </div>

      {/* 慢查询详情 */}
      {slowQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-red-600">慢查询分析 ({'>'}1s)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">查询类型</th>
                  <th className="px-4 py-2 text-left">执行次数</th>
                  <th className="px-4 py-2 text-left">平均时间</th>
                  <th className="px-4 py-2 text-left">总时间</th>
                  <th className="px-4 py-2 text-left">慢查询次数</th>
                  <th className="px-4 py-2 text-left">最后执行</th>
                </tr>
              </thead>
              <tbody>
                {slowQueries.map((query, index) => {
                  const performance = getPerformanceLevel(query.averageTime)
                  return (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-mono">{query.queryKey}</td>
                      <td className="px-4 py-2">{query.count}</td>
                      <td className={`px-4 py-2 font-mono ${performance.color}`}>
                        {formatDuration(query.averageTime)}
                      </td>
                      <td className="px-4 py-2 font-mono">{formatDuration(query.totalTime)}</td>
                      <td className="px-4 py-2 text-red-600">{query.slowQueries}</td>
                      <td className="px-4 py-2">{formatTime(query.lastExecuted)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 所有查询统计 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">查询性能详情</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">查询类型</th>
                <th className="px-4 py-2 text-left">执行次数</th>
                <th className="px-4 py-2 text-left">平均时间</th>
                <th className="px-4 py-2 text-left">总时间</th>
                <th className="px-4 py-2 text-left">性能等级</th>
                <th className="px-4 py-2 text-left">最后执行</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    暂无查询统计数据
                  </td>
                </tr>
              ) : (
                stats.map((query, index) => {
                  const performance = getPerformanceLevel(query.averageTime)
                  return (
                    <tr 
                      key={index} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedQuery(query.queryKey)}
                    >
                      <td className="px-4 py-2 font-mono">{query.queryKey}</td>
                      <td className="px-4 py-2">{query.count}</td>
                      <td className={`px-4 py-2 font-mono ${performance.color}`}>
                        {formatDuration(query.averageTime)}
                      </td>
                      <td className="px-4 py-2 font-mono">{formatDuration(query.totalTime)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${performance.bgColor} ${performance.color}`}>
                          {performance.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatTime(query.lastExecuted)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 批处理状态 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">批处理状态</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">批处理键</th>
                <th className="px-4 py-2 text-left">队列大小</th>
                <th className="px-4 py-2 text-left">状态</th>
              </tr>
            </thead>
            <tbody>
              {batchStatus.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    暂无批处理活动
                  </td>
                </tr>
              ) : (
                batchStatus.map((batch, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-mono">{batch.batchKey}</td>
                    <td className="px-4 py-2">{batch.queueSize}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        batch.isScheduled 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {batch.isScheduled ? '调度中' : '空闲'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 性能建议 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">性能优化建议</h3>
        <div className="space-y-3">
          {slowQueries.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">
                <strong>发现 {slowQueries.length} 个慢查询</strong> - 建议优化查询逻辑、添加索引或使用缓存
              </p>
            </div>
          )}
          
          {stats.length > 0 && stats.reduce((sum, stat) => sum + stat.averageTime, 0) / stats.length > 500 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                <strong>平均查询时间较长</strong> - 建议启用查询批处理和结果缓存
              </p>
            </div>
          )}
          
          {batchStatus.filter(status => status.isScheduled).length > 5 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                <strong>批处理队列较长</strong> - 建议调整批处理大小或延迟时间
              </p>
            </div>
          )}
          
          {stats.length === 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-800">
                <strong>暂无数据</strong> - 执行一些查询以开始监控
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">操作</h3>
        <div className="flex gap-4">
          <button
            onClick={clearStats}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            清除统计数据
          </button>
          
          {selectedQuery && (
            <button
              onClick={() => setSelectedQuery(null)}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
            >
              清除选择
            </button>
          )}
        </div>
        
        {selectedQuery && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              <strong>选中查询:</strong> {selectedQuery}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}