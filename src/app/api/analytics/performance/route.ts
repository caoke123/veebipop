import { NextRequest } from 'next/server'

// 性能数据存储（生产环境应使用数据库）
const performanceData: any[] = []

export async function POST(request: NextRequest) {
  try {
    // 快速响应，避免超时
    const response = new Response(JSON.stringify({ 
      success: true, 
      message: 'Performance data recorded'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
    // 异步处理数据，不阻塞响应
    request.json().then(body => {
      // 验证必要字段
      if (!body.metric || typeof body.value !== 'number') {
        console.warn('Invalid performance data received')
        return
      }
      
      // 添加时间戳
      const entry = {
        ...body,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || '',
        ip: request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              request.headers.get('remote-addr') || 'unknown'
      }
      
      // 存储性能数据
      performanceData.push(entry)
      
      // 保持最近1000条记录
      if (performanceData.length > 1000) {
        performanceData.splice(0, performanceData.length - 1000)
      }
      
      // 在控制台记录（生产环境应使用日志系统）
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metric:', entry)
      }
    }).catch(error => {
      console.error('Performance analytics error:', error)
    })
    
    return response
    
  } catch (error) {
    console.error('Performance analytics error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to process performance data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 200, // 返回成功状态，避免客户端错误
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// GET端点用于获取性能统计（仅开发环境）
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(JSON.stringify({ 
      error: 'Performance stats only available in development' 
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // 计算性能统计
  const stats = {
    totalMetrics: performanceData.length,
    metricsByType: {} as Record<string, number>,
    averageValues: {} as Record<string, number>,
    poorPerformance: {} as Record<string, number>
  }
  
  performanceData.forEach(entry => {
    const metric = entry.metric
    stats.metricsByType[metric] = (stats.metricsByType[metric] || 0) + 1
    
    if (!stats.averageValues[metric]) {
      stats.averageValues[metric] = 0
    }
    stats.averageValues[metric] += entry.value
    
    if (entry.rating === 'poor') {
      stats.poorPerformance[metric] = (stats.poorPerformance[metric] || 0) + 1
    }
  })
  
  // 计算平均值
  Object.keys(stats.averageValues).forEach(metric => {
    stats.averageValues[metric] = stats.averageValues[metric] / stats.metricsByType[metric]
  })
  
  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}