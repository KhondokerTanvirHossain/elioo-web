import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';

export function htmlPath(path: string, root = 'dist'): string {
  const clean = path.replace(/^\/|\/$/g, '');
  if (clean.endsWith('.html')) return join(root, clean);
  return clean === '' ? join(root, 'index.html') : join(root, clean, 'index.html');
}
export function exists(path: string, root = 'dist'): boolean {
  return existsSync(htmlPath(path, root));
}
export function page(path: string, root = 'dist'): Document {
  return parseHTML(readFileSync(htmlPath(path, root), 'utf8')).document as unknown as Document;
}
export function htmlFiles(root = 'dist'): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.html')) out.push(p);
    }
  };
  walk(root);
  return out;
}
export function allHtml(root = 'dist'): string {
  return htmlFiles(root).map((f) => readFileSync(f, 'utf8')).join('\n');
}
