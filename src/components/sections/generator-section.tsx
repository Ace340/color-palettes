"use client";

import { usePalette } from "@/hooks/use-palette";
import { Section } from "@/components/layout/section";
import { PaletteSwatches } from "@/components/palette/palette-swatches";
import { ContrastBadges } from "@/components/palette/contrast-badges";
import { Button } from "@/components/ui/button";

export function GeneratorSection() {
  const { palette, setRoleColor, undoSurprise, canUndo } = usePalette();

  return (
    <Section
      id="generator"
      title="Palette Generator"
      description="Pick colors for each role, or generate from harmony and AI below"
      className="pt-8 pb-16 md:pt-12 md:pb-20"
      headerActions={
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
      }
    >
      <PaletteSwatches palette={palette} onColorChange={setRoleColor} />
      <ContrastBadges />
    </Section>
  );
}
