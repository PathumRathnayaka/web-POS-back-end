/**
 * Quick test script to verify auth endpoint
 * Run with: node test-auth.js
 */
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testAuth() {
  console.log('Testing auth endpoint...');
  console.log('API URL:', API_URL);
  
  try {
    // Test login endpoint
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '12345678'
      }),
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login endpoint is working!');
    } else {
      console.log('❌ Login endpoint returned error');
    }
  } catch (error) {
    console.error('❌ Error testing auth endpoint:', error.message);
    console.log('\nMake sure the backend server is running:');
    console.log('  cd web-POS-back-end');
    console.log('  npm start');
  }
}

testAuth();



