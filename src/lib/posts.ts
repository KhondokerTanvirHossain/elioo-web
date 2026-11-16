// Astro-side access to the blog collection.
import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished, readingMinutes, type PostSummary } from './blog';

export type PostEntry = CollectionEntry<'blog'>;

export async function getPublishedEntries(): Promise<PostEntry[]> {
  const all = await getCollection('blog', (p) => isPublished(p, { PROD: import.meta.env.PROD }));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function toSummary(e: PostEntry): PostSummary {
  return {
    slug: e.id,
    title: e.data.title,
    description: e.data.description,
    date: e.data.date,
    tags: e.data.tags,
    minutes: readingMinutes(e.body ?? ''),
  };
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  return (await getPublishedEntries()).map(toSummary);
}
