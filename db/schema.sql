-- British Home Interior — newsletter subscriber store
-- Run once in the Neon SQL editor for THIS blog's OWN database
-- (separate from the smallspacehome database). Safe to re-run.

create table if not exists subscribers (
  id               bigint generated always as identity primary key,
  email            text        not null unique,
  status           text        not null default 'pending'
                                check (status in ('pending', 'active', 'unsubscribed')),
  token            text        not null unique,
  source           text,
  consent_ip       text,
  consent_ua       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  confirmed_at     timestamptz,
  unsubscribed_at  timestamptz
);

create index if not exists subscribers_status_idx on subscribers (status);
create index if not exists subscribers_created_at_idx on subscribers (created_at);

create table if not exists issues (
  id              bigint      generated always as identity primary key,
  slug            text        not null unique,
  subject         text        not null,
  sent_at         timestamptz,
  recipient_count integer     not null default 0,
  covered_through timestamptz,
  idea_slug       text,
  created_at      timestamptz not null default now()
);

-- If `issues` predates these columns (safe to re-run):
alter table issues add column if not exists covered_through timestamptz;
alter table issues add column if not exists idea_slug text;
