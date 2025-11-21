const http = require('http');

// 测试类目数量API
function testCategoryCounts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/woocommerce/categories-count',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Category Counts API Status:', res.statusCode);
        console.log('Category Counts Response:', data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error('Category Counts API Error:', e);
      reject(e);
    });

    req.end();
  });
}

// 测试分页API
function testPagination(page = 1) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/woocommerce/products/filtered?page=${page}&per_page=9`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Pagination API (Page ${page}) Status:`, res.statusCode);
        try {
          const parsed = JSON.parse(data);
          console.log(`Pagination API (Page ${page}) Product Count:`, parsed.data?.length || 0);
          console.log(`Pagination API (Page ${page}) Meta:`, parsed.meta);
        } catch (e) {
          console.log(`Pagination API (Page ${page}) Raw Response:`, data);
        }
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error(`Pagination API (Page ${page}) Error:`, e);
      reject(e);
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('=== Testing Shop Page Fixes ===\n');
    
    console.log('1. Testing Category Counts API...');
    await testCategoryCounts();
    
    console.log('\n2. Testing Pagination API (Page 1)...');
    await testPagination(1);
    
    console.log('\n3. Testing Pagination API (Page 2)...');
    await testPagination(2);
    
    console.log('\n=== Tests Complete ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();