// Pinterest pin generator for britishhomeinterior.co.uk — v3 "Hormozi" edition
// A = Full-Bleed Moody · B = Split · C = Heritage Plate · D = Floating Card · E = Bold List
// Template E is text-dominant (no photo required) — Hormozi scroll-stopper format.
// Headlines support <em>word</em> → italic gold accent (Playfair italic).
// Usage: node generate-pins.mjs [pins.json]

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Lato:wght@400;700;900&display=swap" rel="stylesheet">`;

const BASE_CSS = `
  :root{ --green:#47612F; --ecru:#F3F4EF; --gold:#B89A6A; --ink:#1A2318; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1000px;height:1500px;overflow:hidden}
  .kicker{font-family:'Lato',sans-serif;font-weight:700;font-size:27px;
          letter-spacing:.30em;text-transform:uppercase;color:var(--gold)}
  .domain{font-family:'Lato',sans-serif;font-weight:700;font-size:24px;
          letter-spacing:.22em;text-transform:uppercase}
  h2{font-family:'Playfair Display',serif;font-weight:500}
  h2 em{font-style:italic;color:var(--gold)}
`;

const templates = {
  // ===== A · FULL-BLEED MOODY — dark warm photo, deep scrim, glowing text =====
  A: (p) => `
    <style>${BASE_CSS}
      body{display:flex;flex-direction:column;justify-content:flex-end;padding:96px 88px;
        background:
          linear-gradient(180deg, rgba(26,35,24,.10) 0%, rgba(26,35,24,.18) 34%, rgba(20,28,18,.62) 60%, rgba(12,18,11,.95) 100%),
          url('${p.photo}') center/cover no-repeat;}
      .accent-rule{width:60px;height:2px;background:var(--gold);margin-bottom:26px}
      .kicker{margin-bottom:24px}
      h2{font-size:90px;line-height:1.16;color:var(--ecru);margin-bottom:38px;
         text-shadow:0 2px 30px rgba(0,0,0,.45)}
      .domain{color:rgba(243,244,239,.88)}
    </style>
    <div class="accent-rule"></div>
    <div class="kicker">${p.kicker}</div>
    <h2>${p.headline}</h2>
    <div class="domain">${p.domain}</div>`,

  // ===== B · SPLIT — photo top half, ecru panel, gold price-hook kicker =====
  B: (p) => `
    <style>${BASE_CSS}
      body{background:var(--ecru);display:flex;flex-direction:column}
      .photo{height:52%;background:url('${p.photo}') center/cover no-repeat;
             box-shadow:inset 0 -44px 64px -52px rgba(26,35,24,.5)}
      .panel{flex:1;padding:72px 88px 64px;display:flex;flex-direction:column}
      .txt{margin:auto 0}
      .kicker{margin-bottom:26px}
      h2{font-size:78px;line-height:1.18;color:var(--ink)}
      .rule{height:2px;background:var(--green);margin-bottom:24px}
      .bottom{display:flex;justify-content:space-between;align-items:center}
      .domain{color:var(--green)}
      .cta{font-family:'Lato',sans-serif;font-weight:900;font-size:23px;
           letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
    </style>
    <div class="photo"></div>
    <div class="panel">
      <div class="txt">
        <div class="kicker">${p.kicker}</div>
        <h2>${p.headline}</h2>
      </div>
      <div class="cta-row">
        <div class="rule"></div>
        <div class="bottom">
          <div class="domain">${p.domain}</div>
          <div class="cta">Read&nbsp;→</div>
        </div>
      </div>
    </div>`,

  // ===== C · HERITAGE PLATE — gold frame on deep green, paint-tin label =====
  C: (p) => `
    <style>${BASE_CSS}
      body{background:var(--green);padding:44px}
      .frame{height:100%;border:3px solid var(--gold);outline:1px solid var(--gold);
             outline-offset:-14px;display:flex;flex-direction:column;align-items:center;
             text-align:center;padding:96px 76px 78px}
      .kicker{margin-bottom:30px;display:flex;align-items:center;gap:20px}
      .kicker::before,.kicker::after{content:'';width:28px;height:1px;background:var(--gold)}
      h2{font-size:80px;line-height:1.2;color:var(--ecru);margin-bottom:64px}
      h2 em{color:var(--gold)}
      .photo{width:76%;flex:1;border-radius:10px;margin-bottom:58px;
             background:url('${p.photo}') center/cover no-repeat;
             box-shadow:0 26px 54px -30px rgba(0,0,0,.55), inset 0 0 0 1px rgba(184,154,106,.35)}
      .domain{color:var(--gold)}
    </style>
    <div class="frame">
      <div class="kicker">${p.kicker}</div>
      <h2>${p.headline}</h2>
      <div class="photo"></div>
      <div class="domain">${p.domain}</div>
    </div>`,

  // ===== D · FLOATING CARD — bright photo, gold-bordered ecru card over bottom third =====
  D: (p) => `
    <style>${BASE_CSS}
      body{background:var(--ecru)}
      .photo{position:absolute;inset:0;background:url('${p.photo}') center/cover no-repeat}
      .scrim-top{position:absolute;top:0;left:0;right:0;height:42%;
                 background:linear-gradient(180deg, rgba(26,35,24,.22) 0%, rgba(26,35,24,0) 100%)}
      .card{position:absolute;left:52px;right:52px;bottom:52px;background:var(--ecru);
            border-radius:20px;padding:60px 58px 52px;border:2px solid var(--gold);
            box-shadow:0 32px 64px -24px rgba(26,35,24,.40)}
      .pill{display:inline-flex;align-items:center;background:var(--green);color:var(--ecru);
            font-family:'Lato',sans-serif;font-weight:700;font-size:22px;
            letter-spacing:.16em;text-transform:uppercase;padding:11px 26px;
            border-radius:999px;margin-bottom:30px}
      h2{font-size:72px;line-height:1.16;color:var(--ink);margin-bottom:34px}
      h2 em{color:var(--gold)}
      .rule{width:52px;height:2px;background:var(--gold);margin-bottom:20px}
      .domain{color:var(--green)}
    </style>
    <div class="photo"></div>
    <div class="scrim-top"></div>
    <div class="card">
      <div class="pill">${p.kicker}</div>
      <h2>${p.headline}</h2>
      <div class="rule"></div>
      <div class="domain">${p.domain}</div>
    </div>`,

  // ===== E · BOLD LIST — deep forest canvas, gold italic numerals, Hormozi teaser list =====
  // Text-dominant — no photo required. Supply p.list[] with 3–7 short teaser strings.
  // Curiosity gap: viewers see enough to want more, but must click to get the full list.
  E: (p) => `
    <style>${BASE_CSS}
      body{background:var(--ink);display:flex;flex-direction:column;
           padding:96px 88px 88px;position:relative;overflow:hidden}
      .bg-arc{position:absolute;width:760px;height:760px;border-radius:50%;
              border:1px solid rgba(184,154,106,.10);top:-240px;right:-200px;pointer-events:none}
      .bg-arc2{position:absolute;width:560px;height:560px;border-radius:50%;
               border:1px solid rgba(184,154,106,.07);top:-140px;right:-100px;pointer-events:none}
      .top-bar{display:flex;align-items:center;gap:22px;margin-bottom:58px;flex-shrink:0}
      .top-bar::after{content:'';flex:1;height:1px;background:rgba(184,154,106,.30)}
      .kicker{font-family:'Lato',sans-serif;font-weight:700;font-size:23px;
              letter-spacing:.28em;text-transform:uppercase;color:var(--gold);white-space:nowrap}
      h2{font-family:'Playfair Display',serif;font-weight:500;font-size:94px;
         line-height:1.12;color:var(--ecru);margin-bottom:56px;flex-shrink:0}
      h2 em{color:var(--gold);font-style:italic}
      .list{flex:1;list-style:none;display:flex;flex-direction:column;
            justify-content:space-evenly;padding-bottom:8px}
      .list li{display:flex;align-items:flex-start;gap:24px}
      .num{font-family:'Playfair Display',serif;font-size:44px;font-weight:500;
           font-style:italic;color:var(--gold);min-width:54px;line-height:1;flex-shrink:0}
      .item-txt{font-family:'Lato',sans-serif;font-weight:400;font-size:29px;
                line-height:1.38;color:rgba(243,244,239,.84);padding-top:6px}
      .footer{display:flex;align-items:center;justify-content:space-between;
              padding-top:44px;border-top:1px solid rgba(184,154,106,.24);flex-shrink:0}
      .domain{font-family:'Lato',sans-serif;font-weight:700;font-size:21px;
              letter-spacing:.22em;text-transform:uppercase;color:rgba(243,244,239,.50)}
      .cta-badge{background:var(--gold);color:var(--ink);font-family:'Lato',sans-serif;
                 font-weight:900;font-size:20px;letter-spacing:.14em;text-transform:uppercase;
                 padding:13px 28px;border-radius:999px}
    </style>
    <div class="bg-arc"></div>
    <div class="bg-arc2"></div>
    <div class="top-bar"><div class="kicker">${p.kicker}</div></div>
    <h2>${p.headline}</h2>
    <ul class="list">
      ${(p.list || []).map((item, i) =>
        `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="item-txt">${item}</span></li>`
      ).join('\n      ')}
    </ul>
    <div class="footer">
      <div class="domain">${p.domain}</div>
      <div class="cta-badge">Read&nbsp;→</div>
    </div>`,
};

const pins = JSON.parse(readFileSync(process.argv[2] ?? 'pins.json', 'utf8'));
mkdirSync('out-uk', { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// deviceScaleFactor: 2 renders at retina density — 2000×3000 output, sharp on hi-DPI screens.
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

for (const pin of pins) {
  const photo = pin.photo
    ? (pin.photo.startsWith('http') ? pin.photo : pathToFileURL(resolve(pin.photo)).href)
    : '';
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>` +
    templates[pin.template]({ ...pin, photo }) + '</body></html>';
  const file = resolve(`out-uk/${pin.slug}-${pin.template}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `out-uk/${pin.slug}-${pin.template}.png` });
  console.log(`✓ out-uk/${pin.slug}-${pin.template}.png`);
}
await browser.close();
