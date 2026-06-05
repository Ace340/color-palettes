"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "./color-picker";
import { ROLE_LABELS } from "@/lib/color";
import type { PaletteRole } from "@/lib/types";

interface ColorSlotProps {
  role: PaletteRole;
  color: string;
  onChange: (role: PaletteRole, hex: string) => void;
}

export function ColorSlot({ role, color, onChange }: ColorSlotProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="group flex flex-col items-center gap-2 cursor-pointer"
        aria-label={`Edit ${ROLE_LABELS[role]} color`}
      >
        <div
          className="w-20 h-20 rounded-xl border-2 border-border shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-muted-foreground font-medium">
          {ROLE_LABELS[role]}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/70">
          {color.toUpperCase()}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" side="bottom" align="center">
        <ColorPicker
          color={color}
          role={role}
          onChange={(hex) => onChange(role, hex)}
        />
      </PopoverContent>
    </Popover>
  );
}
