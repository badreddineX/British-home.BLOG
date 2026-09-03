import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Read each post's dateModified straight from frontmatter (no astro:content
// access is available here in the config file) so the sitemap can carry a
// real lastmod per URL -- it had none before, which gives Bing/Google nothing
// to prioritize a recrawl against after a content/code change.
const blogDir = fileURLToPath(new URL('./src/content/blog/', import.meta.url));
const postDates = {};
let mostRecentDate = '2026-01-01';
for (const file of readdirSync(blogDir)) {
  if (!file.endsWith('.md')) continue;
  const content = readFileSync(blogDir + file, 'utf-8');
  const match = content.match(/^dateModified:\s*"([^"]+)"/m);
  if (match) {
    const slug = file.replace(/\.md$/, '');
    postDates[slug] = match[1];
    if (match[1] > mostRecentDate) mostRecentDate = match[1];
  }
}

export default defineConfig({
  site: 'https://britishhomeinterior.co.uk',
  trailingSlash: 'always',
  // Inline all page stylesheets instead of shipping them as separate
  // render-blocking <link> requests (PSI flagged ~650ms wasted across two
  // small CSS files) -- total CSS is only a few KB, cheap to inline.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('/404/') &&
        !page.endsWith('/thank-you/') &&
        !page.includes('/newsletter-feed'),
      serialize(item) {
        const slug = item.url.replace('https://britishhomeinterior.co.uk/blog/', '').replace(/\/$/, '');
        if (postDates[slug]) {
          item.lastmod = postDates[slug];
        } else if (/\/blog(\/category\/[a-z-]+)?\/?$/.test(item.url) || item.url.replace(/\/$/, '') === 'https://britishhomeinterior.co.uk') {
          // homepage, /blog index, and category pages all surface/aggregate
          // recent posts, so their real freshness tracks the newest post
          item.lastmod = mostRecentDate;
        }
        return item;
      },
    }),
  ],
  // Consolidation redirects (cannibalization cleanup 2026-07-29) live in
  // vercel.json as real 301s — that's the single source of truth. They used to
  // be duplicated here too, which only generated dead meta-refresh stub pages
  // in dist. Removed 2026-09-03.
});
