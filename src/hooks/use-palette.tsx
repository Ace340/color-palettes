"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Palette, PaletteRole, SavedPalette } from "@/lib/types";
import { DEFAULT_PALETTE } from "@/lib/types";
import { PALETTE_ROLES } from "@/lib/types";
import {
  loadSavedPalettes,
  savePalette,
  deletePalette,
} from "@/lib/palette-storage";
import { encodePaletteToUrl, decodePaletteFromUrl } from "@/lib/url-encoding";

interface PaletteState {
  palette: Palette;
  savedPalettes: SavedPalette[];
  setRoleColor: (role: PaletteRole, hex: string) => void;
  setPalette: (palette: Palette) => void;
  save: () => void;
  remove: (id: string) => void;
  loadSaved: (palette: Palette) => void;
  shareUrl: string;
}

const PaletteContext = createContext<PaletteState | null>(null);

export function usePalette(): PaletteState {
  const ctx = useContext(PaletteContext);
  if (!ctx) {
    throw new Error("usePalette must be used within a PaletteProvider");
  }
  return ctx;
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<Palette>(DEFAULT_PALETTE);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);

  // Initialize from URL or default on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPalette = decodePaletteFromUrl(params);
    if (urlPalette) {
      setPaletteState(urlPalette);
    }

    setSavedPalettes(loadSavedPalettes());
  }, []);

  // Sync URL when palette changes
  useEffect(() => {
    const url = encodePaletteToUrl(palette);
    window.history.replaceState(null, "", url);
  }, [palette]);

  const setRoleColor = useCallback((role: PaletteRole, hex: string) => {
    setPaletteState((prev) => ({ ...prev, [role]: hex }));
  }, []);

  const setPalette = useCallback((newPalette: Palette) => {
    setPaletteState(newPalette);
  }, []);

  const save = useCallback(() => {
    const updated = savePalette(palette);
    setSavedPalettes(updated);
  }, [palette]);

  const remove = useCallback((id: string) => {
    const updated = deletePalette(id);
    setSavedPalettes(updated);
  }, []);

  const loadSaved = useCallback((saved: Palette) => {
    setPaletteState(saved);
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${encodePaletteToUrl(palette)}`
      : "";

  return (
    <PaletteContext.Provider
      value={{
        palette,
        savedPalettes,
        setRoleColor,
        setPalette,
        save,
        remove,
        loadSaved,
        shareUrl,
      }}
    >
      {children}
    </PaletteContext.Provider>
  );
}
