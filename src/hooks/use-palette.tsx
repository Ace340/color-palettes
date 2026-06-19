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
import {
  loadSavedPalettes,
  savePalette,
  deletePalette,
} from "@/lib/palette-storage";
import { generateSurprise } from "@/lib/color";
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
  surpriseMe: () => void;
  undoSurprise: () => void;
  canUndo: boolean;
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
  const [previousPalette, setPreviousPalette] = useState<Palette | null>(null);

  // Initialize from URL or default on mount. A lazy useState initializer can't
  // be used: window/localStorage are unavailable during SSR and would cause
  // hydration mismatches. Effect-after-mount is the SSR-safe pattern.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const params = new URLSearchParams(window.location.search);
    const urlPalette = decodePaletteFromUrl(params);
    if (urlPalette) {
      setPaletteState(urlPalette);
    }

    setSavedPalettes(loadSavedPalettes());
    /* eslint-enable react-hooks/set-state-in-effect */
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

  const surpriseMe = useCallback(() => {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    setPreviousPalette(palette);
    setPaletteState(generateSurprise(isDark));
  }, [palette]);

  const undoSurprise = useCallback(() => {
    if (previousPalette) {
      setPaletteState(previousPalette);
      setPreviousPalette(null);
    }
  }, [previousPalette]);

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
        surpriseMe,
        undoSurprise,
        canUndo: previousPalette !== null,
      }}
    >
      {children}
    </PaletteContext.Provider>
  );
}
