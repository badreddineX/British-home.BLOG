# British Home Interior

Editorial blog for UK home styling and interiors — real homes, real budgets, UK retailers and pricing (no dollars-to-pounds guesswork). Covers period terraces, rented flats, and new-builds. Live at [britishhomeinterior.co.uk](https://britishhomeinterior.co.uk).

## Tech stack

- [Astro](https://astro.build) v7 (content collections in `src/content/blog`)
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) for sitemap generation
- Deployed on [Vercel](https://vercel.com)
- Inlined stylesheets (`build.inlineStylesheets: 'always'` in `astro.config.mjs`) instead of render-blocking `<link>` requests

## Project structure

```
src/
  content/blog/   # Blog post content (Markdown)
  components/      # Reusable Astro components
  layouts/         # Page layouts (incl. BlogPost.astro)
  pages/           # Route pages
  styles/          # Global styles
public/            # Static assets served as-is
pin-generator/      # Pinterest pin / Instagram asset generation
```

## Development

```bash
npm install
npm run dev        # local dev server
npm run build       # production build
npm run preview     # preview the production build locally
```

## Deployment

Deploys automatically on push to `main` via Vercel.
