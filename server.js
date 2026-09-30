/* Tiny dev server for local preview (safe to delete). */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if(u === '/') u = '/index.html';
  const fp = path.join(ROOT, u);
  if(!fp.startsWith(ROOT)){ s.writeHead(403); s.end(); return; }
  fs.readFile(fp, (e, d) => {
    if(e){ s.writeHead(404); s.end('not found'); return; }
    s.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    s.end(d);
  });
}).listen(8123, () => console.log('OFF-SCRIPT dev server → http://localhost:8123'));
