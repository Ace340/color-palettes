/**
 * Twitter/X card preview image (1200x630). Re-exports the Open Graph image so
 * the two social surfaces always show the identical preview and never drift.
 *
 * Next.js does not auto-fall back from `opengraph-image` to
 * `twitter-image`, so without this file `twitter:image` would be unset and
 * Twitter/LinkedIn shares would render with no preview card.
 */
export { default, alt, size, contentType } from "./opengraph-image";
