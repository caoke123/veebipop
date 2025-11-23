#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel 部署前环境变量检查\n');

// 检查必需的环境变量
const requiredEnvVars = [
  'WOOCOMMERCE_URL',
  'WOOCOMMERCE_CONSUMER_KEY', 
  'WOOCOMMERCE_CONSUMER_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

const optionalEnvVars = [
  'CACHE_VERSION',
  'NODE_ENV',
  'NEXT_PUBLIC_APP_ENV',
  'APP_ENV',
  'DISABLE_FALLBACK_JSON'
];

// 读取环境变量文件
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return {};
  }
  
  console.log(`📖 读取文件: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const envVars = {};
  
  content.split('\n').forEach((line, index) => {
    // 跳过注释和空行
    if (line.trim().startsWith('#') || line.trim() === '') {
      return;
    }
    
    const match = line.match(/^([^=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // 移除引号（支持双引号和单引号）
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 只有当键和值都存在时才添加
      if (key && value) {
        envVars[key] = value;
        console.log(`  行 ${index + 1}: ${key} = ${value.substring(0, 20)}...`);
      } else {
        console.log(`  行 ${index + 1}: 跳过 (键或值为空): ${line}`);
      }
    } else {
      console.log(`  行 ${index + 1}: 跳过 (格式不正确): ${line}`);
    }
  });
  
  console.log(`✅ 解析完成，共 ${Object.keys(envVars).length} 个变量`);
  return envVars;
}

// 验证环境变量
function validateEnvVars(envVars, source) {
  console.log(`\n📋 检查 ${source}:`);
  
  let missing = [];
  let invalid = [];
  
  requiredEnvVars.forEach(key => {
    const value = envVars[key];
    if (!value) {
      missing.push(key);
    } else if (key.includes('URL') && !value.startsWith('http')) {
      invalid.push(`${key} (必须以 http:// 或 https:// 开头)`);
    } else if (key.includes('KEY') && !value.startsWith('ck_')) {
      invalid.push(`${key} (必须以 ck_ 开头)`);
    } else if (key.includes('SECRET') && !value.startsWith('cs_')) {
      invalid.push(`${key} (必须以 cs_ 开头)`);
    }
  });
  
  if (missing.length === 0 && invalid.length === 0) {
    console.log('✅ 所有必需的环境变量都已正确配置');
    
    // 显示配置摘要（隐藏敏感信息）
    console.log('\n📊 配置摘要:');
    console.log(`- WooCommerce URL: ${envVars.WOOCOMMERCE_URL}`);
    console.log(`- Consumer Key: ${envVars.WOOCOMMERCE_CONSUMER_KEY?.substring(0, 10)}...`);
    console.log(`- Consumer Secret: ${envVars.WOOCOMMERCE_CONSUMER_SECRET?.substring(0, 10)}...`);
    console.log(`- Redis URL: ${envVars.UPSTASH_REDIS_REST_URL?.substring(0, 30)}...`);
    console.log(`- Cache Version: ${envVars.CACHE_VERSION || '1'}`);
    
    return true;
  } else {
    console.log('❌ 发现问题:');
    if (missing.length > 0) {
      console.log(`  缺失的变量: ${missing.join(', ')}`);
    }
    if (invalid.length > 0) {
      console.log(`  无效的变量: ${invalid.join(', ')}`);
    }
    return false;
  }
}

// 检查文件是否存在
function checkFiles() {
  console.log('\n📁 检查必需文件:');
  
  const requiredFiles = [
    '.env.local',
    '.env.production',
    'next.config.js',
    'package.json'
  ];
  
  let allExists = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} (缺失)`);
      allExists = false;
    }
  });
  
  return allExists;
}

// 生成 Vercel 环境变量配置
function generateVercelConfig(envVars) {
  console.log('\n🔧 Vercel 环境变量配置:');
  console.log('请在 Vercel 控制台的 Environment Variables 中添加以下变量:\n');
  
  const vercelVars = {};
  
  requiredEnvVars.forEach(key => {
    if (envVars[key]) {
      vercelVars[key] = envVars[key];
    }
  });
  
  optionalEnvVars.forEach(key => {
    if (envVars[key]) {
      vercelVars[key] = envVars[key];
    }
  });
  
  Object.entries(vercelVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  return vercelVars;
}

// 主函数
async function main() {
  console.log('🔍 开始部署前检查...\n');
  
  // 检查文件
  const filesOk = checkFiles();
  
  // 读取环境变量
  const localEnv = readEnvFile('.env.local');
  const prodEnv = readEnvFile('.env.production');
  
  // 验证本地环境变量
  const localValid = validateEnvVars(localEnv, '.env.local');
  
  // 验证生产环境变量
  const prodValid = validateEnvVars(prodEnv, '.env.production');
  
  // 生成 Vercel 配置
  if (localValid) {
    generateVercelConfig(localEnv);
  }
  
  // 总结
  console.log('\n📋 检查总结:');
  console.log(`文件检查: ${filesOk ? '✅ 通过' : '❌ 失败'}`);
  console.log(`本地环境变量: ${localValid ? '✅ 通过' : '❌ 失败'}`);
  console.log(`生产环境变量: ${prodValid ? '✅ 通过' : '❌ 失败'}`);
  
  if (filesOk && localValid && prodValid) {
    console.log('\n🎉 所有检查通过！可以安全部署到 Vercel。');
    console.log('\n📝 下一步操作:');
    console.log('1. 确保 Vercel 环境变量已正确配置');
    console.log('2. 触发新的部署');
    console.log('3. 检查部署日志确认无错误');
  } else {
    console.log('\n⚠️  发现问题，请修复后重新检查。');
    process.exit(1);
  }
}

main().catch(console.error);