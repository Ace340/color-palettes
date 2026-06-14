import { setRequestLocale } from "next-intl/server";
import { PaletteProvider } from "@/hooks/use-palette";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { GeneratorSection } from "@/components/sections/generator-section";
import { HarmonySection } from "@/components/sections/harmony-section";
import { AiSection } from "@/components/sections/ai-section";
import { PreviewSection } from "@/components/sections/preview-section";
import { Footer } from "@/components/layout/footer";

type Props = {
  params: Promise<{ locale: string }>;
};

function PaletteEditor() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <Hero />
        <GeneratorSection />
        <HarmonySection />
        <AiSection />
        <PreviewSection />
      </main>

      <Footer />
    </>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <PaletteProvider>
      <PaletteEditor />
    </PaletteProvider>
  );
}
