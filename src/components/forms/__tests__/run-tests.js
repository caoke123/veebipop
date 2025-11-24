// 简单的测试运行脚本
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 开始运行表单验证测试...\n')

try {
  // 运行表单验证测试
  console.log('📋 运行表单验证测试...')
  execSync('node test-runner.js', { 
    cwd: __dirname,
    stdio: 'inherit'
  })
  
  console.log('\n✅ 所有测试完成！')
  
  // 检查TypeScript编译错误
  console.log('\n🔍 检查TypeScript编译状态...')
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      cwd: path.join(__dirname, '../../../'),
      stdio: 'pipe'
    })
    console.log('✅ TypeScript编译检查通过')
  } catch (error) {
    console.log('⚠️  TypeScript编译检查发现问题')
    console.log(error.stdout?.toString() || error.message)
  }
  
} catch (error) {
  console.error('❌ 测试运行失败:', error.message)
  process.exit(1)
}

console.log('\n🎉 表单系统测试完成！')
console.log('\n📚 使用说明:')
console.log('1. 查看 src/components/forms/README.md 了解使用方法')
console.log('2. 访问 /forms-demo 页面查看表单演示')
console.log('3. 查看 src/components/forms/__tests__/ 目录了解测试结构')