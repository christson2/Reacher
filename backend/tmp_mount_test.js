const express = require('express');
const path = require('path');
try {
  const routes = require('./src/routes');
  console.log('routes loaded, type:', typeof routes, 'stackLen:', routes && routes.stack && routes.stack.length);
  const app = express();
  console.log('About to mount /api');
  app.use('/api', routes);
  console.log('Mounted /api successfully');
} catch (err) {
  console.error('Mount test failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}
