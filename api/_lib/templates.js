// Plain, single-column HTML emails. No external images or CSS — keeps them out
// of spam folders and rendering the same everywhere.

const BRAND = 'British Home Interior';
const SITE = 'https://britishhomeinterior.co.uk';

// A physical mailing address in the footer is a UK PECR / CAN-SPAM nicety for
// bulk mail. Optional: shown if MAILING_ADDRESS is set, otherwise the footer
// just carries sender identification.
const MAILING_ADDRESS = process.env.MAILING_ADDRESS || '';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
}

function shell(bodyHtml, { unsubUrl } = {}) {
  const senderLine = MAILING_ADDRESS ? `${BRAND} · ${MAILING_ADDRESS}` : `${BRAND} · britishhomeinterior.co.uk`;
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#F3F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E2420;line-height:1.65">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4EF;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #D4D6CC">
        <tr><td style="padding:32px 36px">
          <p style="margin:0 0 24px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#B89A6A;font-weight:700">${BRAND}</p>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #E8EBE2;font-size:12px;color:#8a8f86">
          <p style="margin:0 0 6px">${senderLine}</p>
          <p style="margin:0">
            ${unsubUrl
              ? `You're receiving this because you confirmed your subscription at <a href="${SITE}" style="color:#B89A6A">britishhomeinterior.co.uk</a>. <a href="${unsubUrl}" style="color:#B89A6A">Unsubscribe</a>.`
              : `Sent by ${BRAND} · <a href="${SITE}" style="color:#B89A6A">britishhomeinterior.co.uk</a>`}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Tiny inline-markdown → HTML for the weekly-idea body (**bold**, [text](url),
// blank-line paragraphs).
function ideaBodyHtml(raw) {
  return String(raw || '')
    .trim()
    .split(/\n{2,}/)
    .map((para) => {
      const inner = esc(para.replace(/\s*\n\s*/g, ' '))
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#B89A6A">$1</a>');
      return `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#1E2420">${inner}</p>`;
    })
    .join('\n');
}

/**
 * The weekly email. Leads with the curated "idea of the week"; any new posts
 * published since the last send follow as a secondary section.
 * @param {{ idea?: object|null, posts?: Array, unsubUrl: string }} opts
 */
export function digestEmail({ idea = null, posts = [], unsubUrl }) {
  const subject = idea
    ? `${idea.title} — ${BRAND}`
    : posts.length === 1
      ? `New on ${BRAND}: ${posts[0].title}`
      : `${posts.length} new interior guides on ${BRAND}`;

  const ideaBlock = idea
    ? `
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#B89A6A;font-weight:700">The idea this week</p>
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1A2318">${esc(idea.title)}${idea.price ? ` <span style="font-family:-apple-system,sans-serif;font-size:12px;font-weight:600;color:#B89A6A;letter-spacing:.04em;white-space:nowrap">· ${esc(idea.price)}</span>` : ''}</h1>
    ${idea.image ? `<img src="${esc(idea.image)}" alt="" width="448" style="width:100%;max-width:448px;height:auto;border:1px solid #D4D6CC;display:block;margin:0 0 16px">` : ''}
    ${ideaBodyHtml(idea.body)}
    ${idea.relatedUrl ? `<p style="margin:14px 0 0"><a href="${esc(idea.relatedUrl)}" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#B89A6A;text-decoration:none">The full guide →</a></p>` : ''}
  `
    : '';

  const postCards = posts
    .map(
      (p) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td>
        ${p.image ? `<a href="${esc(p.url)}"><img src="${esc(p.image)}" alt="" width="448" style="width:100%;max-width:448px;height:auto;border:1px solid #D4D6CC;display:block;margin:0 0 12px"></a>` : ''}
        ${p.category ? `<p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#B89A6A">${esc(p.category)}</p>` : ''}
        <a href="${esc(p.url)}" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#1A2318;text-decoration:none;font-weight:bold">${esc(p.title)}</a>
        <p style="margin:6px 0 8px;font-size:14px;color:#5c6358">${esc(p.description)}</p>
        <a href="${esc(p.url)}" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#B89A6A;text-decoration:none">Read it →</a>
      </td></tr>
    </table>`
    )
    .join('\n');

  const postsBlock = posts.length
    ? `
    ${idea ? '<div style="border-top:1px solid #E8EBE2;margin:28px 0 24px"></div>' : ''}
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#B89A6A;font-weight:700">${idea ? 'Also new this week' : 'New this week'}</p>
    ${!idea ? `<p style="margin:0 0 20px;font-size:14px;color:#8a8f86">Fresh ${posts.length === 1 ? 'guide' : 'guides'} for UK homes, flats, and Victorian terraces — British English, in pounds.</p>` : '<div style="height:12px"></div>'}
    ${postCards}
  `
    : '';

  const html = shell(
    `${ideaBlock}${postsBlock}
    <p style="margin:24px 0 0;font-size:14px">Browse everything at <a href="${SITE}/blog/" style="color:#B89A6A">britishhomeinterior.co.uk/blog</a>.</p>`,
    { unsubUrl }
  );

  const text = [
    idea ? `THE IDEA THIS WEEK: ${idea.title}${idea.price ? ` (${idea.price})` : ''}` : null,
    idea ? '' : null,
    idea ? String(idea.body || '').trim() : null,
    idea && idea.relatedUrl ? `\nFull guide: ${idea.relatedUrl}` : null,
    posts.length ? `\n${idea ? 'ALSO NEW THIS WEEK' : 'NEW THIS WEEK'}:` : null,
    ...posts.map((p) => `• ${p.title}\n  ${p.url}`),
    '',
    `Browse everything: ${SITE}/blog/`,
    `Unsubscribe: ${unsubUrl}`,
  ]
    .filter((l) => l !== null)
    .join('\n');

  return { subject, html, text, listUnsubscribe: unsubUrl };
}

export function confirmEmail({ confirmUrl }) {
  const subject = `Confirm your ${BRAND} subscription`;
  const html = shell(`
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1A2318">One quick step</h1>
    <p style="margin:0 0 16px;font-size:15px">Tap the button below to confirm you'd like the weekly ${BRAND} email — cosy styling and room makeover ideas for UK homes, in British English and pounds.</p>
    <p style="margin:0 0 24px">
      <a href="${confirmUrl}" style="display:inline-block;background:#B89A6A;color:#ffffff;text-decoration:none;padding:13px 28px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Confirm subscription</a>
    </p>
    <p style="margin:0;font-size:13px;color:#8a8f86">If the button doesn't work, paste this link into your browser:<br>
      <a href="${confirmUrl}" style="color:#B89A6A;word-break:break-all">${confirmUrl}</a></p>
    <p style="margin:16px 0 0;font-size:13px;color:#8a8f86">Didn't sign up? Just ignore this email — no subscription is created until you confirm.</p>
  `);
  const text = [
    `Confirm your ${BRAND} subscription`,
    '',
    `Tap to confirm you'd like the weekly ${BRAND} email:`,
    confirmUrl,
    '',
    `Didn't sign up? Ignore this email — nothing happens until you confirm.`,
  ].join('\n');
  return { subject, html, text };
}

export function welcomeEmail({ unsubUrl }) {
  const subject = `You're in — welcome to ${BRAND}`;
  const html = shell(`
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1A2318">You're on the list</h1>
    <p style="margin:0 0 16px;font-size:15px">Thanks for confirming. Each week you'll get honest styling and room-makeover ideas for real British homes — no fluff, prices in pounds.</p>
    <p style="margin:0 0 16px;font-size:15px">While you wait for the first issue, a few reader favourites:</p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:15px">
      <li style="margin-bottom:6px"><a href="${SITE}/blog/how-to-style-a-living-room-uk/" style="color:#B89A6A">How to style a living room</a></li>
      <li style="margin-bottom:6px"><a href="${SITE}/blog/budget-home-makeover-uk/" style="color:#B89A6A">Budget home makeover ideas</a></li>
      <li style="margin-bottom:6px"><a href="${SITE}/blog/cosy-bedroom-ideas-uk/" style="color:#B89A6A">Cosy bedroom ideas</a></li>
    </ul>
    <p style="margin:0;font-size:15px">— ${BRAND}</p>
  `, { unsubUrl });
  const text = [
    `You're on the list — welcome to ${BRAND}.`,
    '',
    `Each week: honest styling and room-makeover ideas for real British homes. Prices in pounds, no fluff.`,
    '',
    `Reader favourites:`,
    `- ${SITE}/blog/how-to-style-a-living-room-uk/`,
    `- ${SITE}/blog/budget-home-makeover-uk/`,
    `- ${SITE}/blog/cosy-bedroom-ideas-uk/`,
    '',
    `Unsubscribe anytime: ${unsubUrl}`,
  ].join('\n');
  return { subject, html, text, listUnsubscribe: unsubUrl };
}
