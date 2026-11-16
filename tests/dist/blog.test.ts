import { readFileSync } from 'node:fs';
import { page, exists } from './helpers';

describe('with no posts (dist)', () => {
  test('/blog still builds with an empty state and no rss link', () => {
    const d = page('/blog');
    expect(d.querySelector('.e-empty')?.textContent).toContain('No posts yet.');
    expect(d.querySelector('link[type="application/rss+xml"]')).toBeNull();
  });
  test('rss.xml exists with no items', () => {
    expect(readFileSync('dist/rss.xml', 'utf8')).not.toContain('<item>');
  });
});

describe('with fixture posts (dist-fixtures)', () => {
  const R = 'dist-fixtures';
  test('/blog lists published posts newest first and leaves out drafts', () => {
    const slugs = [...page('/blog', R).querySelectorAll('.e-post')].map((a) => a.getAttribute('href'));
    expect(slugs).toEqual(['/blog/first-post', '/blog/medioo-notes']);
    expect(exists('/blog/draft', R)).toBe(false);
  });
  test('a post page has its title, date, reading time and neighbours', () => {
    const d = page('/blog/first-post', R);
    expect(d.querySelector('h1')?.textContent?.trim()).toBe('First post');
    expect(d.querySelector('time[datetime="2026-11-01"]')).not.toBeNull();
    expect(d.querySelector('.e-post-meta')?.textContent).toContain('min read');
    expect(d.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/blog/medioo-notes');
  });
  test('home shows the teaser and the nav links to the blog', () => {
    const d = page('/', R);
    expect(d.querySelectorAll('.e-posts .e-post').length).toBe(2);
    expect(d.querySelector('nav a[href="/blog"]')).not.toBeNull();
  });
  test('the medioo page lists its related post', () => {
    const hrefs = [...page('/medioo', R).querySelectorAll('.e-related .e-post')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/blog/medioo-notes']);
  });
  test('rss has two items and is linked from pages', () => {
    expect(readFileSync(`${R}/rss.xml`, 'utf8').match(/<item>/g)?.length).toBe(2);
    expect(page('/blog', R).querySelector('link[type="application/rss+xml"]')).not.toBeNull();
  });
});

test('a product video has native controls in the HTML (no-JS) and a hidden enhance button', () => {
  const d = page('/', 'dist-fixtures');
  const v = d.querySelector('#product-medioo video')!;
  expect(v.hasAttribute('controls')).toBe(true);
  expect(v.querySelector('source[src="/video/medioo.mp4"]')).not.toBeNull();
  expect(d.querySelector('#product-medioo .e-video__play')).not.toBeNull();
});
