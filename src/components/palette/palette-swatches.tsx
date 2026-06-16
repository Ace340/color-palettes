"use client";

import { getRoleOrder } from "@/lib/color";
import { ColorSlot } from "./color-slot";
import type { Palette, PaletteRole } from "@/lib/types";

interface PaletteSwatchesProps {
  palette: Palette;
  onColorChange: (role: PaletteRole, hex: string) => void;
}

export function PaletteSwatches({ palette, onColorChange }: PaletteSwatchesProps) {
  const roles = getRoleOrder();

  return (
    <div className="flex items-start justify-center gap-2 flex-wrap">
      {roles.map((role) => (
        <ColorSlot
          key={role}
          role={role}
          color={palette[role]}
          onChange={onColorChange}
        />
      ))}
    </div>
  );
}
