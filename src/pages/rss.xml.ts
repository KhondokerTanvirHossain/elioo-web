import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'elioo',
    description: site.description,
    site: context.site ?? 'https://eliooo.org',
    items: posts.map((p) => ({ title: p.title, description: p.description, pubDate: p.date, link: `/blog/${p.slug}` })),
  });
}
