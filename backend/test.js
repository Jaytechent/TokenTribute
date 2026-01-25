// Run this in your browser console or Node.js to test the Ethos API

const ETHOS_API_BASE = 'https://api.ethos.network/api/v2';

async function testEthosAPI() {
  console.log('🧪 Testing Ethos API endpoints...\n');

  const keywords = ['a', 'e', 'vitalik', 'ethereum'];

  for (const keyword of keywords) {
    console.log(`\n📍 Testing keyword: "${keyword}"`);
    console.log(`URL: ${ETHOS_API_BASE}/users/search?query=${keyword}&limit=10`);

    try {
      const response = await fetch(
        `${ETHOS_API_BASE}/users/search?query=${keyword}&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Error Response:`, error);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Response:`, data);

      if (data.data && Array.isArray(data.data)) {
        console.log(`Found ${data.data.length} users`);
        console.log('Sample user:', JSON.stringify(data.data[0], null, 2));
      } else if (Array.isArray(data)) {
        console.log(`Found ${data.length} users (direct array)`);
        console.log('Sample user:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('Unexpected response structure:', data);
      }

    } catch (error) {
      console.error(`❌ Fetch Error:`, error.message);
    }

    // Delay between requests
    await new Promise(r => setTimeout(r, 500));
  }
}

// Run the test
testEthosAPI();