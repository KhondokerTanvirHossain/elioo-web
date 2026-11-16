// Checks the built site: HTML validity, internal links that resolve, and required head tags.
// Usage: node scripts/check-dist.mjs [dir=dist]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { HtmlValidate, FileSystemConfigLoader } from 'html-validate';

const root = process.argv[2] ?? 'dist';
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(root);

const resolves = (href) => {
  const path = decodeURIComponent(href.split('#')[0].split('?')[0]);
  if (path === '' || path === '/') return existsSync(join(root, 'index.html'));
  const p = join(root, path);
  return existsSync(p) && statSync(p).isFile() ? true : existsSync(join(p, 'index.html'));
};

const problems = [];
const validator = new HtmlValidate(new FileSystemConfigLoader());
for (const file of files) {
  const rel = relative(root, file);
  const report = await validator.validateFile(file);
  for (const r of report.results) for (const m of r.messages) problems.push(`${rel}:${m.line}:${m.column} ${m.ruleId} ${m.message}`);
  const html = readFileSync(file, 'utf8');
  for (const [, attr] of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    if (!attr.startsWith('//') && !resolves(attr)) problems.push(`${rel} broken internal link ${attr}`);
  }
  for (const [name, re] of [['title', /<title>[^<]+<\/title>/], ['description', /<meta name="description" content="[^"]+"/], ['canonical', /<link rel="canonical" href="https:\/\/eliooo\.org\//]]) {
    if (!re.test(html)) problems.push(`${rel} missing ${name}`);
  }
}
for (const p of problems) console.log(p);
console.log(`check-dist: ${files.length} pages, ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
