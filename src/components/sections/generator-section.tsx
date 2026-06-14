"use client";

import { useTranslations } from "next-intl";
import { usePalette } from "@/hooks/use-palette";
import { Section } from "@/components/layout/section";
import { PaletteSwatches } from "@/components/palette/palette-swatches";
import { ContrastBadges } from "@/components/palette/contrast-badges";
import { Button } from "@/components/ui/button";

export function GeneratorSection() {
  const t = useTranslations("GeneratorSection");
  const { palette, setRoleColor, undoSurprise, canUndo } = usePalette();

  return (
    <Section
      id="generator"
      title={t("title")}
      description={t("description")}
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
              {t("undo")}
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
