"use client";

import { useTranslations } from "next-intl";
import { usePalette } from "@/hooks/use-palette";
import { generateHarmony } from "@/lib/color";
import { HARMONY_MODES } from "@/lib/types";
import type { HarmonyMode } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function HarmonyControls() {
  const t = useTranslations("HarmonyControls");
  const tRoles = useTranslations("Roles");
  const { palette, setPalette } = usePalette();

  const handleGenerate = (mode: HarmonyMode) => {
    const newPalette = generateHarmony(palette.primary, mode);
    setPalette(newPalette);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{t("heading")}</h3>
      <p className="text-xs text-muted-foreground">
        {t("generateFrom", { role: tRoles("primary") })}
      </p>
      <div className="flex flex-wrap gap-2">
        {HARMONY_MODES.map((mode) => (
          <Button
            key={mode}
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(mode)}
            className="text-xs"
          >
            {t(`modes.${mode}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
