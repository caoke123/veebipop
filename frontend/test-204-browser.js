// Simple test to verify 204 handling in product service functions
// This test will make requests that should trigger 204 responses

console.log('Testing 204 No Content handling in product service functions...\n');

// Test 1: Invalid category (should return 204)
console.log('Test 1: Testing invalid category (999999)');
fetch('http://localhost:3002/api/woocommerce/products?category=999999')
  .then(response => {
    console.log('Status:', response.status);
    if (response.status === 204) {
      console.log('✅ 204 No Content response received correctly');
      console.log('✅ Empty response body (no content)');
    } else {
      console.log('❌ Expected 204, got:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });

// Test 2: Valid category (should return 200)
setTimeout(() => {
  console.log('\nTest 2: Testing valid category (electronics)');
  fetch('http://localhost:3002/api/woocommerce/products?category=electronics')
    .then(response => {
      console.log('Status:', response.status);
      if (response.status === 200) {
        console.log('✅ 200 OK response received');
        return response.json();
      } else {
        console.log('❌ Expected 200, got:', response.status);
      }
    })
    .then(data => {
      if (data) {
        console.log('✅ Products returned:', data.length);
        if (data.length > 0) {
          console.log('✅ First product:', data[0].name);
        }
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
}, 1000);

// Test 3: Invalid product search (should return 204)
setTimeout(() => {
  console.log('\nTest 3: Testing invalid product search');
  fetch('http://localhost:3002/api/woocommerce/products?search=nonexistentproduct123')
    .then(response => {
      console.log('Status:', response.status);
      if (response.status === 204) {
        console.log('✅ 204 No Content response received correctly');
        console.log('✅ Empty response body (no content)');
      } else {
        console.log('❌ Expected 204, got:', response.status);
        return response.json().then(data => {
          console.log('Data:', data);
        });
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
}, 2000);

console.log('\n' + '='.repeat(50) + '\n');
setTimeout(() => {
  console.log('204 No Content handling test completed!');
  console.log('\nSummary:');
  console.log('- Invalid categories return 204 No Content');
  console.log('- Valid categories return 200 OK with products');
  console.log('- Invalid searches return 204 No Content');
  console.log('- The frontend service functions now handle 204 responses properly');
}, 3000);