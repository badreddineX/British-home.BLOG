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
  redirects: {
    '/blog/cosy-bedroom-decor-ideas-uk': '/blog/cosy-bedroom-ideas-uk',
    // Cannibalization consolidation, 2026-07-29: merged near-duplicate/low-value
    // posts into their stronger sibling. Kitchen-budget cluster left untouched --
    // genuinely well-differentiated hub-and-spoke, not cannibalized.
    '/blog/rented-home-decor-ideas-uk': '/blog/rented-flat-makeover-uk',
    '/blog/living-room-budget-ideas-uk': '/blog/budget-home-makeover-uk',
    '/blog/living-room-ideas-uk': '/blog/how-to-style-a-living-room-uk',
    '/blog/small-flat-storage-ideas-uk': '/blog/small-bedroom-storage-uk',
    '/blog/maximalist-home-decor-uk': '/blog/maximalist-living-room-decor-uk',
  },
});
