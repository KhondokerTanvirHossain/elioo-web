import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eliooo.org',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
