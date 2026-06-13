"use client";

import { PaletteProvider, usePalette } from "@/hooks/use-palette";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { PaletteSwatches } from "@/components/palette/palette-swatches";
import { HarmonyControls } from "@/components/palette/harmony-controls";
import { AiMoodInput } from "@/components/palette/ai-mood-input";
import { ContrastBadges } from "@/components/palette/contrast-badges";
import { LivePreview } from "@/components/palette/live-preview";
import { Button } from "@/components/ui/button";

function PaletteEditor() {
  const { palette, setRoleColor, undoSurprise, canUndo } = usePalette();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <Hero />

        {/* Generator Section */}
        <section id="generator" className="pt-8 pb-16 md:pt-12 md:pb-20">
          <div className="max-w-6xl mx-auto w-full px-4 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Palette Generator
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick colors for each role, or generate from harmony and AI below
                </p>
              </div>
              <div className="flex gap-2">
                {canUndo && (
                  <Button
                    variant="ghost"
                    size="default"
                    className="text-muted-foreground animate-in fade-in duration-300"
                    onClick={undoSurprise}
                  >
                    Undo
                  </Button>
                )}
              </div>
            </div>
            <PaletteSwatches palette={palette} onColorChange={setRoleColor} />
            <ContrastBadges />
          </div>
        </section>

        {/* Harmony Section */}
        <section id="harmony" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto w-full px-4 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Harmony
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a complete palette from your primary color using color
                theory
              </p>
            </div>
            <HarmonyControls />
          </div>
        </section>

        {/* AI Generator Section */}
        <section id="ai" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto w-full px-4 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                AI Generator
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Describe a mood in natural language and let AI craft your palette
              </p>
            </div>
            <AiMoodInput />
          </div>
        </section>

        {/* Live Preview Section */}
        <section id="preview" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto w-full px-4 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Live Preview
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                See your palette in a real UI context
              </p>
            </div>
            <LivePreview />
          </div>
        </section>
      </main>
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
