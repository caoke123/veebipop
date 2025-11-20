'use client'

import React, { useState } from 'react'
import { runPerformanceTests, generatePerformanceReport } from '@/utils/performanceTest'

export default function PerformanceTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [report, setReport] = useState('')

  const runTests = async () => {
    setIsRunning(true)
    setReport('正在运行性能测试...')
    
    try {
      const results = await runPerformanceTests()
      setTestResults(results)
      setReport(generatePerformanceReport(results))
    } catch (error) {
      console.error('Performance test failed:', error)
      setReport(`测试失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setReport('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">性能测试工具</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <div className="text-gray-600 space-y-2 mb-6">
            <p>这个工具用于测试网站性能优化效果。</p>
            <p>测试包括：</p>
            <ul className="list-disc list-inside space-y-1 ml-6">
              <li>API响应时间测试（目标：小于1秒）</li>
              <li>页面加载时间测试（目标：小于3秒）</li>
              <li>图片加载时间测试（目标：小于500ms）</li>
            </ul>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? '测试中...' : '运行性能测试'}
            </button>
            
            <button
              onClick={clearResults}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              清除结果
            </button>
          </div>
        </div>

        {report && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">测试报告</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {report}
            </pre>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">详细结果</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{result.testName}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.passed ? '通过' : '失败'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">耗时:</span>
                      <span>{result.duration?.toFixed(2) || 'N/A'}ms</span>
                    </div>
                    <div>
                      <span className="font-medium">状态:</span>
                      <span>{result.passed ? '✅ 通过' : '❌ 失败'}</span>
                    </div>
                  </div>
                  
                  {result.details && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="font-medium">详情:</span>
                      <span className="text-gray-600">{result.details}</span>
                    </div>
                  )}
                  
                  {result.metrics && Object.keys(result.metrics).length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="font-medium">指标:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(result.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span>{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">使用指南</h2>
          <div className="text-gray-700 space-y-3">
            <p><strong>在浏览器控制台中运行测试：</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-6">
              <li>打开浏览器开发者工具</li>
              <li>切换到Console标签</li>
              <li>复制并粘贴以下命令：</li>
            </ol>
            <div className="bg-gray-900 text-gray-100 p-4 rounded mt-4">
              <code className="text-sm">
                {`// 导入测试工具并运行\nimport { runPerformanceTests, generatePerformanceReport } from '@/utils/performanceTest'\n\n// 运行所有测试\nrunPerformanceTests().then(results => console.log(generatePerformanceReport(results)))\n\n// 或者只运行特定测试\n// runPerformanceTests().then(results => console.log(results.filter(r => r.testName.includes('API'))))`}
              </code>
            </div>
            
            <p><strong>手动测试步骤：</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-6">
              <li>访问首页，测试加载时间</li>
              <li>访问Shop页面，测试筛选和加载性能</li>
              <li>检查浏览器Network标签，查看API请求时间和缓存状态</li>
              <li>使用Lighthouse进行综合性能评估</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}