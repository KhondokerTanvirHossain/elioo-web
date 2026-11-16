// Pure blog helpers (no Astro imports, so they run under vitest).

export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  minutes: number;
}

export function isPublished(p: { data: { draft: boolean } }, env: { PROD: boolean } = { PROD: true }): boolean {
  return !(p.data.draft && env.PROD);
}

export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function sortNewestFirst<T extends { date: Date }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function relatedTo(slug: string, posts: PostSummary[]): PostSummary[] {
  return posts.filter((p) => p.tags.includes(slug));
}
