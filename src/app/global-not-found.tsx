import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";

// English-only global 404 — intentionally not translated (ADR-0002, Q10).
// Bypasses normal rendering (including next-intl provider) so it must ship its
// own <html>, <body>, styles, and fonts.

const cabinetGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/CabinetGrotesk-Regular.woff2",
      weight: "400",
    },
    { path: "../../public/fonts/CabinetGrotesk-Bold.woff2", weight: "700" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Not Found — Color Palettes",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${cabinetGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center justify-center bg-background text-foreground px-6 text-center">
        <p className="font-heading text-7xl font-extrabold text-muted-foreground">
          404
        </p>
        <h1 className="font-heading mt-4 text-2xl font-bold">
          Page Not Found
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Back to Color Palettes
        </Link>
      </body>
    </html>
  );
}
