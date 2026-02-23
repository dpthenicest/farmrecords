// Simple test to check if the API is working
async function testAnimalsAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/animals');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAnimalsAPI();