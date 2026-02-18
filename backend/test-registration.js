const axios = require('axios');

const testRegistration = async () => {
  const API_URL = 'http://localhost:5002/api/v1';
  
  console.log('🧪 Testing Registration Endpoint...');
  
  const testUser = {
    name: 'Test Student',
    email: 'test.student@sece.ac.in',
    password: 'test123',
    role: 'student',
    department: 'cse'
  };

  try {
    // Test if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5002/health');
    console.log('✅ Server is running:', healthResponse.data.message);

    // Test API v1 endpoint
    console.log('2. Testing API v1 endpoint...');
    const apiResponse = await axios.get(`${API_URL}`);
    console.log('✅ API v1 accessible:', apiResponse.data.message);

    // Test auth endpoint
    console.log('3. Testing auth test endpoint...');
    const authTestResponse = await axios.get(`${API_URL}/auth/test`);
    console.log('✅ Auth routes accessible:', authTestResponse.data.message);

    // Test registration
    console.log('4. Testing registration...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Registration successful:', registerResponse.data);

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    console.error('URL:', error.config?.url);
  }
};

testRegistration();