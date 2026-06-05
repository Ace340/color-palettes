"use client";

import { usePalette } from "@/hooks/use-palette";
import { getPaletteContrasts, type ContrastLevel } from "@/lib/color";
import { Badge } from "@/components/ui/badge";

const LEVEL_COLORS: Record<ContrastLevel, string> = {
  AAA: "bg-green-500/20 text-green-400 border-green-500/30",
  AA: "bg-green-500/20 text-green-400 border-green-500/30",
  A: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  fail: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PAIR_LABELS: Record<number, string> = {
  0: "Primary / Background",
  1: "Accent / Background",
  2: "Text / Surface",
};

export function ContrastBadges() {
  const { palette } = usePalette();
  const contrasts = getPaletteContrasts(palette);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">Contrast</h3>
      <div className="flex flex-wrap gap-2">
        {contrasts.map((info, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              {PAIR_LABELS[i]}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${LEVEL_COLORS[info.level]}`}
            >
              {info.ratio}:1 {info.level}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
