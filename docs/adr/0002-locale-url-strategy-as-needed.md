# ADR 0002: Locale URL strategy — `as-needed` prefix

English (the default locale) is served at `/` with no prefix; Spanish is served at `/es`. A Spanish-preferring browser hitting `/` is redirected to `/es`; everyone else stays at `/`.

## Considered Options

- **`as-needed` (chosen)** — English at `/`, Spanish at `/es`.
- **`always`** — English at `/en`, Spanish at `/es`, with `/` always redirecting. Rejected because it turns every existing shared palette link (`/?p=FF5733-...`, see CONTEXT.md "Palette Persistence / URL encoding") into a 302 to `/en?p=...` — an extra hop and a place for the palette query string to be dropped. `as-needed` keeps those links working verbatim.

## Consequences

- Changing this later would break every indexed/shared URL, so it is effectively irreversible.
- Links must omit the locale prefix for English but include it for Spanish; `next-intl`'s `Link` handles this automatically.
