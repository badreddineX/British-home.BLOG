# British Home Interior — Social Publishing Strategy

**Brand:** British Home Interior
**Website:** https://britishhomeinterior.co.uk
**Instagram:** [@britishhome_interior](https://www.instagram.com/britishhome_interior/)
**Pinterest:** [BritishHomeInterior](https://www.pinterest.com/BritishHomeInterior)
**Timezone for all scheduling:** Europe/London (GMT/BST)

---

## 1. Objective

Drive qualified organic traffic from Instagram and Pinterest to blog posts on britishhomeinterior.co.uk, growing both platforms in parallel while keeping publishing repeatable and low-effort using the existing asset pipeline (`ig-highlights/`, `pin-generator/`).

---

## 2. Content Pillars (match site categories 1:1)

| Pillar | Highlight Cover | Pinterest Board | Blog Category URL |
|---|---|---|---|
| Living Room | `ig-highlights/livingroom.png` | Living Room Ideas UK (secret) | `/blog/?category=living-room` |
| Bedroom | `ig-highlights/bedroom.png` | Bedroom Ideas UK (secret) | `/blog/?category=bedroom` |
| Kitchen | `ig-highlights/kitchen.png` | Kitchen Ideas UK (secret) | `/blog/?category=kitchen` |
| Room Makeovers | `ig-highlights/makeovers.png` | Room Makeovers UK (secret) | `/blog/?category=room-makeovers` |

Every blog post maps to exactly one pillar. Do not cross-post the same post into two boards/highlights — it dilutes topical signal on Pinterest and confuses the IG highlight structure.

---

## 3. Publishing Cadence

**Geo targeting:** confirm Pinterest account Country/Region is set to **United Kingdom** and profile language is **English (UK)** before publishing — this is a stronger relevance signal than any amount of pin volume, and costs nothing to fix once.

**Pin volume: 7 pins/week, one per day.** Pinterest content is evergreen — a pin can get found and clicked months after posting, so a slow steady drip beats a burst. One pin/day, rotating across the 4 category boards, is sustainable indefinitely and never reads as spam, whether the boards are secret or public. This also matches the same cadence already proven out on the SmallSpace Home blog (`blogs/canada-subn-1/pinterest content/POSTING-CALENDAR.md`).

| Platform | Frequency | Best Times (Europe/London) | Best Days |
|---|---|---|---|
| Pinterest | 7 pins/week (1/day) | 8:00–9:00 or 20:00–21:00 | Every day |
| Instagram Feed | 3–4 posts/week | 12:00–13:00 or 18:00–19:30 | Tue, Thu, Sat, Sun |
| Instagram Stories | Daily, 2–4 per day | 8:00, 13:00, 20:00 | Every day |
| Instagram Reels | 1–2/week | 18:00–20:00 | Wed, Sun |

Rationale: UK home/interior audience engages most over lunch break and evening wind-down; Pinterest has no meaningful "prime time" penalty, so steady daily drip outperforms bursts.

---

## 4. Pinterest Workflow

### 4.1 Board status
All 4 boards start **Secret**. Switch each board to **Public** only once it has a minimum of **10 pins** — an empty or thin public board signals low authority to Pinterest's algorithm and to visitors.

### 4.2 Per-pin checklist
1. Generate pin graphic via `pin-generator/generate-pins.mjs` (1000×1500, matches brand templates A/B/C)
2. Upload to the matching category board
3. **Title** — front-load the primary keyword, ≤100 characters
   _Example: "Bedroom Makeover UK — 13 Changes With Big Impact"_
4. **Description** — 2–3 sentences, natural language, include the keyword once + a soft CTA. ≤500 characters.
   _Example: "A step-by-step bedroom makeover for UK homes — 13 changes that make a real difference without a full renovation. See the full room-by-room guide with British high-street sources."_
5. **Destination link** — always the canonical blog post URL, never the homepage:
   `https://britishhomeinterior.co.uk/blog/{slug}/`
6. **Alt text** — describe the image literally (accessibility + Pinterest Lens indexing), not the marketing headline.

### 4.3 Week 1 schedule (1 pin/day, rotating boards)

| Day | Board | Pin File | Title | Link |
|---|---|---|---|---|
| Mon | Living Room | `living-room-ideas-A.png` | Living Room Ideas for UK Homes | `/blog/living-room-ideas-uk/` |
| Tue | Bedroom | `bedroom-decor-ideas-A.png` | Bedroom Decor Ideas for UK Homes | `/blog/bedroom-decor-ideas-uk/` |
| Wed | Kitchen | `kitchen-decor-ideas-A.png` | Kitchen Decor Ideas UK | `/blog/kitchen-decor-ideas-uk/` |
| Thu | Room Makeovers | `budget-home-makeover-A.png` | Budget Home Makeover UK | `/blog/budget-home-makeover-uk/` |
| Fri | Living Room | `living-room-colour-schemes-A.png` | Living Room Colour Schemes UK | `/blog/living-room-colour-schemes-uk/` |
| Sat | Bedroom | `cosy-bedroom-ideas-A.png` | Cosy Bedroom Ideas UK | `/blog/cosy-bedroom-ideas-uk/` |
| Sun | Kitchen | `kitchen-on-a-budget-A.png` | Kitchen on a Budget UK | `/blog/kitchen-on-a-budget-uk/` |

All 7 pins are already rendered in `pin-generator/out-uk/`, sourced from `pin-generator/pins-week1.json`. The previously flagged Living Room photo mismatch (was showing a bedroom) has been fixed at source — `style-a-living-room` now uses a genuine living room photo.

An additional 18 pins beyond this week's 7 are already rendered in the same folder (`pins-week1.json` covers 25 total) — held in reserve for weeks 2–4 rather than wasted, so no further rendering is needed for most of the first month.

### 4.4 Scaling
`pin-generator/pins.json` contains 3 headline variants (A/B/C) for all 29 published posts (87 potential pins total) — enough inventory for roughly 12 weeks at the 7/week pace before any repeats are needed.

---

## 5. Instagram Workflow

### 5.1 Feed posts
- 1:1 or 4:5 crop from the blog post's hero image
- Caption structure:
  1. Hook line (question or bold claim, ≤125 characters — this is what shows before "more")
  2. 2–4 sentences of value / context
  3. CTA: "Full guide — link in bio" (Instagram feed posts cannot use clickable links in captions)
  4. 15–20 hashtags, mix of broad (`#interiordesign`) and niche (`#ukbedroominspo`), placed in the first comment, not the caption
- Link in bio tool (Linktree/Later-style, or a simple `/blog/` landing) should route to the most recent post promoted.

### 5.2 Stories
- Daily drip of the day's pin graphics or behind-the-scenes room shots
- Use the **link sticker** pointing directly to the blog post — Stories support clickable links regardless of follower count
- Every Story that matches a pillar gets saved into its Highlight immediately after 24h (or added live via "Highlight" before it expires)

### 5.3 Highlights (already built)
| Highlight | Cover |
|---|---|
| Living Room | `ig-highlights/livingroom.png` |
| Bedroom | `ig-highlights/bedroom.png` |
| Kitchen | `ig-highlights/kitchen.png` |
| Room Makeovers | `ig-highlights/makeovers.png` |

Keep exactly these 4 — do not add "Home" or "About" highlights (removed intentionally to keep the profile focused on shoppable/save-worthy categories).

### 5.4 Reels
- Repurpose blog content as a 15–30s room-reveal or "3 tips" voiceover/text-overlay format
- Caption follows the same structure as feed posts
- Reels get priority reach on IG — use for the strongest-performing blog post each week (check GA4 for that week's top page)

---

## 6. Weekly Cadence Template

| Day | Pinterest | Instagram Feed | Instagram Stories | Reels |
|---|---|---|---|---|
| Mon | 1 pin | — | 2× | — |
| Tue | 1 pin | 1 post | 2× | — |
| Wed | 1 pin | — | 3× | 1 |
| Thu | 1 pin | 1 post | 2× | — |
| Fri | 1 pin | — | 2× | — |
| Sat | 1 pin | 1 post | 3× | — |
| Sun | 1 pin | 1 post | 2× | 1 |

Rotate the daily pin across the 4 boards in sequence (Living Room → Bedroom → Kitchen → Room Makeovers → repeat) so each board gets attention roughly every 4 days.

---

## 7. Publishing Order (first 30 days)

1. **Days 1–28:** 1 pin/day, rotating boards in sequence — by day 28 each board has ~7 pins. Boards stay Secret through this whole window.
2. **Day 29 (once each board has 7+ pins):** Flip all 4 boards to Public.
3. **From Day 29:** Begin IG feed cadence (section 6) in parallel with continued daily Pinterest pinning. Start building Story→Highlight habit from this point onward, not before — no point highlighting content before the boards/profile look established.

---

## 8. Tracking

- **Pinterest:** Pinterest Analytics → monitor saves, outbound clicks, and impressions per board weekly. Boards under 2% engagement after 30 days need new pin creative, not more volume.
- **Instagram:** native Insights → track saves (top signal for interior content) and profile visits from Reels vs Feed.
- **Site-side:** GA4 → segment traffic by source (`pinterest.com`, `instagram.com`) under Acquisition to confirm which platform/pillar actually converts to blog reads.

---

## 9. Assets Reference

| Asset | Location |
|---|---|
| Highlight covers | `ig-highlights/*.png` |
| Pin generator script | `pin-generator/generate-pins.mjs` |
| Pin content data (headlines/photos) | `pin-generator/pins.json` |
| Rendered sample pins | `pin-generator/out-uk/*.png` |
| Full pin catalog (all 29 posts × 3 variants) | `pin-generator/pins.json` |

To generate more pins: `node pin-generator/generate-pins.mjs pin-generator/pins.json` (renders all; use a filtered JSON subset for smaller batches, see `pins-selected.json` for the pattern).
