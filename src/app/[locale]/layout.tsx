import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

const cabinetGrotesk = localFont({
  src: [
    {
      path: "../../../public/fonts/CabinetGrotesk-Regular.woff2",
      weight: "400",
    },
    { path: "../../../public/fonts/CabinetGrotesk-Medium.woff2", weight: "500" },
    { path: "../../../public/fonts/CabinetGrotesk-Bold.woff2", weight: "700" },
    {
      path: "../../../public/fonts/CabinetGrotesk-ExtraBold.woff2",
      weight: "800",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Pre-render both locales at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Canonical production origin used to resolve relative metadata URLs. */
const SITE_URL = "https://chromattic.vercel.app";

/**
 * Localized SEO metadata + hreflang alternates.
 *
 * Hreflang follows the `as-needed` URL strategy (ADR-0002): English is served
 * at `/` with no prefix, Spanish at `/es`. Title/description come from the
 * per-locale `Metadata` message namespace so each language renders its own copy.
 */
export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const isEs = locale === "es";

  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s · Chromattic",
    },
    description,
    keywords: [
      "color palette generator",
      "generador de paletas",
      "color picker",
      "design tools",
      "herramientas de diseño",
      "color harmony",
      "WCAG",
      "UI colors",
      "Tailwind colors",
      "CSS variables",
      "chromattic",
      "palette maker",
      "color scheme",
    ],
    authors: [{ name: "Chromattic" }],
    creator: "Chromattic",
    openGraph: {
      type: "website",
      locale: isEs ? "es_ES" : "en_US",
      alternateLocale: [isEs ? "en_US" : "es_ES"],
      url: isEs ? `${SITE_URL}/es` : SITE_URL,
      siteName: "Chromattic",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: isEs ? "/es" : "/",
      languages: {
        en: "/",
        es: "/es",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Reject unsupported locales (e.g. /fr) with the not-found UI.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cabinetGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
