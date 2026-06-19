import type { MetadataRoute } from "next";

/**
 * Generates /manifest.webmanifest for installable / PWA metadata and a richer
 * "add to home screen" experience. Icons reference the existing root favicon
 * and brand SVG; upgrade to dedicated 192/512 PNG assets in a future pass.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chromattic — Color Palette Generator for Designers",
    short_name: "Chromattic",
    description:
      "Generate beautiful color palettes with harmony presets, AI mood-based generation, image extraction, and multi-format export.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/Chrom.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
