"use client";

import { HexColorPicker } from "react-colorful";
import { hexToHsl, hslToHex } from "@/lib/color";
import type { PaletteRole } from "@/lib/types";

interface ColorPickerProps {
  color: string;
  role: PaletteRole;
  onChange: (hex: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const hsl = hexToHsl(color);

  return (
    <div className="flex flex-col gap-3 p-1">
      <HexColorPicker color={color} onChange={onChange} />

      <div className="grid grid-cols-3 gap-2">
        <SliderInput
          label="H"
          value={hsl.h}
          min={0}
          max={360}
          onChange={(h) => onChange(hslToHex(h, hsl.s, hsl.l))}
        />
        <SliderInput
          label="S"
          value={hsl.s}
          min={0}
          max={100}
          onChange={(s) => onChange(hslToHex(hsl.h, s, hsl.l))}
        />
        <SliderInput
          label="L"
          value={hsl.l}
          min={0}
          max={100}
          onChange={(l) => onChange(hslToHex(hsl.h, hsl.s, l))}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">HEX</span>
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
              onChange(val);
            }
          }}
          className="w-full bg-muted rounded px-2 py-1 text-xs font-mono text-foreground"
        />
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-primary"
      />
    </div>
  );
}
