import type { Palette } from "./types";
import { isValidHex } from "./color";
import { DEFAULT_PALETTE } from "./types";

const STORAGE_KEY = "color-palettes-saved";
const MAX_PALETTES = 20;

export interface StoredPalette {
  id: string;
  colors: Palette;
  createdAt: number;
}

export function loadSavedPalettes(): StoredPalette[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function savePalette(palette: Palette): StoredPalette[] {
  const existing = loadSavedPalettes();
  const newEntry: StoredPalette = {
    id: crypto.randomUUID(),
    colors: palette,
    createdAt: Date.now(),
  };

  const updated = [newEntry, ...existing].slice(0, MAX_PALETTES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deletePalette(id: string): StoredPalette[] {
  const existing = loadSavedPalettes();
  const updated = existing.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
