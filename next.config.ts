import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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
