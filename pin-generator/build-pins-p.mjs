// Template-P ("PHOTO-FIRST, READABLE") pins for UK + a 30-day scheduled Pinterest bulk-upload CSV.
//
//   node pin-generator/build-pins-p.mjs            # run from the blog repo root
//
// Why: the older templates used ~62px headlines on a 1000px-wide pin, which is ~15px in a
// phone feed. Template P uses 90-130px bold sans headlines, one big photo, a small label pill
// and (when the title starts with a number) a number badge.
//
// Emits:
//   pinterest-pins/template-p-2026-09/<slug>-p<k>.jpg          (1000x1500)
//   pinterest content/pinterest-bulk-upload-CAD-template-P-30days.csv
//
// Variants per post: p1 = overlay layout + post title; p2 = split layout + first FAQ question;
// p3 = badge layout + second FAQ question. Only the scheduled ones are rendered.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ED = 'UK';
const DOMAIN = 'britishhomeinterior.co.uk';
const SITE = 'https://britishhomeinterior.co.uk';
const REPO = 'badreddineX/British-home.BLOG';
const BRANCH = 'main';
const PIN_DIR = 'template-p-2026-09';
const START = new Date('2026-09-20T00:00:00');
const SLOTS = ['09:00:00', '19:00:00'];
const DAYS = 30;
const CSV_OUT = '../pinterest content/pinterest-bulk-upload-UK-template-P-30days.csv';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
const CSV_ONLY = process.argv.includes('--csv-only');
// --ig: render every post once at 4:5 (1000x1250, Instagram feed max ratio), same layouts; no CSV
const IG_MODE = process.argv.includes('--ig');
const H = IG_MODE ? 1250 : 1500;
const OUT_DIR = IG_MODE ? resolve(ROOT, 'social-posts/ig-2026-09') : resolve(ROOT, 'pinterest-pins', PIN_DIR);

// ---------- boards (keyword-first names; create these on Pinterest before uploading) ----------
const BOARD_RULES = [
  [/budget|cheap|under-?\d/i, 'Home Decor on a Budget UK'],
  [/kitchen|pantry|cabinet|worktop|splashback|utility|unfitted|galley/i, 'Kitchen Ideas UK'],
  [/bathroom|wet-room/i, 'Small Bathroom Ideas UK'],
  [/hallway|entry/i, 'Hallway Ideas UK'],
  [/bedroom/i, 'Bedroom Ideas UK'],
  [/renter|rented|rental|deposit|lets/i, 'Renter Friendly Home Ideas UK'],
  [/living-room|lounge|sofa|scandi|maximalist|dark-moody|opera|colour-schemes|home-office|studio-flat|lighting/i, 'Living Room Ideas UK'],
  [/cosy|autumn|winter|cottagecore|grandma|spring|christmas|vibey|funhaus|afrobohemian/i, 'Cosy Home Decor UK'],
];
const BOARD_BY_CAT = { 'Room Makeovers': 'Room Makeovers UK', 'Living Room': 'Living Room Ideas UK', Kitchen: 'Kitchen Ideas UK', Bedroom: 'Bedroom Ideas UK', Bathroom: 'Small Bathroom Ideas UK' };
function boardFor(slug, cat) {
  for (const [re, b] of BOARD_RULES) if (re.test(slug)) return b;
  return BOARD_BY_CAT[cat] || 'Small Apartment Ideas';
}
const DECOR_FIRST = new Set(['Living Room Ideas UK', 'Bedroom Ideas UK', 'Kitchen Ideas UK', 'Room Makeovers UK']);

const PIN_KW = {
  'Room Makeovers': ['room makeover ideas uk', 'home decor ideas uk', 'renter friendly home ideas', 'cosy home decor'],
  'Living Room': ['small living room ideas uk', 'living room decor ideas', 'small living room decor ideas', 'best color for living room walls'],
  Kitchen: ['small kitchen ideas uk', 'kitchen makeover on a budget', 'very small kitchen ideas', 'kitchen design ideas'],
  Bedroom: ['bedroom decor ideas', 'calm bedroom decor ideas', 'small bedroom ideas', 'master bedroom decor ideas'],
  Bathroom: ['small bathroom ideas uk', 'small bathroom storage ideas'],
};


