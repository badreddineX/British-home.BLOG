// Shared helpers for the newsletter API routes.

/** RFC-5322-lite check — good enough to reject typos and junk, not a spec parser. */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const e = email.trim();
  if (e.length < 5 || e.length > 254) return false;
  return /^[^\s@"']+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function normalizeEmail(email) {
  return String(email == null ? '' : email).trim().toLowerCase();
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

/** A 64-char lowercase-hex token is the only shape our confirm/unsub routes accept. */
export function isValidToken(t) {
  return typeof t === 'string' && /^[a-f0-9]{64}$/.test(t);
}

/** Minimal standalone HTML page for the confirm / unsubscribe landing views. */
export function statusPage(res, status, heading, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(heading)} — British Home Interior</title>
<style>
  body{font-family:'Lato',system-ui,-apple-system,sans-serif;background:#F3F4EF;color:#1E2420;
       line-height:1.7;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{max-width:460px;text-align:center}
  .mark{display:inline-flex;width:56px;height:56px;border-radius:50%;background:#E8EBE2;border:1px solid #B89A6A;
        align-items:center;justify-content:center;font-size:1.5rem;color:#B89A6A;margin-bottom:20px}
  h1{font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;margin:0 0 12px;color:#1A2318}
  p{color:#7A8278;font-size:.95rem;margin:0 0 24px}
  a{display:inline-block;padding:12px 26px;background:#B89A6A;color:#fff;text-decoration:none;
    font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
</style></head>
<body><div class="card">
  <span class="mark">✓</span>
  <h1>${escapeHtml(heading)}</h1>
  <p>${body}</p>
  <a href="https://britishhomeinterior.co.uk/">Back to British Home Interior</a>
</div></body></html>`);
}
