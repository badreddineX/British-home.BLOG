# British Home Interior — Newsletter

Self-hosted email capture + double opt-in + weekly digest. **Fully separate**
from the smallspacehome blog — its own repo, Vercel project, Neon database, and
Resend account. Nothing is shared.

Runs as Vercel serverless functions (`/api`) against a Neon Postgres database.
Transactional email (confirm / welcome / unsubscribe) goes through the Hostinger
mailbox `hello@britishhomeinterior.co.uk` over SMTP. The weekly digest goes
through this blog's own Resend account.

---

## Architecture

```
Visitor → <form class="nl-form">  ──POST──▶  /api/subscribe
                                              │ insert 'pending' + token
                                              │ send confirm email (Hostinger SMTP)
                                              ▼
Confirm email link  ──GET──▶  /api/confirm?token=…
                                 │ status → 'active', store confirmed_at
                                 │ send welcome email
                                 ▼  302 → /thank-you/?src=newsletter

Every email footer → /api/unsubscribe?token=…  (GET link + RFC-8058 one-click POST)

Weekly:  Vercel Cron (Mon 13:00 UTC) → /api/broadcast
   reads /newsletter-feed.json, sends only if new posts since last digest
```

| File | Role |
|---|---|
| `api/subscribe.js` `confirm.js` `unsubscribe.js` `broadcast.js` | routes |
| `api/_lib/` | db / mail (SMTP) / resend (bulk) / templates / util |
| `src/components/NewsletterForm.astro` | signup card (end of every blog post) |
| `src/components/Footer.astro` | footer signup + shared submit script for every `.nl-form` |
| `src/pages/newsletter-feed.json.js` | post list for the digest (sitemap-excluded) |
| `src/pages/thank-you.astro` | `?src=newsletter` / `newsletter-pending` / `newsletter-error` |
| `db/schema.sql` | one-time table setup |
| `vercel.json` → `crons` | weekly digest trigger |

Site stays a static Astro build — no adapter. Vercel serves `/api` as Node functions.

---

## One-time setup (all separate from smallspacehome)

### 1. Database — Neon

Create a **new** Neon project (or a new database inside an existing project) —
**do not reuse the smallspacehome database**. Open its SQL Editor, run
[`db/schema.sql`](db/schema.sql). Copy the **pooled** connection string.

### 2. Vercel env vars (this blog's project → Settings → Env Vars, Prod + Preview)

| Var | Value |
|---|---|
| `DATABASE_URL` | this blog's Neon pooled string |
| `SITE_URL` | `https://britishhomeinterior.co.uk` |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `hello@britishhomeinterior.co.uk` |
| `SMTP_PASS` | that mailbox's password |
| `NEWSLETTER_FROM` | `British Home Interior <hello@britishhomeinterior.co.uk>` |
| `NEWSLETTER_REPLY_TO` | `hello@britishhomeinterior.co.uk` |

That's enough for **capture + double opt-in**. The digest needs three more:

| Var | Value |
|---|---|
| `RESEND_API_KEY` | from this blog's **own** free Resend account |
| `NEWSLETTER_BULK_FROM` | `British Home Interior <hello@send.britishhomeinterior.co.uk>` |
| `CRON_SECRET` | a long random string |

### 3. Resend (for the digest)

1. Sign up at resend.com with `hello@britishhomeinterior.co.uk` (a **separate**
   account from smallspacehome's).
2. Add domain `send.britishhomeinterior.co.uk`, region **us-east-1**.
3. Paste its DKIM TXT + 2 SPF CNAMEs into Hostinger DNS for britishhomeinterior.co.uk.
   Use the **copy buttons** — the values are truncated in the table view.
4. Wait for **Verified**. Create an API key → `RESEND_API_KEY`.

### 4. Deploy & test

```bash
# capture flow: subscribe on the site, confirm via the email link

# digest dry run (sends nothing):
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://britishhomeinterior.co.uk/api/broadcast?dryRun=1"
```

First real digest run covers the **last 7 days** of posts (max 6). To skip the
backlog, seed the marker first:
```sql
insert into issues (slug, subject, covered_through) values ('seed', 'seed', now());
```

---

## Ops

```sql
select count(*) filter (where status='active') as active,
       count(*) filter (where status='pending') as pending
from subscribers;

-- sending list export
\copy (select email from subscribers where status='active') to 'subs.csv' csv header;
```
