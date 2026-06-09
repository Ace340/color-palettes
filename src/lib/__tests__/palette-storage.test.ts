import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loadSavedPalettes,
  savePalette,
  deletePalette,
} from "../palette-storage";
import { DEFAULT_PALETTE } from "../types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// --- loadSavedPalettes ---

describe("loadSavedPalettes", () => {
  it("returns empty array when nothing is stored", () => {
    expect(loadSavedPalettes()).toEqual([]);
  });

  it("returns parsed array from localStorage", () => {
    const stored = [
      { id: "abc-123", colors: DEFAULT_PALETTE, createdAt: 1700000000000 },
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));
    const result = loadSavedPalettes();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("abc-123");
  });

  it("returns empty array when stored data is not an array", () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ invalid: true }));
    expect(loadSavedPalettes()).toEqual([]);
  });

  it("returns empty array when stored data is malformed JSON", () => {
    localStorageMock.getItem.mockReturnValueOnce("not-json{{{");
    expect(loadSavedPalettes()).toEqual([]);
  });

  it("returns empty array when localStorage throws (SSR guard)", () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error("localStorage not available");
    });
    expect(loadSavedPalettes()).toEqual([]);
  });
});

// --- savePalette ---

describe("savePalette", () => {
  it("saves a palette and returns the updated list", () => {
    const result = savePalette(DEFAULT_PALETTE);
    expect(result).toHaveLength(1);
    expect(result[0].colors).toEqual(DEFAULT_PALETTE);
    expect(result[0].id).toBeDefined();
    expect(result[0].createdAt).toBeTypeOf("number");
  });

  it("prepends new palette to existing ones", () => {
    savePalette(DEFAULT_PALETTE);
    const second = savePalette({
      primary: "#FF0000",
      secondary: "#00FF00",
      accent: "#0000FF",
      background: "#FFFFFF",
      surface: "#EEEEEE",
    });
    expect(second).toHaveLength(2);
    // Most recent first
    expect(second[0].colors.primary).toBe("#FF0000");
  });

  it("enforces max 20 palette limit", () => {
    // Save 22 palettes
    for (let i = 0; i < 22; i++) {
      savePalette({
        ...DEFAULT_PALETTE,
        primary: `#${i.toString().padStart(6, "0")}`,
      });
    }
    const result = loadSavedPalettes();
    expect(result).toHaveLength(20);
  });

  it("persists to localStorage", () => {
    savePalette(DEFAULT_PALETTE);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const [key, value] = localStorageMock.setItem.mock.calls[0] as [
      string,
      string,
    ];
    expect(key).toBe("color-palettes-saved");
    const parsed = JSON.parse(value);
    expect(parsed).toHaveLength(1);
  });
});

// --- deletePalette ---

describe("deletePalette", () => {
  it("removes a palette by id", () => {
    const saved = savePalette(DEFAULT_PALETTE);
    const id = saved[0].id;
    const afterDelete = deletePalette(id);
    expect(afterDelete).toHaveLength(0);
  });

  it("returns unchanged list when id doesn't exist", () => {
    const saved = savePalette(DEFAULT_PALETTE);
    const afterDelete = deletePalette("nonexistent-id");
    expect(afterDelete).toHaveLength(saved.length);
  });

  it("only removes the targeted palette, not others", () => {
    savePalette(DEFAULT_PALETTE);
    const saved2 = savePalette({
      ...DEFAULT_PALETTE,
      primary: "#FF0000",
    });
    const targetId = saved2[0].id;
    const remaining = deletePalette(targetId);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].colors.primary).toBe(DEFAULT_PALETTE.primary);
  });
});
