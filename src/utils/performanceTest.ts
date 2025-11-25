// 性能测试工具，用于本地调试和验证优化效果

export interface PerformanceTestResult {
  testName: string
  startTime: number
  endTime: number
  duration: number
  metrics: Record<string, number>
  passed: boolean
  details?: string
}

// 测试API响应时间
export async function testApiResponseTime(url: string, testName: string): Promise<PerformanceTestResult> {
  const startTime = performance.now()
  let responseTime = 0
  let success = false
  let details = ''
  
  try {
    const response = await fetch(url, { 
      cache: 'no-cache', // 强制重新请求
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    responseTime = performance.now() - startTime
    success = response.ok
    
    if (!response.ok) {
      details = `HTTP ${response.status}: ${response.statusText}`
    }
    
    return {
      testName,
      startTime,
      endTime: performance.now(),
      duration: responseTime,
      metrics: {
        responseTime,
        status: response.status,
        success: response.ok ? 1 : 0
      },
      passed: responseTime < 1000, // 1秒内响应为通过
      details: details || `Response time: ${responseTime.toFixed(2)}ms`
    }
  } catch (error) {
    const endTime = performance.now()
    return {
      testName,
      startTime,
      endTime,
      duration: endTime - startTime,
      metrics: {
        error: 1
      },
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// 测试页面加载时间
export function testPageLoadTime(testName: string): Promise<PerformanceTestResult> {
  const startTime = performance.now()
  let details = ''
  
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      // 监听页面加载完成事件
      const checkLoadComplete = () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // 获取详细的性能指标
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart,
            firstPaint: navigation.responseStart - navigation.fetchStart,
            firstContentfulPaint: 0, // 需要Paint Timing API
            totalDuration: duration
          }
          
          resolve({
            testName,
            startTime,
            endTime,
            duration,
            metrics,
            passed: duration < 3000, // 3秒内加载为通过
            details: `Page load time: ${duration.toFixed(2)}ms, DOM ready: ${metrics.domContentLoaded.toFixed(2)}ms`
          })
        } else {
          resolve({
            testName,
            startTime,
            endTime,
            duration,
            metrics: { totalDuration: duration },
            passed: false,
            details: 'Navigation timing not available'
          })
        }
      }
      
      // 多种方式检查页面是否已加载完成
      if (document.readyState === 'complete') {
        checkLoadComplete()
      } else {
        window.addEventListener('load', checkLoadComplete, { once: true })
        // 备用方案：5秒后强制完成
        setTimeout(checkLoadComplete, 5000)
      }
    } else {
      resolve({
        testName,
        startTime,
        endTime: performance.now(),
        duration: 0,
        metrics: {},
        passed: false,
        details: 'Window not available'
      })
    }
  })
}

// 测试图片加载性能
export function testImageLoadTime(imageUrl: string, testName: string): Promise<PerformanceTestResult> {
  const startTime = performance.now()
  let details = ''
  
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      resolve({
        testName,
        startTime,
        endTime,
        duration,
        metrics: {
          loadTime: duration,
          imageSize: img.naturalWidth * img.naturalHeight
        },
        passed: duration < 500, // 500ms内加载为通过
        details: `Image load time: ${duration.toFixed(2)}ms, Size: ${img.naturalWidth}x${img.naturalHeight}`
      })
    }
    
    img.onerror = () => {
      const endTime = performance.now()
      resolve({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        metrics: {
          error: 1
        },
        passed: false,
        details: 'Image failed to load'
      })
    }
    
    // 设置超时
    setTimeout(() => {
      if (img.complete && img.naturalWidth > 0 && img.onload) {
        // 如果图片已加载但onload未触发，手动触发
        img.onload(new Event('load') as any)
      }
    }, 3000)
    
    img.src = imageUrl
  })
}

// 批量性能测试
export async function runPerformanceTests(): Promise<PerformanceTestResult[]> {
  const tests: PerformanceTestResult[] = []
  
  // 测试关键API端点
  const apiTests = [
    { name: 'Home Data API', url: '/api/woocommerce/home-data' },
    { name: 'Products API', url: '/api/woocommerce/products?per_page=10' },
    { name: 'Filtered Products API', url: '/api/woocommerce/products/filtered?per_page=10' },
    { name: 'Categories API', url: '/api/woocommerce/categories?per_page=100' }
  ]
  
  for (const test of apiTests) {
    console.log(`Testing ${test.name}...`)
    const result = await testApiResponseTime(test.url, test.name)
    tests.push(result)
    console.log(`${test.name}: ${result.passed ? 'PASS' : 'FAIL'} - ${result.details}`)
  }
  
  // 测试图片加载
  const imageTests = [
    { name: 'Slider Image 1', url: 'https://assets.veebipop.com/art%20toys4-optimized.webp' },
    { name: 'Slider Image 2', url: 'https://assets.veebipop.com/images/slide-3-optimized.webp' },
    { name: 'Product Image', url: 'https://pixypic.net/wp-content/uploads/2025/11/2_ab6e2e21-10e4-451e-90d9-7dcf1130a9dc_1763295097921.webp' }
  ]
  
  for (const test of imageTests) {
    console.log(`Testing ${test.name}...`)
    const result = await testImageLoadTime(test.url, test.name)
    tests.push(result)
    console.log(`${test.name}: ${result.passed ? 'PASS' : 'FAIL'} - ${result.details}`)
  }
  
  // 测试页面加载
  console.log('Testing page load performance...')
  const pageLoadTest = await testPageLoadTime('Page Load Test')
  tests.push(pageLoadTest)
  console.log(`Page Load: ${pageLoadTest.passed ? 'PASS' : 'FAIL'} - ${pageLoadTest.details}`)
  
  return tests
}

// 生成性能测试报告
export function generatePerformanceReport(testResults: PerformanceTestResult[]): string {
  const passedTestsCount = testResults.filter(t => t.passed).length
  const totalTests = testResults.length
  const passRate = totalTests > 0 ? (passedTestsCount / totalTests * 100).toFixed(1) : 0
  
  let report = `# 性能测试报告\n\n`
  report += `测试时间: ${new Date().toLocaleString()}\n`
  report += `总体通过率: ${passRate}% (${passedTestsCount}/${totalTests})\n\n`
  
  report += `## 测试结果详情\n\n`
  
  testResults.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL'
    report += `### ${test.testName} ${status}\n`
    report += `- 耗时: ${test.duration.toFixed(2)}ms\n`
    report += `- 详情: ${test.details}\n`
    
    if (Object.keys(test.metrics).length > 0) {
      report += `  指标:\n`
      Object.entries(test.metrics).forEach(([key, value]) => {
        report += `  - ${key}: ${typeof value === 'number' ? value.toFixed(2) : value}\n`
      })
    }
    report += `\n`
  })
  
  // 性能建议
  report += `## 性能建议\n\n`
  
  const failedTests = testResults.filter(t => !t.passed)
  if (failedTests.length > 0) {
    report += `### 需要优化的项目:\n`
    failedTests.forEach(test => {
      report += `- ${test.testName}: ${test.details}\n`
    })
  }
  
  if (passedTestsCount === totalTests) {
    report += `🎉 所有测试通过！性能优化效果良好。\n`
  }
  
  return report
}

// 在浏览器控制台中运行性能测试
export function runPerformanceTestInConsole() {
  console.log('🚀 开始性能测试...')
  console.log('请在浏览器控制台中运行以下命令:')
  console.log('copy and paste: runPerformanceTests().then(results => console.log(generatePerformanceReport(results)))')
}