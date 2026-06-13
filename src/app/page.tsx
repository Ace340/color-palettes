"use client";

import { PaletteProvider } from "@/hooks/use-palette";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { GeneratorSection } from "@/components/sections/generator-section";
import { HarmonySection } from "@/components/sections/harmony-section";
import { AiSection } from "@/components/sections/ai-section";
import { PreviewSection } from "@/components/sections/preview-section";
import { Footer } from "@/components/layout/footer";

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

export default function HomePage() {
  return (
    <PaletteProvider>
      <PaletteEditor />
    </PaletteProvider>
  );
}
