/**
 * Quick Microservices Health Test
 */

const http = require('http');

const SERVICES = {
  'Auth (5001)': 'http://localhost:5001/health',
  'User (5002)': 'http://localhost:5002/health',
  'Product (5003)': 'http://localhost:5003/health',
  'Provider (5004)': 'http://localhost:5004/health',
  'Trust (5005)': 'http://localhost:5005/health',
  'Message (5006)': 'http://localhost:5006/health',
  'Notification (5007)': 'http://localhost:5007/health'
};

async function testService(name, url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ name, status: '✓', code: res.statusCode });
        } catch (e) {
          resolve({ name, status: '✗', error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', () => {
      resolve({ name, status: '✗', error: 'Connection failed' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name, status: '✗', error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('\n🧪 MICROSERVICES HEALTH CHECK\n');
  
  const results = await Promise.all(
    Object.entries(SERVICES).map(([name, url]) => testService(name, url))
  );

  let passed = 0;
  let failed = 0;

  results.forEach(result => {
    if (result.status === '✓') {
      console.log(`✓ ${result.name.padEnd(25)} - OK (${result.code})`);
      passed++;
    } else {
      console.log(`✗ ${result.name.padEnd(25)} - FAILED (${result.error})`);
      failed++;
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
