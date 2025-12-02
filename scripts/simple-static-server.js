const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const root = path.join(__dirname, '..', 'frontend');

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
    try {
    // Normalize URL and strip leading slashes so path.join doesn't drop `root`
    let reqPath = decodeURI(new URL(req.url, `http://localhost`).pathname || '/');
    if (reqPath === '/') reqPath = '/index.html';
    // Remove leading slashes to avoid path.join treating it as absolute
    const rel = reqPath.replace(/^[/\\]+/, '');

    // map to file under frontend directory and resolve to absolute paths
    const filePath = path.join(root, rel);
    const resolved = path.resolve(filePath);
    const resolvedRoot = path.resolve(root);

    // Prevent path traversal: require resolved starts with resolvedRoot
    if (!resolved.startsWith(resolvedRoot)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // If requesting a directory, serve index.html inside it
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        const indexFile = path.join(filePath, 'index.html');
        fs.access(indexFile, fs.constants.R_OK, (ie) => {
          if (ie) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            sendFile(indexFile, res);
          }
        });
        return;
      }

      // If file exists, serve it
      fs.access(filePath, fs.constants.R_OK, (e) => {
        if (!e) {
          if (req.method === 'HEAD') {
            const ext = path.extname(filePath).toLowerCase();
            const type = mime[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': type });
            res.end();
          } else {
            sendFile(filePath, res);
          }
        } else {
          // Fallback: try serving index.html for SPA routes
          const fallback = path.join(root, 'index.html');
          fs.access(fallback, fs.constants.R_OK, (fe) => {
            if (!fe) {
              res.writeHead(404);
              res.end('Not Found');
            } else {
              sendFile(fallback, res);
            }
          });
        }
      });
    });
  } catch (ex) {
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Simple static server serving ${root} on http://localhost:${PORT}`);
});

module.exports = server;
