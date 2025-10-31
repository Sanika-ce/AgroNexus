// test-hf.js
require('dotenv').config();
const axios = require('axios');

async function testHF() {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      { inputs: "Hello, how are you?" },
      { headers: { 'Authorization': `Bearer ${process.env.HF_API_KEY}` } }
    );
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testHF();