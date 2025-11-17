// Test script to verify 204 No Content handling in product service functions
const fetch = require('node-fetch');

async function test204Handling() {
  console.log('Testing 204 No Content handling...\n');
  
  // Test 1: Invalid category (should return 204)
  console.log('Test 1: Invalid category (999999)');
  try {
    const response = await fetch('http://localhost:3002/api/woocommerce/products?category=999999');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 204) {
      console.log('✅ 204 No Content response received correctly');
      console.log('✅ Empty response body (no content)');
    } else {
      console.log('❌ Expected 204, got:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Valid category (should return products)
  console.log('Test 2: Valid category (electronics)');
  try {
    const response = await fetch('http://localhost:3002/api/woocommerce/products?category=electronics');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ 200 OK response received');
      console.log('✅ Products returned:', data.length);
      if (data.length > 0) {
        console.log('✅ First product:', data[0].name);
      }
    } else {
      console.log('❌ Expected 200, got:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Invalid product search (should return 204)
  console.log('Test 3: Invalid product search');
  try {
    const response = await fetch('http://localhost:3002/api/woocommerce/products?search=nonexistentproduct123');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 204) {
      console.log('✅ 204 No Content response received correctly');
      console.log('✅ Empty response body (no content)');
    } else {
      console.log('❌ Expected 204, got:', response.status);
      const data = await response.json();
      console.log('Data:', data);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('204 No Content handling test completed!');
}

// Run the test
test204Handling().catch(console.error);