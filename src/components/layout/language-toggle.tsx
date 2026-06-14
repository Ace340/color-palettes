"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * `EN | ES` text toggle. Switching locale preserves the current query string
 * (e.g. the active `?p=...` palette) so a user mid-edit doesn't lose their
 * palette when changing language. The choice persists via the `NEXT_LOCALE`
 * cookie set by the proxy.
 *
 * `useSearchParams` requires a Suspense boundary during static prerendering,
 * so the inner component is wrapped here — consumers don't need to add their
 * own boundary.
 */
function LanguageToggleInner() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const search = searchParams.toString();
  const href = search ? `/?${search}` : "/";

  return (
    <div
      className="flex items-center gap-1.5 text-xs font-medium"
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((targetLocale, index) => {
        const isCurrent = targetLocale === locale;
        const ariaLabel =
          targetLocale === "en" ? t("switchToEnglish") : t("switchToSpanish");

        return (
          <span key={targetLocale} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-muted-foreground/50" aria-hidden="true">
                |
              </span>
            )}
            <Link
              href={href}
              locale={targetLocale}
              aria-label={ariaLabel}
              aria-current={isCurrent ? "true" : undefined}
              className={
                isCurrent
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {targetLocale.toUpperCase()}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

export function LanguageToggle() {
  return (
    <Suspense fallback={null}>
      <LanguageToggleInner />
    </Suspense>
  );
}
