// Domain types for the Color Palettes application

export const PALETTE_ROLES = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
] as const;

export type PaletteRole = (typeof PALETTE_ROLES)[number];

export type Palette = Record<PaletteRole, string>; // hex strings, e.g. "#FF5733"

export const HARMONY_MODES = [
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "tetradic",
  "monochromatic",
] as const;

export type HarmonyMode = (typeof HARMONY_MODES)[number];

export interface SavedPalette {
  id: string;
  colors: Palette;
  createdAt: number;
}

export const DEFAULT_PALETTE: Palette = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  accent: "#F59E0B",
  background: "#F8FAFC",
  surface: "#F1F5F9",
};
