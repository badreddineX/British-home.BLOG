import { getCollection } from 'astro:content';

// Machine-readable feed consumed by the newsletter broadcast job
// (api/broadcast.js): recent posts + the weekly-idea queue. Public, but only
// exposes what's already on the blog.
export async function GET(context) {
  const site = context.site?.toString().replace(/\/$/, '') || 'https://britishhomeinterior.co.uk';

  const cardImg = (img) =>
    img && !img.startsWith('http')
      ? `${site}${img.replace('/images/', '/images/card/').replace(/\.(jpe?g|png)$/i, '.webp')}`
      : img || null;

  const posts = (await getCollection('blog'))
    .sort((a, b) => new Date(b.data.datePublished) - new Date(a.data.datePublished))
    .slice(0, 25)
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      url: `${site}/blog/${post.id}/`,
      image: cardImg(post.data.image),
      category: post.data.category || 'Interiors',
      datePublished: post.data.datePublished,
      dateModified: post.data.dateModified,
    }));

  let ideas = [];
  try {
    ideas = (await getCollection('ideas'))
      .sort((a, b) => a.data.order - b.data.order)
      .map((idea) => ({
        slug: idea.id,
        order: idea.data.order,
        title: idea.data.title,
        body: idea.body?.trim() || '',
        price: idea.data.price || null,
        image: cardImg(idea.data.image),
        relatedUrl: idea.data.relatedPost ? `${site}/blog/${idea.data.relatedPost}/` : null,
      }));
  } catch {
    // No ideas collection yet — fine, runs post-only.
  }

  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), posts, ideas }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
