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
  :root{ --green:#47612F; --green-deep:#33461F; --ecru:#F3F4EF; --gold:#B89A6A; --gold-light:#D4BE93; --ink:#1A2318; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1000px;height:1500px;overflow:hidden}
  .kicker{font-family:'Lato',sans-serif;font-weight:700;font-size:27px;
          letter-spacing:.30em;text-transform:uppercase;color:var(--gold)}
  .domain{font-family:'Lato',sans-serif;font-weight:700;font-size:24px;
          letter-spacing:.22em;text-transform:uppercase}
  h2{font-family:'Playfair Display',serif;font-weight:500}
  h2 em{font-style:italic;color:var(--gold)}
  .subtitle{font-family:'Lato',sans-serif;font-weight:700;font-size:30px;line-height:1.3}
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

  // ===== D · TAPED POLAROID — scrapbook feel, photo taped in at a tilt on textured paper =====
  D: (p) => `
    <style>${BASE_CSS}
      body{background:
            radial-gradient(circle at 15% 20%, rgba(184,154,106,.08), transparent 40%),
            repeating-linear-gradient(0deg, rgba(26,35,24,.025) 0px, rgba(26,35,24,.025) 1px, transparent 1px, transparent 3px),
            var(--ecru);
           display:flex;flex-direction:column;align-items:center;padding:80px 70px 64px}
      .kicker{margin-bottom:18px}
      .polaroid{position:relative;margin-top:20px;background:#fff;padding:28px 28px 100px;
                transform:rotate(2deg);box-shadow:0 30px 60px -20px rgba(26,35,24,.4);width:760px}
      .polaroid .photo-el{width:100%;height:560px;background:url('${p.photo}') center/cover no-repeat}
      .tape{position:absolute;width:150px;height:56px;background:rgba(212,190,147,.55);
            border:1px solid rgba(184,154,106,.35);box-shadow:0 4px 10px rgba(0,0,0,.12)}
      .tape.l{top:-26px;left:-22px;transform:rotate(-30deg)}
      .tape.r{top:-26px;right:-22px;transform:rotate(26deg)}
      h2{font-size:66px;line-height:1.16;color:var(--ink);margin-top:46px;text-align:center}
      .subtitle{color:var(--green-deep);text-align:center;margin-top:22px}
      .domain{color:var(--green-deep);margin-top:auto;padding-top:30px}
    </style>
    <div class="kicker">${p.kicker}</div>
    <div class="polaroid">
      <div class="tape l"></div>
      <div class="tape r"></div>
      <div class="photo-el"></div>
    </div>
    <h2>${p.headline}</h2>
    <div class="subtitle">${p.subtitle}</div>
    <div class="domain">${p.domain}</div>`,

  // ===== E · PRICE TAG — hanging gold price-tag + torn banner headline =====
  E: (p) => `
    <style>${BASE_CSS}
      body{background:var(--ink)}
      .photo{position:absolute;inset:0;background:url('${p.photo}') center/cover no-repeat;opacity:.92}
      .darken{position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(26,35,24,.08) 0%, rgba(26,35,24,.08) 55%, rgba(18,24,16,.6) 100%)}
      .string{position:absolute;top:0;left:180px;width:4px;height:120px;
              background:repeating-linear-gradient(180deg,#EDE8D8 0 12px,transparent 12px 20px)}
      .tag{position:absolute;top:100px;left:70px;width:340px;background:var(--gold-light);
          border:3px solid var(--gold);border-radius:16px;padding:32px 34px 34px;
          transform:rotate(-7deg);box-shadow:0 22px 44px rgba(0,0,0,.32)}
      .tag::before{content:'';position:absolute;top:22px;left:28px;width:20px;height:20px;
                  border-radius:50%;background:var(--ecru);border:3px solid var(--gold)}
      .tag .kicker{color:var(--ink);margin-left:26px;font-size:22px;letter-spacing:.24em}
      .banner-wrap{position:absolute;left:0;right:0;bottom:120px}
      .banner{background:var(--ecru);margin:0 -20px;padding:44px 90px 38px;position:relative;
              box-shadow:0 -14px 40px rgba(0,0,0,.22)}
      .banner::before,.banner::after{content:'';position:absolute;bottom:-22px;width:0;height:0;
              border-left:22px solid transparent;border-right:22px solid transparent;
              border-top:22px solid var(--gold)}
      .banner::before{left:0}
      .banner::after{right:0;transform:scaleX(-1)}
      h2{font-size:70px;line-height:1.16;color:var(--ink);text-align:center}
      .subtitle{color:var(--green-deep);text-align:center;margin-top:18px}
      .domain{position:absolute;left:0;right:0;bottom:36px;text-align:center;color:rgba(243,244,239,.85)}
    </style>
    <div class="photo"></div>
    <div class="darken"></div>
    <div class="string"></div>
    <div class="tag"><div class="kicker">${p.kicker}</div></div>
    <div class="banner-wrap"><div class="banner"><h2>${p.headline}</h2><div class="subtitle">${p.subtitle}</div></div></div>
    <div class="domain">${p.domain}</div>`,

  // ===== F · ARCHWAY — photo through an architectural arch, ribbon-banner headline =====
  F: (p) => `
    <style>${BASE_CSS}
      body{background:var(--green-deep);display:flex;flex-direction:column;align-items:center}
      .plaque{margin-top:70px;background:var(--gold-light);color:var(--ink);padding:16px 40px;
             border-radius:8px;font-family:'Lato',sans-serif;font-weight:700;font-size:24px;
             letter-spacing:.22em;text-transform:uppercase}
      .arch{margin-top:48px;width:680px;height:820px;border-radius:340px 340px 20px 20px;
            overflow:hidden;border:14px solid var(--ecru);box-shadow:0 34px 70px rgba(0,0,0,.4);
            background:url('${p.photo}') center/cover no-repeat}
      .ribbon-wrap{margin-top:-56px;width:800px;position:relative}
      .ribbon{background:var(--ecru);padding:44px 60px 38px;text-align:center;
             box-shadow:0 20px 46px rgba(0,0,0,.32);position:relative}
      .ribbon::before,.ribbon::after{content:'';position:absolute;top:0;border-style:solid}
      .ribbon::before{left:-40px;border-width:36px 40px 36px 0;
             border-color:transparent #E3E4DC transparent transparent}
      .ribbon::after{right:-40px;border-width:36px 0 36px 40px;
             border-color:transparent transparent transparent #E3E4DC}
      h2{font-size:66px;line-height:1.16;color:var(--ink)}
      .subtitle{color:var(--green-deep);text-align:center;margin-top:16px}
      .domain{margin-top:auto;margin-bottom:56px;color:rgba(243,244,239,.8)}
    </style>
    <div class="plaque">${p.kicker}</div>
    <div class="arch"></div>
    <div class="ribbon-wrap"><div class="ribbon"><h2>${p.headline}</h2><div class="subtitle">${p.subtitle}</div></div></div>
    <div class="domain">${p.domain}</div>`,
};

const pins = JSON.parse(readFileSync(process.argv[2] ?? 'pins-uk.json', 'utf8'));
mkdirSync('out-uk', { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// deviceScaleFactor: 2 renders at retina (2x) pixel density, matching the Canada
// site's pins (upgraded 2026-07-ish) — a 1000x1500 pin outputs as 2000x3000.
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

for (const pin of pins) {
  const photo = pin.photo.startsWith('http') ? pin.photo : 'file://' + resolve(pin.photo).replace(/\\/g, '/');
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>` +
    templates[pin.template]({ ...pin, photo }) + '</body></html>';
  const file = resolve(`out-uk/${pin.slug}-${pin.template}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `out-uk/${pin.slug}-${pin.template}.png` });
  console.log(`✓ out-uk/${pin.slug}-${pin.template}.png`);
}
await browser.close();
