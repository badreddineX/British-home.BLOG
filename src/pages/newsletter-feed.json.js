import { getCollection } from 'astro:content';

// Machine-readable post list consumed by the newsletter broadcast job
// (api/broadcast.js). Richer than rss.xml (carries image + category) and
// stable to parse. Public, but it only exposes what's already on the blog.
export async function GET(context) {
  const posts = await getCollection('blog');
  const sorted = posts.sort(
    (a, b) => new Date(b.data.datePublished).getTime() - new Date(a.data.datePublished).getTime()
  );

  const site = context.site?.toString().replace(/\/$/, '') || 'https://britishhomeinterior.co.uk';
  const cardImg = (img) =>
    img && !img.startsWith('http')
      ? `${site}${img.replace('/images/', '/images/card/').replace(/\.(jpe?g|png)$/i, '.webp')}`
      : img || null;

  const body = {
    generatedAt: new Date().toISOString(),
    posts: sorted.slice(0, 25).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      url: `${site}/blog/${post.id}/`,
      image: cardImg(post.data.image),
      category: post.data.category || 'Interiors',
      datePublished: post.data.datePublished,
      dateModified: post.data.dateModified,
    })),
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
