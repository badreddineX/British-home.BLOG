/**
 * Sätteri hast plugin — automatically add rel="sponsored noopener" and
 * target="_blank" to every outbound affiliate link (amzn.to, amazon.co.uk).
 */

const AFFILIATE_HOSTS = ['amzn.to', 'link.amazon', 'amazon.co.uk'];

/** @type {import('satteri').HastPluginDefinition} */
const affiliateLinksPlugin = {
  name: 'rehype-affiliate-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (!href) return;

      const isAffiliate = AFFILIATE_HOSTS.some(
        (host) => href.includes(`://${host}/`) || href.includes(`://${host}`)
      );
      if (!isAffiliate) return;

      const existing = Array.isArray(node.properties.rel)
        ? node.properties.rel
        : node.properties.rel
          ? [node.properties.rel]
          : [];
      const relSet = new Set(existing.filter(Boolean));
      relSet.add('sponsored');
      relSet.add('noopener');

      ctx.setProperty(node, 'rel', [...relSet]);
      ctx.setProperty(node, 'target', '_blank');
    },
  },
};

export default affiliateLinksPlugin;
