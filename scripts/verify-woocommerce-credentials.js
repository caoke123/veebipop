const { default: WooCommerceRestApi } = require('@woocommerce/woocommerce-rest-api');

// 测试本地配置
console.log('=== 测试本地配置 ===');
const localConfig = {
  url: 'https://pixypic.net',
  consumerKey: 'ck_862d780271073c8ff1974f2c44cbe5980b89882e',
  consumerSecret: 'cs_017b4a16a741db190c06c3aa97f1bbad70854036',
  version: 'wc/v3'
};

// 测试错误日志中的配置
console.log('=== 测试错误日志中的配置 ===');
const errorLogConfig = {
  url: 'https://pixypic.net',
  consumerKey: 'cs_37cb520c8d69fa9962c524fda69802b657fbdbae', // 注意：这是 consumer secret 格式，不是 key
  consumerSecret: 'your-consumer-secret',
  version: 'wc/v3'
};

async function testConfig(config, name) {
  console.log(`\n--- 测试 ${name} ---`);
  
  try {
    const wcApi = new WooCommerceRestApi(config);
    
    console.log(`URL: ${config.url}`);
    console.log(`Consumer Key: ${config.consumerKey}`);
    console.log(`Consumer Secret: ${config.consumerSecret.substring(0, 10)}...`);
    
    const response = await wcApi.get('products/attributes');
    console.log(`✅ 成功！获取到 ${response.data.length} 个属性`);
    return true;
  } catch (error) {
    console.log(`❌ 失败！错误: ${error.message}`);
    if (error.response) {
      console.log(`状态码: ${error.response.status}`);
      console.log(`响应数据:`, error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('开始验证 WooCommerce API 凭据...\n');
  
  // 测试本地配置
  const localSuccess = await testConfig(localConfig, '本地配置');
  
  // 测试错误日志中的配置（这应该会失败）
  const errorLogSuccess = await testConfig(errorLogConfig, '错误日志中的配置');
  
  console.log('\n=== 总结 ===');
  console.log(`本地配置: ${localSuccess ? '✅ 有效' : '❌ 无效'}`);
  console.log(`错误日志配置: ${errorLogSuccess ? '✅ 有效' : '❌ 无效'}`);
  
  if (!localSuccess) {
    console.log('\n⚠️  本地配置无效，需要检查 WooCommerce API 凭据');
  } else {
    console.log('\n✅ 本地配置有效，请确保 Vercel 使用相同的环境变量');
  }
}

main().catch(console.error);