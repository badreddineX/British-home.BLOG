// One-off Reddit profile banner (1500x500) for u/britishhomeinterior.
// Uses the LIVE SITE'S brand palette (global.css), not the pin-generator's
// alternate green kit, so it matches the logo/favicon/site exactly.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">`;

const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  :root{ --ink:#1A1212; --ecru:#F3F4EF; --gold:#B89A6A; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1500px;height:500px;overflow:hidden;background:var(--ink)}
  body{
    display:flex;align-items:center;justify-content:center;
    position:relative;
    background:
      radial-gradient(ellipse 900px 500px at 18% 30%, rgba(184,154,106,.14) 0%, transparent 60%),
      radial-gradient(ellipse 900px 500px at 82% 75%, rgba(184,154,106,.10) 0%, transparent 60%),
      var(--ink);
  }
  .mark{
    position:absolute; left:96px; top:50%; transform:translateY(-50%);
    width:190px; height:190px;
  }
  .content{
    position:absolute; left:330px; top:50%; transform:translateY(-50%);
    display:flex; flex-direction:column; gap:14px;
  }
  .kicker{
    font-family:'Lato',sans-serif; font-weight:700; font-size:19px;
    letter-spacing:.28em; text-transform:uppercase; color:var(--gold);
  }
  h1{
    font-family:'Playfair Display',serif; font-weight:600; font-size:64px;
    color:var(--ecru); line-height:1.05; letter-spacing:.01em;
  }
  h1 em{ font-style:italic; color:var(--gold); font-weight:400; }
  .tag{
    font-family:'Lato',sans-serif; font-weight:400; font-size:22px;
    color:rgba(243,244,239,.72); letter-spacing:.01em;
  }
  .rule{ width:56px; height:2px; background:var(--gold); margin-top:4px; }
</style></head><body>
  <svg class="mark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="85" stroke="#B89A6A" stroke-width="4" fill="none"/>
    <path d="M40 118 L100 58 L160 118" stroke="#B89A6A" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <rect x="72" y="118" width="24" height="30" stroke="#B89A6A" stroke-width="3" fill="none"/>
    <rect x="104" y="118" width="24" height="30" stroke="#B89A6A" stroke-width="3" fill="none"/>
    <path d="M30 148 Q100 112 170 148" stroke="#B89A6A" stroke-width="2.5" fill="none"/>
  </svg>
  <div class="content">
    <div class="kicker">Est. British Interiors</div>
    <h1>British Home <em>Interior</em></h1>
    <div class="rule"></div>
    <div class="tag">Cosy styling &amp; room makeovers for UK homes, flats and terraces</div>
  </div>
</body></html>`;

const file = resolve('pin-generator/reddit-banner-tmp.html');
writeFileSync(file, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 500 } });
await page.goto('file://' + file, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'pin-generator/reddit-banner.png' });
await browser.close();
console.log('✓ pin-generator/reddit-banner.png');
