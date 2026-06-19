import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Security headers applied to every route. The CSP is intentionally permissive
// around inline script/style because Next.js injects inline bootstrap scripts
// and the app uses inline styles (Tailwind v4 + react-colorful). Tighten with
// nonces later if desired — this is the safe launch baseline.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js bootstraps via inline scripts; nonces are a future hardening.
      "script-src 'self' 'unsafe-inline'",
      // Tailwind v4 is a compiled stylesheet, but inline styles are still used.
      "style-src 'self' 'unsafe-inline'",
      // colorthief + react-colorful rely on data/blob URLs for uploaded images.
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // Server actions POST back to the same origin.
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework via the x-powered-by response header.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Our root layout lives under a dynamic [locale] segment, so a regular
  // not-found.tsx can't compose a 404 page (no parent layout above [locale]).
  // global-not-found.tsx handles both unmatched URLs and notFound() from the
  // [locale] layout. See:
  //   node_modules/next/dist/docs/.../file-conventions/not-found.md
  experimental: {
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
