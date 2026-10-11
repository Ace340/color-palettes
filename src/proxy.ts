import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { isSocialBot } from "./lib/share-og";

const intlMiddleware = createMiddleware(routing);

/**
 * Rewrites palette share links to the bot-facing `/share` meta page.
 *
 * Share URLs (`/?p=HEX-…`) are statically served and render client-side, so
 * social scrapers would otherwise see the generic brand OG image. When the
 * user agent is a known social crawler (Facebook, X, Discord, WhatsApp, …)
 * the request is rewritten to `/share?p=…`, which emits Open Graph tags for
 * the actual palette (see ADR-0007). Humans are never affected.
 *
 * @param paletteParam the validated-elsewhere `p` query param, may be invalid
 */
function rewriteShareBot(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  const paletteParam = searchParams.get("p");

  // Direct visits to /share: bots pass through to the meta page, everyone
  // else is bounced to the app (covered by proxy matcher since /share has
  // no file extension and is not under /api).
  if (pathname === "/share") {
    if (paletteParam && isSocialBot(request.headers.get("user-agent"))) {
      return NextResponse.next();
    }
    const appUrl = new URL("/", request.url);
    if (paletteParam) appUrl.search = `?p=${paletteParam}`;
    return NextResponse.redirect(appUrl);
  }

  // Share links on the locale roots: rewrite only for social scrapers.
  const isShareSurface = pathname === "/" || pathname === "/es" || pathname === "/en";
  if (isShareSurface && paletteParam && isSocialBot(request.headers.get("user-agent"))) {
    const shareUrl = request.nextUrl.clone();
    shareUrl.pathname = "/share";
    return NextResponse.rewrite(shareUrl);
  }

  return null;
}

/**
 * Next.js 16 "proxy" (formerly middleware). Handles:
 *  - palette share-link OG previews for social scrapers (ADR-0007)
 *  - Accept-Language detection (es -> /es, everything else -> /)
 *  - `NEXT_LOCALE` cookie so a manual locale choice persists across visits
 *  - localePrefix "as-needed" redirection (see ADR-0002)
 *
 * Note: in Next 16 this file MUST be named `proxy.ts` (not `middleware.ts`)
 * and the runtime is the Node.js runtime (edge is unsupported for proxy).
 */
export default function proxy(request: NextRequest) {
  return rewriteShareBot(request) ?? intlMiddleware(request);
}

export const config = {
  // Match all pathnames except API/internal routes and files with a dot
  // (e.g. favicon.ico, fonts, images in /public).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
