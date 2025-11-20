// 简单的Blog功能测试脚本
const http = require('http');

function testUrl(url, description) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${url}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`${description}: ${res.statusCode} (${data.length} bytes)`);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (err) => {
      console.log(`${description}: ERROR - ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`${description}: TIMEOUT`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🧪 开始Blog功能测试...\n');
  
  const tests = [
    { url: '/blog', desc: '博客列表页' },
    { url: '/blog?page=2', desc: '博客分页' },
    { url: '/blog?category=fashion', desc: '博客分类筛选' },
    { url: '/blog?category=fashion&page=2', desc: '博客分类+分页' },
    { url: '/blog/nonexistent-post', desc: '不存在的文章（应该404）' },
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testUrl(test.url, test.desc);
    if (success) passed++;
  }
  
  console.log(`\n📊 测试结果: ${passed}/${total} 通过`);
  console.log('✅ Blog板块完全动态化功能测试完成！');
}

runTests().catch(console.error);