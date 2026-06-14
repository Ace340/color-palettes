# ADR 0003: Use next-intl for internationalization

We use `next-intl` for i18n rather than Next 16's built-in "dictionaries" pattern.

## Considered Options

- **`next-intl` (chosen)** — full library: `useTranslations` hook, `NextIntlClientProvider`, ICU message format, and routing/detection/cookie handling via `createMiddleware`.
- **Built-in dictionaries pattern** — the zero-dependency pattern shown in Next 16's official i18n guide (`getDictionary` + server-only JSON). Rejected because this app is unusually client-heavy (`page.tsx` is `"use client"`, `PaletteProvider` wraps everything, all panels/pickers are client components). Translations must reach deeply nested client components; the dictionaries pattern would require hand-rolling a client context, a `t` hook, `as-needed` prefix routing, and the `NEXT_LOCALE` cookie — effectively re-inventing a mini next-intl.

## Context

`next-intl` is fully compatible with Next 16: its middleware lives in `src/proxy.ts` (renamed from `middleware.ts` in Next 16), supports the `[locale]` segment with async `params`, and provides `as-needed` prefix routing, `Accept-Language` detection, and the `NEXT_LOCALE` cookie as configuration flags. This matches the decisions in ADR-0002 (URL strategy) and the detection/persistence behavior.

## Consequences

- One runtime dependency added; all UI strings flow through `useTranslations` / `getTranslations`, making a future swap non-trivial.
- A future reader seeing Next 16's guide push the dictionaries pattern may question this choice — the client-heavy nature of the app is the justification.
- The routing file is `src/proxy.ts` (not `middleware.ts`); Next 16 deprecates the `middleware` filename and named export.
