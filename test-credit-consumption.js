/**
 * Test script for the new output-based credit consumption system
 * This tests the /api/deduct-credits endpoint with dynamic parameters
 */

const API_BASE = 'http://localhost:3000';

async function testCreditDeduction() {
  console.log('🧪 Testing Dynamic Credit Consumption System\n');

  // Test 1: Text Generation Credit Deduction
  console.log('1️⃣ Testing Text Generation Credit Deduction');
  try {
    const textResponse = await fetch(`${API_BASE}/api/deduct-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        operation: 'textGeneration',
        tokens: 1500, // 1.5 credits at 1 credit per 1000 tokens
        description: 'AI text generation: 1500 tokens',
      })
    });

    if (textResponse.ok) {
      const textResult = await textResponse.json();
      console.log('✅ Text Generation Test:', textResult);
    } else {
      console.log('❌ Text Generation Test Failed:', await textResponse.text());
    }
  } catch (error) {
    console.log('❌ Text Generation Test Error:', error.message);
  }

  console.log('');

  // Test 2: Image Generation Credit Deduction  
  console.log('2️⃣ Testing Image Generation Credit Deduction');
  try {
    const imageResponse = await fetch(`${API_BASE}/api/deduct-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        operation: 'imageGeneration',
        width: 1024,
        height: 1024,
        quality: 'high',
        description: 'AI image generation (1024x1024, high quality)',
      })
    });

    if (imageResponse.ok) {
      const imageResult = await imageResponse.json();
      console.log('✅ Image Generation Test:', imageResult);
    } else {
      console.log('❌ Image Generation Test Failed:', await imageResponse.text());
    }
  } catch (error) {
    console.log('❌ Image Generation Test Error:', error.message);
  }

  console.log('');

  // Test 3: Character-based Fallback
  console.log('3️⃣ Testing Character-based Fallback');
  try {
    const charResponse = await fetch(`${API_BASE}/api/deduct-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        operation: 'textGeneration',
        characters: 2000, // 1 credit at 0.5 credits per 1000 characters
        description: 'AI text generation: 2000 characters (fallback)',
      })
    });

    if (charResponse.ok) {
      const charResult = await charResponse.json();
      console.log('✅ Character Fallback Test:', charResult);
    } else {
      console.log('❌ Character Fallback Test Failed:', await charResponse.text());
    }
  } catch (error) {
    console.log('❌ Character Fallback Test Error:', error.message);
  }

  console.log('\n🎯 Credit Consumption Testing Complete!');
  console.log('Expected Results:');
  console.log('• Text (1500 tokens): ~2 credits (1.5 rounded up)');
  console.log('• Image (1024x1024 high): ~8 credits (2 base + 3 per MP + 2x quality)');
  console.log('• Characters (2000): ~1 credit (0.5 * 2 = 1)');
}

// Run the test
testCreditDeduction().catch(console.error);
