# Norfu Admin

Content management panel for the [Norfu storefront](https://github.com/fakiha214/norfu).
Both apps share the same Neon Postgres database; the storefront picks up
changes within about a minute (60s ISR).

## What it controls

- **Products** — create/edit/delete, pricing & sale price, badge (New/Sale),
  sizes, colours, images, visibility, sort order
- **Banners** — homepage hero, promo tiles and category tiles (copy, links, images)
- **Announcements** — the marquee messages at the top of the storefront
- **Settings** — free-shipping threshold, homepage section titles
- **Subscribers** — newsletter email list

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET
npm run dev            # http://localhost:3000
```

Database migrations live in the storefront repo (`drizzle/`), which owns the schema.

## Deploy (Vercel)

Import this repo as a new Vercel project and set three environment variables:
`DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
