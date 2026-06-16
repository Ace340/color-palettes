"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, Copy } from "lucide-react";
import { hexToHsl, hslToHex } from "@/lib/color";
import type { PaletteRole } from "@/lib/types";

interface ColorPickerProps {
  color: string;
  role: PaletteRole;
  onChange: (hex: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const hsl = hexToHsl(color);
  const [copied, setCopied] = useState(false);

  const copyHex = async () => {
    await navigator.clipboard.writeText(color.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="min-w-0 flex-1 bg-muted rounded px-2 py-1 text-xs font-mono text-foreground"
        />
        <button
          type="button"
          onClick={copyHex}
          aria-label={copied ? "Copied" : "Copy hex"}
          className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded bg-muted hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
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
