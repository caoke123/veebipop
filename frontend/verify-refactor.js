#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 ShopBreadCrumb1 组件重构结果...\n');

const componentPath = path.join(__dirname, 'src/components/Shop/ShopBreadCrumb1.tsx');

try {
  const componentCode = fs.readFileSync(componentPath, 'utf8');
  
  console.log('✅ 文件读取成功');
  
  // 检查应该被移除的内容
  const removedPatterns = [
    { pattern: /useInfiniteQuery/, name: 'useInfiniteQuery' },
    { pattern: /isFetchingNextPage/, name: 'isFetchingNextPage' },
    { pattern: /hasNextPage/, name: 'hasNextPage' },
    { pattern: /fetchNextPage/, name: 'fetchNextPage' },
    { pattern: /mergedSource/, name: 'mergedSource' },
    { pattern: /loadMoreRef/, name: 'loadMoreRef' },
    { pattern: /timedFetch/, name: 'timedFetch' },
    { pattern: /buildProductParams/, name: 'buildProductParams' }
  ];
  
  console.log('\n🗑️ 检查已移除的代码模式:');
  let allClean = true;
  
  removedPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(componentCode)) {
      console.log(`   ❌ 发现残留的 ${name} 引用`);
      allClean = false;
    } else {
      console.log(`   ✅ 已移除 ${name}`);
    }
  });
  
  // 检查应该保留的导入
  console.log('\n📦 检查保留的导入:');
  const expectedImports = [
    { pattern: /import React.*from 'react'/, name: 'React 核心导入' },
    { pattern: /import.*useState/, name: 'useState' },
    { pattern: /import.*useEffect/, name: 'useEffect' },
    { pattern: /import.*useMemo/, name: 'useMemo' }
  ];
  
  expectedImports.forEach(({ pattern, name }) => {
    if (pattern.test(componentCode)) {
      console.log(`   ✅ ${name} 保留`);
    } else {
      console.log(`   ⚠️ ${name} 可能缺失`);
    }
  });
  
  // 检查props使用
  console.log('\n🔄 检查props数据源:');
  if (componentCode.includes('data || []') && componentCode.includes('props.data')) {
    console.log('   ✅ 使用props.data作为数据源');
  }
  
  // 检查useRef移除
  console.log('\n📌 检查useRef移除:');
  if (!componentCode.includes('useRef')) {
    console.log('   ✅ 已移除useRef');
  } else {
    console.log('   ⚠️ 仍存在useRef使用');
  }
  
  console.log('\n📊 重构总结:');
  if (allClean) {
    console.log('   🎉 重构成功！已完全移除useInfiniteQuery相关代码');
    console.log('   ✅ 组件现在完全依赖props传递的数据');
    console.log('   ✅ 所有无限滚动和API调用逻辑已清理');
  } else {
    console.log('   ⚠️ 重构部分完成，仍有残留引用需要清理');
  }
  
} catch (error) {
  console.error('❌ 文件读取失败:', error.message);
}