import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Generates /robots.txt. The whole app is public and crawlable; we just point
 * crawlers at the sitemap so both locales (`/` and `/es`) are discoverable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
