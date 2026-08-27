import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faqItem = z.object({ q: z.string(), a: z.string() });

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    datePublished: z.string(),
    dateModified: z.string(),
    author: z.string().default('British Home Interior'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    category: z.string().default('Interiors'),
    readTime: z.string().default('5 min read'),
    excerpt: z.string().optional(),
    tldr: z.array(z.string()).default([]),
    faqs: z.array(faqItem).default([]),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

// Weekly-idea queue for the newsletter. One .md file per idea: frontmatter
// below, body = the ~150-word tip. They go out in `order` sequence, one per
// weekly email, and are never re-sent.
const ideas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ideas' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    price: z.string().optional(),          // e.g. "£20" — shown as a badge
    image: z.string().optional(),          // /images/... (card variant used automatically)
    relatedPost: z.string().optional(),    // blog slug for the "The full guide →" link
  }),
});

export const collections = { blog, ideas };
