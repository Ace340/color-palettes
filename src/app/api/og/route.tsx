import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PALETTE_ROLES, DEFAULT_PALETTE } from "@/lib/types";
import { parseHexColors } from "@/lib/share-og";

/**
 * Per-palette social preview image (1200x630) for share links.
 *
 * Renders the five colors of a shared palette as full-height columns with hex
 * labels, branded with the Chromattic wordmark. Consumed by the `/share` meta
 * page (see ADR-0007); not meant for direct human navigation.
 *
 * Caching: each palette URL is immutable, so responses are safe to cache at
 * the edge for a day and serve stale while revalidating for a week.
 */
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Invalid or missing palettes fall back to the default starter palette,
  // mirroring the client-side silent-fallback rule for share URLs.
  const colors =
    parseHexColors(request.nextUrl.searchParams.get("colors")) ??
    PALETTE_ROLES.map((role) => DEFAULT_PALETTE[role]);

  const fontData = await loadBrandFont(request.nextUrl.origin);

  const image = renderImageResponse(colors, fontData);

  // Each palette URL is immutable, so the image is safe to cache at the edge
  // for a day and serve stale while revalidating for a week.
  return new Response(image.body, {
    status: image.status,
    headers: {
      "content-type": image.headers.get("content-type") ?? "image/png",
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

function renderImageResponse(
  colors: string[],
  fontData: Buffer
): Response {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0b0b12 0%, #1a1a2e 60%, #16213e 100%)",
          fontFamily: "Cabinet Grotesk",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            padding: "56px 72px 0",
          }}
        >
          <div style={{ color: "white", fontSize: 56, fontWeight: 800 }}>
            Chromattic
          </div>
          <div style={{ color: "#9ca3af", fontSize: 30 }}>chromattic.app</div>
        </div>

        {/* Palette columns */}
        <div
          style={{
            display: "flex",
            flex: 1,
            margin: "48px 72px 0",
            borderRadius: 28,
            overflow: "hidden",
          }}
        >
          {colors.map((color, index) => (
            <div
              key={color + index}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                background: color,
                padding: "36px 0",
              }}
            >
              <div
                style={{
                  color: "rgba(0,0,0,0.55)",
                  fontSize: 24,
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: 12,
                  padding: "6px 18px",
                }}
              >
                {color}
              </div>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.6)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "28px 0 40px",
          }}
        >
          <div style={{ color: "#9ca3af", fontSize: 30 }}>
            AI color palette generator
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Cabinet Grotesk",
          data: fontData,
          style: "normal",
          weight: 800,
        },
      ],
    }
  );
}

/**
 * Loads the brand font for the image renderer. Prefers the local bundle
 * (fast, works with `next start`) and falls back to fetching the immutable
 * CDN copy when the filesystem copy is not available (e.g. some serverless
 * bundles).
 */
async function loadBrandFont(origin: string): Promise<Buffer> {
  try {
    // Satori cannot parse WOFF2 ("Unsupported OpenType signature wOF2"), so
    // the image renders from the TTF build of the same Fontshare font.
    return await readFile(
      join(process.cwd(), "public/fonts/CabinetGrotesk-Extrabold.ttf")
    );
  } catch {
    const response = await fetch(
      new URL("/fonts/CabinetGrotesk-Extrabold.ttf", origin)
    );
    return Buffer.from(await response.arrayBuffer());
  }
}
