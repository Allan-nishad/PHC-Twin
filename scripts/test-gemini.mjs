import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Read .env.local if present
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
  if (match && match[1]) {
    apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
  }
}

console.log('\n=============================================');
console.log('🏥 PHC-Twin — Google Gemini 1.5 Flash Tester');
console.log('=============================================\n');

if (!apiKey) {
  console.log('⚠️  No GEMINI_API_KEY found in process.env or .env.local');
  console.log('\nTo connect live Google Gemini:');
  console.log('1. Get a free API key at: https://aistudio.google.com/app/apikey');
  console.log('2. Create a file named .env.local in this folder with:');
  console.log('   GEMINI_API_KEY=your_api_key_here');
  console.log('\n(Note: PHC-Twin automatically operates with full deterministic clinical intelligence when offline)\n');
  process.exit(0);
}

console.log(`🔑 Key found: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('📡 Sending test operational capability prompt to Gemini 1.5 Flash...\n');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const testPrompt = `
You are the Healthcare Capability Intelligence Engine for India's Primary Health Centre network.
Analyze a sample dependency outage:
- Facility: PHC Rampur (Sitapur, UP)
- Issue: Diagnostic lab technician absent, automated analyzers idle, 28 tests/day blocked.
- Donor Node: Sitapur Urban CHC (5.2 km away on NH-30, 3 technicians on duty).

Return a JSON with "status": "ONLINE", "recommendation": "your recommendation", "donorSafety": "your donor safeguard note".
`;

    const start = Date.now();
    const result = await model.generateContent(testPrompt);
    const duration = Date.now() - start;
    const responseText = result.response.text();

    console.log(`✅ SUCCESS! Received live response from Gemini 1.5 Flash in ${duration}ms\n`);
    console.log('--- Structured Response ---');
    console.log(JSON.stringify(JSON.parse(responseText), null, 2));
    console.log('\n=============================================');
    console.log('🎉 Google Gemini is FULLY WORKING in PHC-Twin!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error.message);
    console.log('\nPlease verify that your API key is valid and has Gemini 1.5 Flash enabled at https://aistudio.google.com/');
  }
}

testGemini();