// ---------- keyword research (OpenSEO, Canada, 2026-09-19) ----------
// Volumes/mo: very small closet organization ideas 1300, renter friendly wallpaper 1000, best peel and stick
// wallpaper canada 320, small apartment storage ideas 140, storage solutions for small rooms 90,
// clothes storage ideas for small spaces 70, small apartment decor ideas 70. Canada-only niche terms are tiny,
// so pin titles lead with the broader phrase people actually search.
const PRIMARY = {};
const ROOM_KW = [
  [/living-room|lounge|sofa|maximalist|colour-schemes/i, ['small living room ideas uk', 'very small living room ideas', 'modern small living room ideas', 'small living room ideas with tv', 'living room decor ideas']],
  [/colour|paint/i, ['best color for living room walls', 'small living room colour ideas', 'living room paint ideas uk']],
  [/kitchen|pantry|cabinet|worktop|galley|unfitted/i, ['small kitchen ideas uk', 'very small kitchen ideas', 'kitchen makeover on a budget', 'modern small kitchen ideas']],
  [/bedroom/i, ['bedroom decor ideas', 'calm bedroom decor ideas', 'small bedroom ideas', 'storage ideas for small spaces bedroom']],
  [/hallway/i, ['hallway decorating ideas uk', 'hallway decor ideas']],
  [/bathroom|wet-room/i, ['small bathroom ideas uk', 'small bathroom storage ideas']],
  [/renter|rented|rental|deposit/i, ['renter friendly decorating ideas', 'rental flat decorating ideas']],
  [/storage|shelf|pantry/i, ['storage solutions for small spaces uk', 'storage ideas for small spaces']],
  [/budget|cheap/i, ['home decor on a budget uk', 'budget home makeover']],
];

