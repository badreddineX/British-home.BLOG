# British Home Interior Blog

## Project Overview

Astro static site blog for **britishhomeinterior.co.uk** — UK home decor content.

- Framework: Astro 7 (ESM, `astro.config.mjs`)
- Site URL: `https://britishhomeinterior.co.uk`
- Integrations: `@astrojs/sitemap`, `@astrojs/rss`

## Key Commands

```bash
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview build
```

## Directory Structure

```
src/
  components/
    BlogPost.astro      # blog post card component
    CookieConsent.astro
    FAQ.astro
    Footer.astro
    Header.astro
    SEO.astro
    TLDRBox.astro
  layouts/             # page layout wrappers
  content/
    blog/              # 30 markdown blog posts (.md)
  pages/
    index.astro
    about.astro
    404.astro
    privacy-policy.astro
    terms-of-use.astro
    rss.xml.js
    blog/
      index.astro      # blog listing page
      [slug].astro     # dynamic blog post route
  styles/
    global.css
public/
  images/
  favicon.svg
  logo.svg
  robots.txt
api/
  subscribe.js         # newsletter subscribe endpoint
```

## Blog Content

30 UK home decor posts in `src/content/blog/`. Topics include:
- Room-specific (bedroom, living room, kitchen, hallway)
- Style-specific (cottagecore, maximalist, dark moody, victorian terrace)
- Budget/practical (rented flat, budget makeover)
- Seasonal (autumn, christmas, spring, winter)

## Config Notes

- Redirect: `/blog/cosy-bedroom-decor-ideas-uk` → `/blog/cosy-bedroom-ideas-uk`
- Sitemap excludes 404 pages
- Dev branch: `claude/space-work-folder-ql3uoh`
