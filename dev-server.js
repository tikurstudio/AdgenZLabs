// dev-server.js - Local Development Server for Sifen Tekalign Portfolio
// Runs static website and Vercel Serverless endpoints locally on http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env automatically
if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env');
    console.log('✓ Loaded local .env variables');
  } catch (e) {
    console.log('Notice: .env file not found or already loaded');
  }
}

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // 1. Handle /api/* serverless functions
  if (pathname.startsWith('/api/')) {
    const apiName = pathname.replace('/api/', '').split('?')[0].replace(/\.js$/, '');
    const apiFile = path.join(__dirname, 'api', `${apiName}.js`);

    if (fs.existsSync(apiFile)) {
      try {
        delete require.cache[require.resolve(apiFile)];
        const handler = require(apiFile);

        // Helper mock for express-like res.status().json()
        let bodyBuffer = [];
        req.on('data', chunk => bodyBuffer.push(chunk));
        req.on('end', async () => {
          const rawBody = Buffer.concat(bodyBuffer).toString();
          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody);
            } catch (err) {
              req.body = rawBody;
            }
          } else {
            req.body = {};
          }

          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          try {
            await handler(req, res);
          } catch (handlerErr) {
            console.error('API Error in ' + apiName + ':', handlerErr);
            if (!res.writableEnded) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: handlerErr.message }));
            }
          }
        });
        return;
      } catch (err) {
        console.error('Failed to load API ' + apiName + ':', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Serverless execution error' }));
        return;
      }
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'API route not found' }));
      return;
    }
  }

  // 2. Handle static files
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to index.html for SPA routing
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🚀 Sifen Tekalign Portfolio running locally!`);
  console.log(`👉 Open: http://localhost:${PORT}`);
  console.log(`🔑 Web3Forms Key: ${process.env.WEB3FORMS_ACCESS_KEY ? 'Active' : 'Missing'}`);
  console.log(`🚪 Secret Gatekeeper Name: "${process.env.ADMIN_TRIGGER_NAME || 'Sifen Admin'}"`);
  console.log(`🚪 Secret Gatekeeper Email: "${process.env.ADMIN_TRIGGER_EMAIL || 'sifentekalig@gmail.com'}"`);
  console.log('==================================================');
});
