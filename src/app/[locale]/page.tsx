import { setRequestLocale, getTranslations } from "next-intl/server";
import { PaletteProvider } from "@/hooks/use-palette";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { GeneratorSection } from "@/components/sections/generator-section";
import { AiSection } from "@/components/sections/ai-section";
import { PreviewSection } from "@/components/sections/preview-section";
import { FaqSection } from "@/components/sections/faq-section";
import { Footer } from "@/components/layout/footer";
import {
  buildWebApplicationSchema,
  buildFaqSchema,
} from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

type Props = {
  params: Promise<{ locale: string }>;
};

type FaqItem = { question: string; answer: string };

function PaletteEditor() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <Hero />
        <GeneratorSection />
        <AiSection />
        <PreviewSection />
        <FaqSection />
      </main>

      <Footer />
    </>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Enable static rendering for this locale.
  setRequestLocale(locale);

  // Page-level structured data: the app entity + the visible FAQ, both
  // localized so each locale describes itself to search engines.
  const meta = await getTranslations({ locale, namespace: "Metadata" });
  const faq = await getTranslations({ locale, namespace: "FaqSection" });
  const faqItems = faq.raw("items") as FaqItem[];

  return (
    <>
      <JsonLd
        data={buildWebApplicationSchema({
          locale,
          description: meta("description"),
        })}
      />
      <JsonLd data={buildFaqSchema(faqItems)} />
      <PaletteProvider>
        <PaletteEditor />
      </PaletteProvider>
    </>
  );
}
