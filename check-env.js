// 检查环境变量配置
console.log('🔍 检查环境变量配置...\n');

const requiredEnvVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CACHE_VERSION'
];

let allConfigured = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: 未设置`);
    allConfigured = false;
  }
});

console.log('\n📋 环境变量检查结果:');
if (allConfigured) {
  console.log('✅ 所有必需的环境变量都已配置');
  console.log('\n🚀 Redis 迁移应该可以正常工作');
  console.log('\n📝 请确保在 Vercel 中设置以下环境变量:');
  requiredEnvVars.forEach(varName => {
    console.log(`   ${varName}=<your-value-here>`);
  });
} else {
  console.log('❌ 缺少必需的环境变量');
  console.log('\n🔧 请在 Vercel 中设置以下环境变量:');
  requiredEnvVars.forEach(varName => {
    console.log(`   ${varName}=<your-value-here>`);
  });
  console.log('\n⚠️  设置环境变量后需要重新部署或重启开发服务器');
}