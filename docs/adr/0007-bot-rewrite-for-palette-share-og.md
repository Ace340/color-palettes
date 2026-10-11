# ADR-0007: Bot-only rewrite for palette share-link OG previews

Date: 2026-10-11

## Status

Accepted

## Context

Palette share links (`/?p=6366F1-8B5CF6-F59E0B-F8FAFC-F1F5F9`) are the core
growth loop: every palette can be shared to Discord, X, Facebook, WhatsApp,
etc. Those surfaces render link previews from Open Graph meta tags in the
initial HTML.

The homepage is statically prerendered (ADR-0002, `generateStaticParams`) and
the `?p` parameter is decoded client-side (`decodePaletteFromUrl`). As a
result every share link currently produces the **generic brand OG image** —
scrapers never see the actual palette.

Naive fixes have poor trade-offs:

- **Dynamic rendering for URLs with `?p`** (reading `searchParams` in
  `generateMetadata`) would un-static the entire homepage — the main SEO
  surface — making every visit pay SSR latency so that scrapers can be happy.
- **Client-side meta injection** is invisible to scrapers by definition.

## Decision

Serve a dedicated **bot-facing meta page** via a proxy rewrite, keeping the
human experience 100% static:

1. **`src/app/api/og/route.tsx`** — generates a 1200×630 preview image of the
   five palette colors with `ImageResponse` (`next/og`), one cached response
   per palette URL.
2. **`src/app/share/route.ts`** — minimal HTML containing only OG/Twitter
   meta tags for the palette, with `og:image` pointing at the API route,
   `<meta refresh>` as a human fallback, and canonical to the homepage root
   so all `?p` variants consolidate into one indexable URL.
3. **`src/proxy.ts`** — when a request for `/`, `/es` or `/en` carries a `p`
   param **and** the user agent matches known social scrapers
   (`isSocialBot`: Facebook, X, Discord, WhatsApp, Telegram, Slack,
   LinkedIn, Pinterest, …), rewrite to `/share?p=…`. All other requests pass
   through untouched to next-intl. Direct human visits to `/share` redirect
   to the app.

Googlebot and other SEO crawlers are intentionally **not** matched: they
should keep indexing the real pages; canonical consolidation handles the
share-URL space.

## Consequences

- Humans never observe a change: same static HTML, same TTFB.
- Social previews show the actual palette — each share becomes a visual ad.
- Two extra runtime surfaces to maintain (image route, meta page), both pure
  and covered by unit tests for the parsing/matching logic
  (`src/lib/share-og.ts`).
- `ImageResponse` renders with Satori: flexbox only, no CSS grid — the image
  layout is deliberately simple.
- The scraper UA list is a maintained allow-list; unknown/new bots fall back
  to the generic brand image (acceptable default).
