// 性能测试启动脚本
// 运行: node scripts/test-performance.js

const { execSync } = require('child_process')

console.log('🚀 启动性能测试服务器...')

// 启动开发服务器
const serverProcess = execSync('npm run dev', { 
  encoding: 'utf8',
  stdio: 'inherit',
  cwd: process.cwd()
})

console.log('📊 服务器启动信息:')
console.log(`PID: ${serverProcess.pid}`)
console.log(`命令: npm run dev`)

// 等待服务器启动
setTimeout(() => {
  console.log('🌐 服务器已启动，现在可以访问以下URL进行性能测试:')
  console.log('📱 性能测试页面: http://localhost:3000/debug/performance-test')
  console.log('🏠 首页: http://localhost:3000')
  console.log('🛍️ Shop页面: http://localhost:3000/shop')
  console.log('')
  console.log('💡 提示: 在浏览器中打开性能测试页面，点击"运行性能测试"按钮')
  console.log('')
  console.log('📝 测试完成后，可以在控制台查看详细报告')
}, 3000)

// 监听服务器输出
serverProcess.stdout.on('data', (data) => {
  console.log(`[服务器] ${data.toString().trim()}`)
})

serverProcess.stderr.on('data', (data) => {
  console.error(`[服务器错误] ${data.toString().trim()}`)
})

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`服务器异常退出，代码: ${code}`)
  } else {
    console.log('✅ 服务器已停止')
  }
})

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止服务器...')
  serverProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 正在停止服务器...')
  serverProcess.kill('SIGTERM')
})