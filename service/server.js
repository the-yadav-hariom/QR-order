import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './src/config/index.js';
import { setCorsHeaders, handleCorsPreflight } from './src/middleware/cors.js';
import { logRequest } from './src/middleware/logger.js';
import { handleApiRoute } from './src/routes/apiRouter.js';
import { connectMongoDB } from './src/config/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Create main HTTP server
const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle CORS OPTIONS preflight
  if (handleCorsPreflight(req, res)) return;

  // Request logger
  logRequest(req, res);

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. API Routes
  if (pathname.startsWith('/api')) {
    try {
      await handleApiRoute(pathname, req.method, req, res);
    } catch (err) {
      console.error(`[API Error] ${req.method} ${pathname}:`, err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
    return;
  }

  // 2. Static File Serving (Built React app from client/dist)
  const distDir = config.clientDistDir;
  let targetFile = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

  // If the exact file exists in dist, serve it
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
    const ext = path.extname(targetFile).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    return fs.createReadStream(targetFile).pipe(res);
  }

  // Single Page Application (SPA) fallback to index.html in client/dist
  const spaFallback = path.join(distDir, 'index.html');
  if (fs.existsSync(spaFallback)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(spaFallback).pipe(res);
  }

  // Fallback if client is not built yet
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Zaika Service</title><style>body{font-family:sans-serif;background:#0f0f0f;color:#eee;padding:40px;text-align:center}a{color:#f25c2a}</style></head>
      <body>
        <h1>Zaika Backend Service</h1>
        <p>API is active at <a href="/api/state">/api/state</a> and <a href="/api/health">/api/health</a>.</p>
        <p>Please run <code>npm run build</code> in the <code>client/</code> directory to generate production assets.</p>
      </body>
    </html>
  `);
});

const PORT = config.port;
server.listen(PORT, async () => {
  console.log(`\n===============================================================`);
  console.log(`🚀 Zaika Restaurant Live System Backend is Online`);
  console.log(`---------------------------------------------------------------`);
  console.log(`🌐 Full Website:     http://localhost:${PORT}`);
  console.log(`📊 REST API State:   http://localhost:${PORT}/api/state`);
  console.log(`❤️  Health Check:    http://localhost:${PORT}/api/health`);
  console.log(`⚡ Real-time SSE:   http://localhost:${PORT}/api/events`);
  console.log(`📁 Database Store:   ${config.dataFile}`);
  console.log(`===============================================================\n`);

  // Optional: Connect to MongoDB if MONGODB_URI is provided in .env
  await connectMongoDB();
});
