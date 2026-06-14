import { defineRouting } from "next-intl/routing";

/**
 * Central i18n routing configuration.
 *
 * - `as-needed` prefix: the default locale (en) is served at `/` with no prefix;
 *   Spanish is served at `/es`. This keeps existing `?p=...` share URLs working
 *   verbatim (see ADR-0002) and avoids a `/` -> `/en` redirect hop.
 */
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
