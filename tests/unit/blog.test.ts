import { isPublished, readingMinutes, sortNewestFirst, relatedTo, type PostSummary } from '../../src/lib/blog';

const post = (slug: string, date: string, tags: string[] = []): PostSummary => ({
  slug, title: slug, description: slug, date: new Date(date), tags, minutes: 1,
});

test('drafts are hidden in production and shown in dev', () => {
  expect(isPublished({ data: { draft: true } }, { PROD: true })).toBe(false);
  expect(isPublished({ data: { draft: true } }, { PROD: false })).toBe(true);
  expect(isPublished({ data: { draft: false } }, { PROD: true })).toBe(true);
});
test('reading time is words / 220 rounded up, at least one minute', () => {
  expect(readingMinutes('word '.repeat(440))).toBe(2);
  expect(readingMinutes('word '.repeat(441))).toBe(3);
  expect(readingMinutes('')).toBe(1);
});
test('posts sort newest first', () => {
  const sorted = sortNewestFirst([post('old', '2026-10-20'), post('new', '2026-11-01')]);
  expect(sorted.map((p) => p.slug)).toEqual(['new', 'old']);
});
test('related posts are those tagged with the product slug', () => {
  const posts = [post('a', '2026-11-01'), post('b', '2026-10-20', ['medioo']), post('c', '2026-10-01', ['bolo'])];
  expect(relatedTo('medioo', posts).map((p) => p.slug)).toEqual(['b']);
});
