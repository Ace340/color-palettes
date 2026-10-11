import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { encodeHexColors, parseHexColors } from "@/lib/share-og";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Minimal bot-facing HTML for palette share links (see ADR-0007).
 *
 * Social scrapers read meta tags only, so this page contains nothing but the
 * Open Graph / Twitter tags describing the shared palette — title, hex list
 * and a per-palette preview image from `/api/og`. Humans never land here:
 * the proxy redirects them to the real app, and a `<meta refresh>` + link
 * cover anyone who reaches this URL directly.
 *
 * The canonical tag points at the homepage root, consolidating all share
 * URLs (`/?p=…` × ∞ palettes) into a single indexable page.
 */
export function GET(request: NextRequest) {
  const paletteParam = request.nextUrl.searchParams.get("p");
  const colors = parseHexColors(paletteParam);

  // Invalid share links go to the homepage, same as the client-side fallback.
  if (!colors || !paletteParam) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const hexParam = encodeHexColors(colors);
  const pageUrl = `${SITE_URL}/?p=${hexParam}`;
  const imageUrl = `${SITE_URL}/api/og?colors=${hexParam}`;
  const hexList = colors.join(" ");
  const title = `${hexList} · ${SITE_NAME}`;
  const description = `A 5-color palette (${hexList}) made with ${SITE_NAME}, the AI color palette generator.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${SITE_URL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Color palette ${hexList}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
<meta http-equiv="refresh" content="0;url=${pageUrl}">
</head>
<body>
<noscript><p><a href="${pageUrl}">Open this palette in ${SITE_NAME}</a></p></noscript>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Bot-facing only; a short edge cache keeps repeated scrapes cheap.
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
