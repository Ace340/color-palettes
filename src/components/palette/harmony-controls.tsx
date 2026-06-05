"use client";

import { usePalette } from "@/hooks/use-palette";
import { generateHarmony, ROLE_LABELS } from "@/lib/color";
import { HARMONY_MODES } from "@/lib/types";
import type { HarmonyMode } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function HarmonyControls() {
  const { palette, setPalette } = usePalette();

  const handleGenerate = (mode: HarmonyMode) => {
    const newPalette = generateHarmony(palette.primary, mode);
    setPalette(newPalette);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Harmony</h3>
      <p className="text-xs text-muted-foreground">
        Generate from {ROLE_LABELS.primary} color
      </p>
      <div className="flex flex-wrap gap-2">
        {HARMONY_MODES.map((mode) => (
          <Button
            key={mode}
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(mode)}
            className="text-xs capitalize"
          >
            {mode.replace("-", " ")}
          </Button>
        ))}
      </div>
    </div>
  );
}
