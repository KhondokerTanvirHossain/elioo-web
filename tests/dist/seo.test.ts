import { readFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { htmlFiles, page } from './helpers';

describe.each(htmlFiles('dist'))('%s', (file) => {
  const d = parseHTML(readFileSync(file, 'utf8')).document;
  test('has title, description, canonical and og:image', () => {
    expect(d.querySelector('title')?.textContent?.length).toBeGreaterThan(0);
    expect(d.querySelector('meta[name="description"]')?.getAttribute('content')?.length).toBeGreaterThan(20);
    expect(d.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/^https:\/\/eliooo\.org\//);
    expect(d.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/^https:\/\/eliooo\.org\/.+\.png$/);
  });
});

test('home has Organization and Person structured data', () => {
  const ld = [...page('/').querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!));
  const types = ld.map((x) => x['@type']);
  expect(types).toContain('Organization');
  const person = ld.find((x) => x['@type'] === 'Person');
  expect(person.name).toBe('Tanvir Hossain');
  expect(person.sameAs).toEqual(expect.arrayContaining([
    'https://github.com/KhondokerTanvirHossain', 'https://www.linkedin.com/in/k-tanvir-hossain/', 'https://tanvir.eliooo.org',
  ]));
});
test('404 page links home and to the four products', () => {
  const d = parseHTML(readFileSync('dist/404.html', 'utf8')).document;
  const hrefs = [...d.querySelectorAll('main a')].map((a) => a.getAttribute('href'));
  expect(hrefs).toEqual(expect.arrayContaining(['/', '/medioo', '/bolo', '/finioo', '/intellidrugs']));
  expect(d.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
});
test('robots.txt points at the sitemap, and the sitemap exists', () => {
  expect(readFileSync('dist/robots.txt', 'utf8')).toContain('Sitemap: https://eliooo.org/sitemap-index.xml');
  expect(existsSync('dist/sitemap-index.xml')).toBe(true);
});
test('the default og image is 1200x630 png', () => {
  const b = readFileSync('dist/og.png');
  expect(b.subarray(1, 4).toString()).toBe('PNG');
  expect(b.readUInt32BE(16)).toBe(1200);
  expect(b.readUInt32BE(20)).toBe(630);
});