// ---------- parsing ----------
function split(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fmRaw: m[1], body: m[2] } : { fmRaw: '', body: md };
}
const scalar = (fm, k) => { const m = fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm')); return m ? m[1] : ''; };
function tags(fm) { const m = fm.match(/^tags:\s*\[(.*)\]/m); return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : []; }
function faqs(fm) { return [...fm.matchAll(/-\s*q:\s*"((?:[^"\\]|\\.)*)"\s*\r?\n\s*a:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ q: m[1], a: m[2] })); }
function photos(fm, body) {
  const names = [];
  const add = (p) => { const n = (p || '').replace(/^\/images\//, '').replace(/\.webp$/i, '.jpg'); if (n && !names.includes(n)) names.push(n); };
  add(scalar(fm, 'image'));
  for (const m of body.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) add(m[1]);
  return names.filter((n) => existsSync(resolve(ROOT, 'public/images', n)) && /\.jpe?g$/i.test(n));
}

// ---------- headline / label ----------
const STOPEND = new Set(['for', 'the', 'a', 'an', 'and', 'to', 'in', 'on', 'of', 'that', 'your', 'with', 'without', 'small']);
function headlineParts(title) {
  let t = title.replace(/\s*\|.*$/, '');
  const numM = t.match(/^(\d{1,2})\s+(.*)$/);
  const number = numM ? numM[1] : null;
  if (numM) t = numM[2];
  let pill = null;
  const under = t.match(/[:\-–—]?\s*Under\s+([£$])(\d[\d,]*)/i);
  if (under) { pill = `UNDER ${under[1]}${under[2]}`; t = t.replace(under[0], ''); }
  t = t.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*[:–—-]\s+.*$/, '').replace(/\s*\(Canada\)$/i, '').trim();
  let words = t.split(/\s+/).slice(0, 7);
  while (words.length > 3 && STOPEND.has(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) words.pop();
  return { number, headline: words.join(' '), pill };
}
function labelFor(fmRaw, pill) {
  if (pill) return pill;
  if (/renter|rented|rental/i.test(fmRaw)) return 'UK RENTERS';
  if (/kitchen/i.test(fmRaw)) return 'UK KITCHENS';
  return 'BRITISH HOMES';
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- templates ----------
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lato:wght@700;900&display=swap" rel="stylesheet">`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:1000px;height:${H}px;overflow:hidden;font-family:'Lato',Arial,sans-serif}
.pill{display:inline-block;background:#C8A24A;color:#1B211D;font-weight:800;font-size:27px;letter-spacing:.16em;padding:14px 26px;border-radius:999px}
.h{font-family:'Playfair Display',Georgia,serif;font-weight:800;line-height:1.08;letter-spacing:-.01em}
.dom{font-weight:700;font-size:23px;letter-spacing:.22em;text-transform:uppercase}`;
function fs(h) { const n = h.length; return n <= 18 ? 138 : n <= 28 ? 120 : n <= 38 ? 104 : 90; }
const POS = ['center', 'center 30%', 'center 70%'];

const PALS = [{bg:'#F3EEDF',ink:'#2F3A25',acc:'#8A6E1F',lab:'#8A6E1F'},{bg:'#F0E7DA',ink:'#40302A',acc:'#B4552D',lab:'#B4552D'}];
const TAGLINE = 'Ideas for British homes';
function tmpl(p, layout) {
  // Round-2 layouts: banner-top (F1), sticker headline (F10), sandwich split (F2). Style rotates by slug hash.
  const h = [...p.slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const style = (h + layout - 1) % 3;
  const pal = PALS[(h >>> 3) % PALS.length];
  const n = p.headline.length;
  // auto-fit: headline must fit 3 lines in the 860px text width and ~300px band height
  const fit = (w, maxH) => { for (let s = 132; s >= 72; s -= 4) { const cpl = Math.floor(w / (s * 0.6)); const lines = p.headline.split(' ').reduce((a, wd) => { const l = a[a.length - 1]; if (l && (l + ' ' + wd).length <= cpl) a[a.length - 1] = l + ' ' + wd; else a.push(wd); return a; }, []).length; if (lines <= 3 && lines * s * 1.05 <= maxH) return s; } return 72; };
  const size = fit(860, 290);
  const photo = `background:url('${p.photo}') ${POS[p.k % 3]}/cover no-repeat`;
  const lab = `color:${pal.lab};font-weight:800;font-size:34px;letter-spacing:.2em`;
  const pillDark = `position:absolute;left:50px;bottom:56px;background:rgba(20,26,18,.72);color:#FBF8F1;font-weight:700;font-size:30px;letter-spacing:.18em;padding:16px 30px;border-radius:999px`;
  if (style === 0) return `<style>${BASE} body{background:${pal.bg}}
    .band{position:absolute;left:0;top:0;width:1000px;height:500px;padding:64px 70px;display:flex;flex-direction:column;justify-content:center}
    .h{font-size:${size}px;color:${pal.ink};margin-top:22px}.ph{position:absolute;left:0;top:500px;width:1000px;height:${H - 500}px;${photo}}</style>
    <div class="band"><div style="${lab}">${esc(p.label)}</div><div class="h">${esc(p.headline)}</div></div><div class="ph"></div><div style="${pillDark}">${DOMAIN.toUpperCase()}</div>`;
  if (style === 1) return `<style>${BASE}
    .ph{position:absolute;inset:0;${photo}}.dim{position:absolute;inset:0;background:rgba(10,14,12,.16)}
    .lbl{position:absolute;left:-30px;width:1060px;top:${H - 460}px;height:290px;background:${pal.bg};transform:rotate(-3deg);display:flex;align-items:center;padding:0 90px;box-shadow:0 14px 40px rgba(0,0,0,.3)}
    .h{font-size:${Math.min(size, 112)}px;color:${pal.ink}}
    .badge{position:absolute;right:60px;top:60px;width:220px;height:220px;border-radius:50%;background:${pal.acc};color:#FBF8F1;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:${p.number ? 46 : 34}px;line-height:1.1;letter-spacing:.04em;box-shadow:0 10px 30px rgba(0,0,0,.35);padding:20px}
    .url{position:absolute;left:0;right:0;bottom:70px;text-align:center;color:#FBF8F1;font-weight:700;font-size:30px;letter-spacing:.22em;text-shadow:0 2px 12px rgba(0,0,0,.7)}</style>
    <div class="ph"></div><div class="dim"></div><div class="badge">${p.number ? `${p.number}<br>IDEAS` : esc(p.label).replace(' ', '<br>')}</div><div class="lbl"><div class="h">${esc(p.headline)}</div></div><div class="url">${DOMAIN.toUpperCase()}</div>`;
  return `<style>${BASE} body{background:${pal.bg}}
    .top{position:absolute;left:0;top:0;width:1000px;height:430px;padding:60px 80px;display:flex;flex-direction:column;justify-content:center}
    .h{font-size:${Math.min(size, 116)}px;color:${pal.ink};margin-top:18px}.ph{position:absolute;left:0;top:430px;width:1000px;height:${H - 770}px;${photo}}
    .bot{position:absolute;left:0;top:${H - 340}px;width:1000px;height:340px;padding:60px 80px;display:flex;flex-direction:column;justify-content:center;background:${pal.ink};color:#FBF8F1}</style>
    <div class="top"><div style="${lab}">${esc(p.label)}</div><div class="h">${esc(p.headline)}</div></div><div class="ph"></div>
    <div class="bot"><div style="font-weight:700;font-size:54px;line-height:1.15">${esc(TAGLINE)}</div><div style="margin-top:22px;font-weight:700;font-size:32px;letter-spacing:.2em;color:${pal.bg}">${DOMAIN.toUpperCase()}</div></div>`;
}

// ---------- build post records ----------
const posts = [];
for (const f of readdirSync(BLOG_DIR).filter((x) => x.endsWith('.md')).sort()) {
  const { fmRaw, body } = split(readFileSync(resolve(BLOG_DIR, f), 'utf8'));
  const title = scalar(fmRaw, 'title'); if (!title) continue;
  const slug = f.replace(/\.md$/, '');
  const ph = photos(fmRaw, body);
  if (!ph.length) { console.log(`skip (no usable photo): ${slug}`); continue; }
  const cat = scalar(fmRaw, 'category');
  posts.push({ slug, title, cat, desc: scalar(fmRaw, 'description'), tags: tags(fmRaw), faqs: faqs(fmRaw), photos: ph, fmRaw, board: boardFor(slug, cat), ...headlineParts(title) });
}
console.log(`posts usable: ${posts.length}`);

// ---------- schedule: 3/day x 30 days = 90 pins: every post's p1, then p2 for decor-first posts ----------
const p1 = posts.slice().sort((a, b) => (DECOR_FIRST.has(b.board) ? 1 : 0) - (DECOR_FIRST.has(a.board) ? 1 : 0));
const queue = [...p1.map((p) => ({ post: p, k: 1 })), ...p1.filter((p) => p.faqs.length).map((p) => ({ post: p, k: 2 })),
  ...p1.filter((p) => p.faqs.length > 1).map((p) => ({ post: p, k: 3 }))];
const total = DAYS * SLOTS.length;
const picked = [];
const pool = queue.slice();
while (picked.length < total && pool.length) {
  const prev = picked[picked.length - 1];
  let i = pool.findIndex((c) => !prev || (c.post.board !== prev.post.board && c.post.slug !== prev.post.slug));
  if (i < 0) i = 0;
  picked.push(pool.splice(i, 1)[0]);
}
if (IG_MODE) { picked.length = 0; for (const p of posts) picked.push({ post: p, k: 1 }); }
console.log(`scheduled pins: ${picked.length}`);

// two-tier keywords: tier 1 = broad board-level Pinterest search terms (first), tier 2 = post-specific long-tail
const BOARD_BROAD = {"Bedroom Ideas UK": ["bedroom decor ideas", "bedroom ideas uk"], "Living Room Ideas UK": ["living room decor ideas", "small living room ideas"], "Kitchen Ideas UK": ["kitchen design ideas", "small kitchen ideas uk"], "Room Makeovers UK": ["room makeover ideas", "home makeover on a budget"], "Cosy Home Decor UK": ["cosy home decor", "cosy living room ideas"], "Small Bathroom Ideas UK": ["small bathroom ideas uk", "bathroom storage ideas"], "Home Decor on a Budget UK": ["home decor on a budget", "budget home makeover uk"], "Renter Friendly Home Ideas UK": ["renter friendly decor", "rental decorating ideas uk"], "Hallway Ideas UK": ["hallway decorating ideas uk", "narrow hallway ideas"]};

// ---------- render ----------
mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: H }, deviceScaleFactor: 1 });
const csvCell = (s) => `"${String(s).replace(/"/g, '""')}"`;
const rows = [['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']];
const boardCount = {};
for (let i = 0; i < picked.length; i++) {
  const { post, k } = picked[i];
  const layout = k; // 1 overlay, 2 split, 3 badge
  const photoName = post.photos[(k - 1) % post.photos.length];
  const photo = pathToFileURL(resolve(ROOT, 'public/images', photoName)).href;
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>${tmpl({ ...post, k, photo, label: labelFor(post.fmRaw, post.pill) }, layout)}</body></html>`;
  if (!CSV_ONLY) {
    const tmpHtml = resolve(OUT_DIR, '_pin.html');
    writeFileSync(tmpHtml, html);
    await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
  }
  const file = IG_MODE ? `${post.slug}-ig.jpg` : `${post.slug}-p${k}.jpg`;
  if (!CSV_ONLY) await page.screenshot({ path: resolve(OUT_DIR, file), type: 'jpeg', quality: 90 });

  const faq = post.faqs[k === 1 ? -1 : k - 2];
  // Pin title = the article's own title, exactly as published on the blog.
  // p1 = the article's own title; repeat pins use a real FAQ question from the same article so titles never duplicate.
  const title = (k > 1 && faq ? faq.q : post.title.replace(/\s*\(.*?\)\s*$/, '')).slice(0, 100);
  const descBase = (k === 1 || !faq ? post.desc : `${faq.q} ${faq.a}`).replace(/\s+/g, ' ').trim();
  // Keywords: the post's own SEO tags first, then researched phrases ONLY where the slug clearly matches the topic.
  const tagKw = post.tags.filter((t) => !/^(canada|uk|australia)$/i.test(t));
  const room = ROOM_KW.filter(([re]) => re.test(post.slug)).flatMap(([, kw]) => kw);
  const generic = room.length ? [] : (PIN_KW[post.cat] || []);
  const seen = new Set();
  const kwList = [...(BOARD_BROAD[post.board] || []), ...tagKw.slice(0, 4), ...room, ...generic]
    .filter((x) => { const l = x.toLowerCase(); return l && !seen.has(l) && seen.add(l); });
  const kws = kwList.slice(0, 10).join(', ');
  const also = kwList.slice(0, 3).join(', ');
  const day = Math.floor(i / SLOTS.length), slot = SLOTS[i % SLOTS.length];
  const d = new Date(START.getTime() + day * 86400000);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${slot}`;
  rows.push([title, `https://raw.githubusercontent.com/${REPO}/${BRANCH}/pinterest-pins/${PIN_DIR}/${file}`, post.board,
    '', ((descBase.slice(0, 380) + ` Related: ${also}. Save this pin for later.`).slice(0, 490)), `${SITE}/blog/${post.slug}?utm_source=pinterest&utm_medium=social&utm_campaign=uk_p${k}`, date, kws].map(csvCell));
  boardCount[post.board] = (boardCount[post.board] || 0) + 1;
}
await browser.close();
if (!IG_MODE) writeFileSync(resolve(ROOT, CSV_OUT), '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n') + '\r\n');
console.log(`CSV -> ${CSV_OUT}`);
console.log('boards used:', boardCount);
