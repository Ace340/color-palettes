"use client";

import { PaletteProvider, usePalette } from "@/hooks/use-palette";
import { PaletteSwatches } from "@/components/palette/palette-swatches";
import { HarmonyControls } from "@/components/palette/harmony-controls";
import { AiMoodInput } from "@/components/palette/ai-mood-input";
import { ContrastBadges } from "@/components/palette/contrast-badges";
import { LivePreview } from "@/components/palette/live-preview";
import { ExportPanel } from "@/components/panels/export-panel";
import { ExtractPanel } from "@/components/panels/extract-panel";
import { HistoryPanel } from "@/components/panels/history-panel";
import { Separator } from "@/components/ui/separator";

function PaletteEditor() {
  const { palette, setRoleColor } = usePalette();

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Color Palettes</h1>
          <p className="text-sm text-muted-foreground">
            Create, generate, and export beautiful color palettes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HistoryPanel />
          <ExtractPanel />
          <ExportPanel />
        </div>
      </header>

      <Separator />

      {/* Palette Swatches */}
      <section>
        <PaletteSwatches palette={palette} onColorChange={setRoleColor} />
      </section>

      <Separator />

      {/* Creation Tools */}
      <section className="flex flex-col gap-6">
        <HarmonyControls />
        <AiMoodInput />
      </section>

      <Separator />

      {/* Contrast Info */}
      <ContrastBadges />

      {/* Live Preview */}
      <LivePreview />
    </main>
  );
}

export default function HomePage() {
  return (
    <PaletteProvider>
      <PaletteEditor />
    </PaletteProvider>
  );
}
