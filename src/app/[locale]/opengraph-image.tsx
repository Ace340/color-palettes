import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Dynamically generates the Open Graph / social-preview image (1200x630) at
 * build time. Auto-injected into <head> for both locales via the
 * opengraph-image file convention — no change needed in the layout's metadata.
 */
export const alt = "Chromattic — AI color palette generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SWATCHES = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

export default async function Image() {
  const fontData = await readFile(
    join(process.cwd(), "public/fonts/CabinetGrotesk-ExtraBold.woff2")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0b0b12 0%, #1a1a2e 60%, #16213e 100%)",
          fontFamily: "Cabinet Grotesk",
        }}
      >
        <div style={{ display: "flex", gap: 24, marginBottom: 48 }}>
          {SWATCHES.map((color) => (
            <div
              key={color}
              style={{
                width: 88,
                height: 88,
                borderRadius: 20,
                background: color,
                boxShadow: `0 12px 40px ${color}66`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            color: "white",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          Chromattic
        </div>
        <div style={{ color: "#9ca3af", fontSize: 36, marginTop: 16 }}>
          AI color palette generator
        </div>
      </div>
    ),
    {
      ...size,
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
