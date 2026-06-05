import type { Palette } from "./types";
import { isValidHex } from "./color";
import { DEFAULT_PALETTE } from "./types";
import { PALETTE_ROLES } from "./types";

const URL_PARAM = "p";

export function encodePaletteToUrl(palette: Palette): string {
  const hexValues = PALETTE_ROLES.map((role) =>
    palette[role].replace("#", "")
  );
  return `?${URL_PARAM}=${hexValues.join("-")}`;
}

export function decodePaletteFromUrl(
  searchParams: URLSearchParams
): Palette | null {
  const raw = searchParams.get(URL_PARAM);
  if (!raw) return null;

  const parts = raw.split("-");
  if (parts.length !== 5) return null;

  const hexValues = parts.map((p) => `#${p.toUpperCase()}`);
  if (!hexValues.every(isValidHex)) return null;

  const palette: Partial<Palette> = {};
  PALETTE_ROLES.forEach((role, i) => {
    palette[role] = hexValues[i];
  });

  return palette as Palette;
}

export function getDefaultOrUrlPalette(
  searchParams: URLSearchParams
): Palette {
  return decodePaletteFromUrl(searchParams) || DEFAULT_PALETTE;
}
