import chroma from "chroma-js";
import type { Palette, PaletteRole, HarmonyMode } from "./types";
import { PALETTE_ROLES } from "./types";

// --- Harmony Generation ---

const IDENTITY_ROLES: PaletteRole[] = ["primary", "secondary", "accent"];
const FOUNDATION_ROLES: PaletteRole[] = ["background", "surface"];

export function generateHarmony(
  baseHex: string,
  mode: HarmonyMode
): Palette {
  const base = chroma(baseHex);
  const identityColors = generateIdentityColors(base, mode);
  const foundationColors = generateFoundationColors(base);

  const palette: Partial<Palette> = {};

  IDENTITY_ROLES.forEach((role, i) => {
    palette[role] = identityColors[i] || base.hex();
  });

  FOUNDATION_ROLES.forEach((role, i) => {
    palette[role] = foundationColors[i];
  });

  return palette as Palette;
}

function generateIdentityColors(
  base: chroma.Color,
  mode: HarmonyMode
): string[] {
  const [h, s, l] = base.hsl();

  switch (mode) {
    case "complementary":
      return [
        base.hex(),
        chroma.hsl((h + 180) % 360, s, l).hex(),
        chroma.hsl((h + 150) % 360, Math.min(s * 1.2, 1), l).hex(),
      ];

    case "analogous":
      return [
        base.hex(),
        chroma.hsl((h + 30) % 360, s, l).hex(),
        chroma.hsl((h - 30 + 360) % 360, s, l).hex(),
      ];

    case "triadic":
      return [
        base.hex(),
        chroma.hsl((h + 120) % 360, s, l).hex(),
        chroma.hsl((h + 240) % 360, s, l).hex(),
      ];

    case "split-complementary":
      return [
        base.hex(),
        chroma.hsl((h + 150) % 360, s, l).hex(),
        chroma.hsl((h + 210) % 360, s, l).hex(),
      ];

    case "tetradic":
      return [
        base.hex(),
        chroma.hsl((h + 90) % 360, s, l).hex(),
        chroma.hsl((h + 180) % 360, s, l).hex(),
      ];

    case "monochromatic":
      return [
        base.hex(),
        chroma.hsl(h, s, Math.min(l * 1.3, 0.9)).hex(),
        chroma.hsl(h, Math.min(s * 1.3, 1), Math.max(l * 0.7, 0.1)).hex(),
      ];
  }
}

function generateFoundationColors(base: chroma.Color): string[] {
  // Background: very low saturation, very high lightness
  const background = chroma
    .hsl(base.hsl()[0], 0.05, 0.97)
    .hex();

  // Surface: slightly lower lightness than background
  const surface = chroma
    .hsl(base.hsl()[0], 0.08, 0.93)
    .hex();

  return [background, surface];
}

// --- Contrast Checking ---

export function getContrastRatio(color1: string, color2: string): number {
  return chroma.contrast(color1, color2);
}

export type ContrastLevel = "AAA" | "AA" | "A" | "fail";

export function getContrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "A";
  return "fail";
}

export interface ContrastInfo {
  foreground: string;
  background: string;
  ratio: number;
  level: ContrastLevel;
}

export function getPaletteContrasts(
  palette: Palette
): ContrastInfo[] {
  const pairings: [string, string, string][] = [
    ["primary", palette.primary, palette.background],
    ["accent", palette.accent, palette.background],
    ["surface-text", "#000000", palette.surface],
  ];

  return pairings.map(([label, fg, bg]) => {
    const ratio = getContrastRatio(fg, bg);
    return {
      foreground: fg,
      background: bg,
      ratio: Math.round(ratio * 10) / 10,
      level: getContrastLevel(ratio),
    };
  });
}

// --- Color Utilities ---

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [h, s, l] = chroma(hex).hsl();
  return {
    h: isNaN(h) ? 0 : Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  return chroma.hsl(h, s / 100, l / 100).hex();
}

// --- Smart Map (for image extraction) ---

export function smartMapToPalette(colors: string[]): Palette {
  if (colors.length < 5) {
    // Pad with variations if fewer than 5 extracted
    while (colors.length < 5) {
      const last = colors[colors.length - 1];
      const [h, s, l] = chroma(last).hsl();
      colors.push(chroma.hsl(h, s, Math.min(l + 0.1, 0.95)).hex());
    }
  }

  const chromaColors = colors.map((c) => {
    const [h, s, l] = chroma(c).hsl();
    return {
      hex: c,
      saturation: isNaN(s) ? 0 : s,
      lightness: chroma(c).luminance(),
    };
  });

  // Sort by saturation (most vivid first)
  const bySaturation = [...chromaColors].sort((a, b) => b.saturation - a.saturation);
  // Sort by lightness (lightest first)
  const byLightness = [...chromaColors].sort(
    (a, b) => b.lightness - a.lightness
  );

  const assigned = new Set<number>();

  // Most vivid → accent
  const accentIdx = chromaColors.indexOf(bySaturation[0]);
  assigned.add(accentIdx);

  // Lightest → background
  const bgEntry = byLightness.find((entry) => {
    const origIdx = chromaColors.indexOf(entry);
    return !assigned.has(origIdx);
  });
  const bgIdx = bgEntry ? chromaColors.indexOf(bgEntry) : 0;
  assigned.add(bgIdx);

  // Second lightest → surface
  const surfaceEntry = byLightness.find((entry) => {
    const origIdx = chromaColors.indexOf(entry);
    return !assigned.has(origIdx);
  });
  const surfaceIdx = surfaceEntry ? chromaColors.indexOf(surfaceEntry) : 1;
  assigned.add(surfaceIdx);

  // Remaining by dominance → primary, secondary
  const remaining = chromaColors
    .map((_, i) => i)
    .filter((i) => !assigned.has(i));

  return {
    primary: chromaColors[remaining[0]]?.hex || colors[0],
    secondary: chromaColors[remaining[1]]?.hex || colors[1],
    accent: chromaColors[accentIdx].hex,
    background: chromaColors[bgIdx].hex,
    surface: chromaColors[surfaceIdx].hex,
  };
}

// --- Role Labels ---

export const ROLE_LABELS: Record<PaletteRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  surface: "Surface",
};

// --- Palette Keys in order ---

export function getRoleOrder(): PaletteRole[] {
  return [...PALETTE_ROLES];
}
