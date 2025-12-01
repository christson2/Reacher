const express = require('express');
const path = require('path');
try {
  const app = express();
  const routes = require('./src/routes');
  console.log('mounted /api');
  app.use('/api', routes);
  const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
  console.log('about to app.use static', FRONTEND_DIR);
  app.use(express.static(FRONTEND_DIR));
  console.log('about to register /pages/:file');
  app.get('/pages/:file', (req, res) => {});
  console.log('about to register *');
  // inspect registered layers
  const layers = app._router && app._router.stack ? app._router.stack : [];
  console.log('Layers count:', layers.length);
  layers.forEach((layer, i) => {
    if (layer.route) {
      const paths = layer.route.path;
      console.log(i, 'route', paths, Object.keys(layer.route.methods));
    } else if (layer.name === 'serveStatic') {
      console.log(i, 'static middleware', layer.regexp && layer.regexp.source);
    } else {
      console.log(i, 'middleware', layer.name, layer.regexp && layer.regexp.source);
    }
  });
  app.get('*', (req, res) => {});
  console.log('all registrations done');
} catch (err) {
  console.error('INIT FAIL', err && err.stack ? err.stack : err);
}
