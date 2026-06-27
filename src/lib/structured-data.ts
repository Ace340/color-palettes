import { SITE_URL, SITE_NAME } from "@/lib/site";

/**
 * Schema.org JSON-LD builders. Each returns a plain object rendered as a
 * `<script type="application/ld+json">` tag (see `JsonLd` component) so search
 * engines can build rich results and understand the site's entities.
 *
 * Schemas are split by scope:
 * - {@link buildOrganizationSchema} / {@link buildWebSiteSchema} — sitewide
 *   identity, rendered once in the root layout.
 * - {@link buildWebApplicationSchema} / {@link buildFaqSchema} — homepage
 *   content, rendered on the page where that content lives.
 *
 * Reference: https://schema.org (validated via Google's Rich Results spec).
 */

type Faq = ReadonlyArray<{ question: string; answer: string }>;

/** Brand identity. Rendered sitewide so Google associates the domain with one org. */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/Chrom.svg`,
  };
}

/**
 * The website entity itself. `inLanguage` is per-locale so the English and
 * Spanish variants describe themselves correctly to crawlers.
 */
export function buildWebSiteSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale,
  };
}

/**
 * Describes Chromattic as a free, browser-based design tool — the primary
 * entity Google should classify this site as. `applicationCategory` maps to
 * the schema.org DesignApplication value.
 */
export function buildWebApplicationSchema({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    inLanguage: locale,
    image: `${SITE_URL}/Chrom.svg`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/**
 * FAQ structured data. Each Q/A pair becomes eligible for rich-result
 * expansion directly in search results. The array mirrors the visible FAQ
 * section so the two never drift.
 */
export function buildFaqSchema(faqs: Faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
