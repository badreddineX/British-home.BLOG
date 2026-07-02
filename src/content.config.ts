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
  }),
});

export const collections = { blog };
