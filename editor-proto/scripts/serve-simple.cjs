#!/usr/bin/env node
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = Number(process.argv[2] || process.env.PORT || 5192);

const distDir = path.resolve(__dirname, '..', 'dist');
const hasDist = fs.existsSync(distDir) && fs.statSync(distDir).isDirectory();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8'
};

const projectRoot = path.resolve(__dirname, '..');
const urlFile = path.join(projectRoot, 'preview-url.txt');
const pidFile = path.join(projectRoot, `serve-simple-${port}.pid`);
const readyFile = path.join(projectRoot, `serve-simple-${port}.ready`);
const hbFile = path.join(projectRoot, `serve-simple-${port}.hb`);
const startupLog = path.join(projectRoot, 'serve-simple-startup.log');

function safeWrite(file, data) {
  try { fs.writeFileSync(file, data); } catch (_) {}
}

const server = http.createServer((req, res) => {
  const u = url.parse(req.url, true);
  if (u.pathname === '/healthz' || u.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (hasDist) {
    let pathname = decodeURIComponent(u.pathname || '/');
    if (pathname.endsWith('/')) pathname += 'index.html';
    const safePath = path.normalize(path.join(distDir, pathname));
    if (!safePath.startsWith(distDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    fs.readFile(safePath, (err, data) => {
      if (err) {
        const indexPath = path.join(distDir, 'index.html');
        fs.readFile(indexPath, (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': mime['.html'] });
          res.end(data2);
        });
        return;
      }
      const ext = path.extname(safePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><html><body><h1>Novel Editor Preview (simple)</h1><p>Server is running on ' + port + '</p><p>Try: <a href="/healthz">/healthz</a></p></body></html>');
});

server.on('error', (err) => {
  try { console.error('[serve-simple] server error:', err); } catch (_) {}
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  const urlText = 'http://127.0.0.1:' + port;
  console.log('[serve-simple] listening on ' + urlText + (hasDist ? ' (serving dist/)' : ''));
  safeWrite(urlFile, urlText + '\n');
  safeWrite(pidFile, String(process.pid));
  safeWrite(readyFile, String(Date.now()));
  try { fs.appendFileSync(startupLog, new Date().toISOString() + ' up pid=' + process.pid + ' url=' + urlText + '\n'); } catch (_) {}
});

// heartbeat
const hbTimer = setInterval(() => {
  safeWrite(hbFile, String(Date.now()));
}, 5000);

function cleanup() {
  try { clearInterval(hbTimer); } catch (_) {}
  try { fs.unlinkSync(pidFile); } catch (_) {}
  try { fs.unlinkSync(hbFile); } catch (_) {}
}

process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
process.on('exit', () => { cleanup(); });
process.on('uncaughtException', (e) => { try { console.error('[serve-simple] uncaughtException', e); } catch (_) {} });
process.on('unhandledRejection', (e) => { try { console.error('[serve-simple] unhandledRejection', e); } catch (_) {} });
