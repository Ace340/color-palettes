/**
 * Canonical production origin. Resolved once at module load so every
 * metadata / sitemap / robots surface agrees on the same base URL.
 *
 * Set the `SITE_URL` environment variable (server-side) when deploying to a
 * custom domain so canonical and Open Graph URLs resolve correctly. Falls back
 * to the default Vercel URL so local dev and first deploys work without any
 * configuration.
 *
 * Server-side only: metadata, robots.ts and sitemap.ts all run on the server.
 */
export const SITE_URL =
  process.env.SITE_URL ?? "https://chromattic.vercel.app";

/** Public brand name. Used by metadata, manifest, and structured data. */
export const SITE_NAME = "Chromattic";

/**
 * Google Search Console verification token. When set, `generateMetadata`
 * emits `<meta name="google-site-verification" content="...">` so the site can
 * be claimed in Search Console. Server-side only; undefined until configured.
 *
 * Get the value from Search Console → Add property → HTML tag method.
 */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION;
