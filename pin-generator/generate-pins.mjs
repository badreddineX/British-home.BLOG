// Pinterest pin generator for britishhomeinterior.co.uk — "National Trust heritage" kit
// A = Full-bleed moody (signature), B = Split w/ price-hook kicker, C = Heritage plate
// Headlines support <em>word</em> → italic gold accent (Playfair italic).
// Usage: node generate-pins-uk.mjs [pins-uk.json]

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

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
};

const pins = JSON.parse(readFileSync(process.argv[2] ?? 'pins-uk.json', 'utf8'));
mkdirSync('out-uk', { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });

for (const pin of pins) {
  const photo = pin.photo.startsWith('http') ? pin.photo : 'file://' + resolve(pin.photo);
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
