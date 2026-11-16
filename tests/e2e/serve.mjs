// Minimal static server for e2e runs: node tests/e2e/serve.mjs <dir> <port>
// Serves <path>/index.html for directories, <path>.html, and 404.html with status 404.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const [dir = 'dist', port = '4321'] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(dir, path), join(dir, path, 'index.html'), join(dir, `${path}.html`)];
  for (const c of candidates) {
    if (await isFile(c)) {
      res.writeHead(200, { 'Content-Type': types[extname(c)] ?? 'application/octet-stream' });
      return res.end(await readFile(c));
    }
  }
  res.writeHead(404, { 'Content-Type': types['.html'] });
  res.end(await readFile(join(dir, '404.html')).catch(() => 'Not found'));
}).listen(Number(port), () => console.log(`serving ${dir} on ${port}`));
