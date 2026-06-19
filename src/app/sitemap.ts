import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Generates /sitemap.xml. The site is a single page served at two localized
 * roots (`/` for English, `/es` for Spanish — see ADR-0002). Each entry lists
 * hreflang alternates so search engines understand the locale relationship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const alternates = {
    languages: {
      en: SITE_URL,
      es: `${SITE_URL}/es`,
      "x-default": SITE_URL,
    },
  };

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates,
    },
    {
      url: `${SITE_URL}/es`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates,
    },
  ];
}
