import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  const sorted = posts.sort(
    (a, b) => new Date(b.data.datePublished).getTime() - new Date(a.data.datePublished).getTime()
  );

  return rss({
    title: 'British Home Interior',
    description: 'British home interior styling and room makeovers for UK homes, flats, and Victorian terraces.',
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.datePublished,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-gb</language>`,
  });
}
