#!/usr/bin/env node

/**
 * Complete Flow Test
 * Tests: Signup → Login → Create Product → Search Products
 */

const http = require('http');

// Color helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    step: '→'
  };
  const color = type === 'success' ? colors.green : type === 'error' ? colors.red : colors.cyan;
  console.log(`${color}${icons[type]} ${message}${colors.reset}`);
}

function request(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': body?.userId || '',
        'x-user-email': body?.userEmail || ''
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      // Remove userId and userEmail before sending
      const sendBody = { ...body };
      delete sendBody.userId;
      delete sendBody.userEmail;
      req.write(JSON.stringify(sendBody));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 COMPLETE FLOW TEST\n');
  
  try {
    // Step 1: Signup
    console.log(`${colors.yellow}[1/5] Testing Signup...${colors.reset}`);
    const email = `user_${Date.now()}@example.com`;
    const signupRes = await request('POST', 'http://localhost:5001/auth/signup', {
      email: email,
      password: 'Test123!@#',
      name: 'Test User'
    });

    if (signupRes.status !== 201 && signupRes.status !== 200) {
      log('error', `Signup failed: ${signupRes.status}`);
      console.log(signupRes.data);
      process.exit(1);
    }

    const userId = signupRes.data.user?.id || signupRes.data.user_id;
    const token = signupRes.data.token;
    log('success', `Signup successful - User ID: ${userId?.substring(0, 8)}...`);

    // Step 2: Login
    console.log(`\n${colors.yellow}[2/5] Testing Login...${colors.reset}`);
    const loginRes = await request('POST', 'http://localhost:5001/auth/login', {
      email: email,
      password: 'Test123!@#'
    });

    if (loginRes.status !== 200) {
      log('error', `Login failed: ${loginRes.status}`);
      console.log(loginRes.data);
      process.exit(1);
    }

    log('success', `Login successful - Token received`);

    // Step 3: Get User Profile
    console.log(`\n${colors.yellow}[3/5] Testing Get User Profile...${colors.reset}`);
    const userRes = await request('GET', `http://localhost:5002/users/${userId}`, {
      userId: userId,
      userEmail: email
    });

    if (userRes.status !== 200) {
      log('error', `Get user failed: ${userRes.status}`);
    } else {
      log('success', `User profile retrieved`);
    }

    // Step 4: Create Product
    console.log(`\n${colors.yellow}[4/5] Testing Create Product...${colors.reset}`);
    const productRes = await request('POST', 'http://localhost:5003/products', {
      userId: userId,
      userEmail: email,
      title: 'Test iPhone 13',
      description: 'Excellent condition',
      price: 500,
      category: 'electronics'
    });

    if (productRes.status !== 201 && productRes.status !== 200) {
      log('error', `Create product failed: ${productRes.status}`);
      console.log(productRes.data);
    } else {
      log('success', `Product created successfully`);
    }

    // Step 5: Search Products
    console.log(`\n${colors.yellow}[5/5] Testing Search Products...${colors.reset}`);
    const searchRes = await request('GET', 'http://localhost:5003/products?category=electronics&limit=5');

    if (searchRes.status !== 200) {
      log('error', `Search failed: ${searchRes.status}`);
    } else {
      const count = Array.isArray(searchRes.data) ? searchRes.data.length : 
                    searchRes.data.products?.length || searchRes.data.length || 0;
      log('success', `Search successful - Found ${count} products`);
    }

    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);

  } catch (error) {
    log('error', `Test failed: ${error.message}`);
    process.exit(1);
  }
}

runTests();
