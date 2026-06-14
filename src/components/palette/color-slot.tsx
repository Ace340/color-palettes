"use client";

import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "./color-picker";
import type { PaletteRole } from "@/lib/types";

interface ColorSlotProps {
  role: PaletteRole;
  color: string;
  onChange: (role: PaletteRole, hex: string) => void;
}

export function ColorSlot({ role, color, onChange }: ColorSlotProps) {
  const tRoles = useTranslations("Roles");
  const roleLabel = tRoles(role);

  return (
    <Popover>
      <PopoverTrigger
        className="group flex flex-col items-center gap-2 cursor-pointer"
        aria-label={tRoles("editColor", { role: roleLabel })}
      >
        <div
          className="w-20 h-20 rounded-xl border-2 border-border shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-muted-foreground font-medium">
          {roleLabel}
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
