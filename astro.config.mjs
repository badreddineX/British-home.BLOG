import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://britishhomeinterior.co.uk',
  trailingSlash: 'always',
  // Inline all page stylesheets instead of shipping them as separate
  // render-blocking <link> requests (PSI flagged ~650ms wasted across two
  // small CSS files) -- total CSS is only a few KB, cheap to inline.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/thank-you/'),
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