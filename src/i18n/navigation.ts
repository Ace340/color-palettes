import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation APIs. Prefer these over the ones from `next/navigation`
 * so links/redirects respect the `as-needed` prefix strategy automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
