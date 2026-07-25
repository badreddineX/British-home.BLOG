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
  },
});