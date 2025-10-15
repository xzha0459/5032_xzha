// Test script for the chatbot function
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock test function
async function testChatbot() {
  console.log('Testing chatbot function...');

  // Check if Gemini API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in environment variables');
    console.log('Please set GEMINI_API_KEY in your .env file');
    return;
  }

  console.log('✅ GEMINI_API_KEY found');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('✅ Gemini AI initialized successfully');

    // Test a simple message
    const result = await model.generateContent('Hello, I need some mental health support.');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Test message sent and response received:');
    console.log('Response:', text.substring(0, 100) + '...');

  } catch (error) {
    console.log('❌ Error testing Gemini API:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testChatbot();
}

module.exports = { testChatbot };
