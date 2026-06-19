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
