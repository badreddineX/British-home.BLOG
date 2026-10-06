const AFFILIATE_HOSTS = ['amzn.to', 'link.amazon', 'amazon.co.uk'];

/** @type {import('satteri').HastPluginDefinition} */
const affiliateLinksPlugin = {
  name: 'rehype-affiliate-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (!href) return;
      if (!AFFILIATE_HOSTS.some((h) => href.includes(`://${h}/`) || href.includes(`://${h}`))) return;

      const existing = Array.isArray(node.properties.rel) ? node.properties.rel : node.properties.rel ? [node.properties.rel] : [];
      const relSet = new Set(existing.filter(Boolean));
      relSet.add('sponsored');
      relSet.add('noopener');
      ctx.setProperty(node, 'rel', [...relSet]);
      ctx.setProperty(node, 'target', '_blank');
    },
  },
};

export default affiliateLinksPlugin;
