import type { JSX } from "react";

/**
 * Renders a JSON-LD structured-data script tag. Uses a native `<script>` (not
 * `next/script`) per Next.js guidance: JSON-LD is structured data, not
 * executable JS. The serialized JSON is XSS-escaped by replacing `<` with its
 * Unicode escape so injected `</script>` sequences can't break out of the tag.
 *
 * Reference: node_modules/next/dist/docs/.../guides/json-ld.mdx
 */
export function JsonLd({ data }: { data: Record<string, unknown> }): JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  );
}
