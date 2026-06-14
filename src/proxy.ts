import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16 "proxy" (formerly middleware). Handles:
 *  - Accept-Language detection (es -> /es, everything else -> /)
 *  - `NEXT_LOCALE` cookie so a manual locale choice persists across visits
 *  - localePrefix "as-needed" redirection (see ADR-0002)
 *
 * Note: in Next 16 this file MUST be named `proxy.ts` (not `middleware.ts`)
 * and the runtime is the Node.js runtime (edge is unsupported for proxy).
 */
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API/internal routes and files with a dot
  // (e.g. favicon.ico, fonts, images in /public).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
