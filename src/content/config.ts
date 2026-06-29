import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    datePublished: z.string(),
    dateModified: z.string(),
    author: z.string().default('British Home Interior'),
    tags: z.array(z.string()).default([]),
    category: z.string().default('Interiors'),
    readTime: z.string().default('5 min read'),
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };
