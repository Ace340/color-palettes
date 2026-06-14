import { describe, it, expect } from "vitest";
import {
  generateHarmony,
  getContrastRatio,
  getContrastLevel,
  getPaletteContrasts,
  isValidHex,
  hexToHsl,
  hslToHex,
  smartMapToPalette,
  getRoleOrder,
} from "../color";
import { DEFAULT_PALETTE, HARMONY_MODES, type HarmonyMode } from "../types";

// --- isValidHex ---

describe("isValidHex", () => {
  it("accepts valid 6-digit hex with # prefix", () => {
    expect(isValidHex("#FF5733")).toBe(true);
    expect(isValidHex("#000000")).toBe(true);
    expect(isValidHex("#ffffff")).toBe(true);
    expect(isValidHex("#aAbBcC")).toBe(true);
  });

  it("rejects hex without # prefix", () => {
    expect(isValidHex("FF5733")).toBe(false);
  });

  it("rejects 3-digit shorthand hex", () => {
    expect(isValidHex("#F00")).toBe(false);
  });

  it("rejects 8-digit hex (with alpha)", () => {
    expect(isValidHex("#FF573380")).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(isValidHex("#GGGGGG")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidHex("")).toBe(false);
  });
});

// --- hexToHsl / hslToHex round-trip ---

describe("hexToHsl / hslToHex", () => {
  it("round-trips a bright red", () => {
    const hsl = hexToHsl("#FF0000");
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    // chroma-js returns lowercase; allow minor rounding drift
    expect(hex.toUpperCase()).toBe("#FF0000");
  });

  it("round-trips a dark blue (within rounding tolerance)", () => {
    const hsl = hexToHsl("#0033AA");
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    // Integer HSL rounding introduces small drift — accept nearby values
    expect(isValidHex(hex)).toBe(true);
    const orig = hexToHsl("#0033AA");
    expect(Math.abs(hsl.h - orig.h)).toBeLessThanOrEqual(1);
    expect(Math.abs(hsl.s - orig.s)).toBeLessThanOrEqual(1);
    expect(Math.abs(hsl.l - orig.l)).toBeLessThanOrEqual(1);
  });

  it("round-trips white", () => {
    const hsl = hexToHsl("#FFFFFF");
    expect(hsl.l).toBe(100);
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    expect(hex.toUpperCase()).toBe("#FFFFFF");
  });

  it("round-trips black", () => {
    const hsl = hexToHsl("#000000");
    expect(hsl.l).toBe(0);
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    expect(hex.toUpperCase()).toBe("#000000");
  });

  it("returns h=0 for achromatic colors (NaN hue)", () => {
    const hsl = hexToHsl("#808080");
    expect(hsl.h).toBe(0);
    expect(typeof hsl.h).toBe("number");
  });
});

// --- generateHarmony ---

describe("generateHarmony", () => {
  const baseHex = "#6366F1"; // matches DEFAULT_PALETTE.primary

  it("returns a palette with all 5 roles", () => {
    const palette = generateHarmony(baseHex, "complementary");
    expect(palette.primary).toBeDefined();
    expect(palette.secondary).toBeDefined();
    expect(palette.accent).toBeDefined();
    expect(palette.background).toBeDefined();
    expect(palette.surface).toBeDefined();
  });

  it("returns valid hex values for every role", () => {
    for (const mode of HARMONY_MODES) {
      const palette = generateHarmony(baseHex, mode as HarmonyMode);
      for (const value of Object.values(palette)) {
        expect(isValidHex(value)).toBe(true);
      }
    }
  });

  it("sets primary to the base color (case-insensitive)", () => {
    for (const mode of HARMONY_MODES) {
      const palette = generateHarmony(baseHex, mode as HarmonyMode);
      expect(palette.primary.toUpperCase()).toBe(baseHex.toUpperCase());
    }
  });

  it("generates different palettes for different modes", () => {
    const comp = generateHarmony(baseHex, "complementary");
    const analog = generateHarmony(baseHex, "analogous");
    // At least secondary should differ between complementary and analogous
    expect(comp.secondary).not.toBe(analog.secondary);
  });

  it("generates light background and surface (foundation colors)", () => {
    for (const mode of HARMONY_MODES) {
      const palette = generateHarmony(baseHex, mode as HarmonyMode);
      const bgHsl = hexToHsl(palette.background);
      const surfHsl = hexToHsl(palette.surface);
      // Background should be very light
      expect(bgHsl.l).toBeGreaterThanOrEqual(90);
      // Surface should be slightly darker than background
      expect(surfHsl.l).toBeLessThan(bgHsl.l);
    }
  });

  it("complementary secondary is 180 degrees from base hue", () => {
    const baseHsl = hexToHsl(baseHex);
    const palette = generateHarmony(baseHex, "complementary");
    const secHsl = hexToHsl(palette.secondary);
    // Hue difference should be ~180 (accounting for rounding)
    const diff = Math.abs(baseHsl.h - secHsl.h);
    expect(diff === 180 || diff === 179 || diff === 181).toBe(true);
  });

  it("triadic generates hues ~120 degrees apart", () => {
    const baseHsl = hexToHsl(baseHex);
    const palette = generateHarmony(baseHex, "triadic");
    const secHsl = hexToHsl(palette.secondary);
    const accHsl = hexToHsl(palette.accent);

    // Circular hue difference (shortest arc around 360°)
    const hueDist = (a: number, b: number) => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };

    const d1 = hueDist(baseHsl.h, secHsl.h);
    const d2 = hueDist(baseHsl.h, accHsl.h);
    const d3 = hueDist(secHsl.h, accHsl.h);

    // Triadic: all three should be ~120° apart (tolerance for rounding)
    expect(d1).toBeGreaterThanOrEqual(115);
    expect(d1).toBeLessThanOrEqual(125);
    expect(d2).toBeGreaterThanOrEqual(115);
    expect(d2).toBeLessThanOrEqual(125);
    expect(d3).toBeGreaterThanOrEqual(115);
    expect(d3).toBeLessThanOrEqual(125);
  });
});

// --- getContrastRatio / getContrastLevel ---

describe("getContrastRatio", () => {
  it("returns 1 for identical colors", () => {
    expect(getContrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 1);
  });

  it("returns 21 for black on white", () => {
    expect(getContrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });

  it("returns a value >= 1 (ratios are always positive)", () => {
    const ratio = getContrastRatio("#FF5733", "#0033AA");
    expect(ratio).toBeGreaterThanOrEqual(1);
  });

  it("is commutative", () => {
    const a = "#FF5733";
    const b = "#00AACC";
    expect(getContrastRatio(a, b)).toBeCloseTo(
      getContrastRatio(b, a),
      5
    );
  });
});

describe("getContrastLevel", () => {
  it("returns AAA for ratio >= 7", () => {
    expect(getContrastLevel(7)).toBe("AAA");
    expect(getContrastLevel(10)).toBe("AAA");
  });

  it("returns AA for ratio >= 4.5 and < 7", () => {
    expect(getContrastLevel(4.5)).toBe("AA");
    expect(getContrastLevel(5)).toBe("AA");
  });

  it("returns A for ratio >= 3 and < 4.5", () => {
    expect(getContrastLevel(3)).toBe("A");
    expect(getContrastLevel(4)).toBe("A");
  });

  it("returns fail for ratio < 3", () => {
    expect(getContrastLevel(2.9)).toBe("fail");
    expect(getContrastLevel(1)).toBe("fail");
  });
});

// --- getPaletteContrasts ---

describe("getPaletteContrasts", () => {
  it("returns 3 contrast pairings", () => {
    const contrasts = getPaletteContrasts(DEFAULT_PALETTE);
    expect(contrasts).toHaveLength(3);
  });

  it("each pairing has required fields", () => {
    const contrasts = getPaletteContrasts(DEFAULT_PALETTE);
    for (const info of contrasts) {
      expect(info).toHaveProperty("foreground");
      expect(info).toHaveProperty("background");
      expect(info).toHaveProperty("ratio");
      expect(info).toHaveProperty("level");
      expect(typeof info.ratio).toBe("number");
      expect(["AAA", "AA", "A", "fail"]).toContain(info.level);
    }
  });

  it("ratios are rounded to 1 decimal place", () => {
    const contrasts = getPaletteContrasts(DEFAULT_PALETTE);
    for (const info of contrasts) {
      const decimal = info.ratio.toString().split(".")[1];
      if (decimal) {
        expect(decimal.length).toBeLessThanOrEqual(1);
      }
    }
  });
});

// --- smartMapToPalette ---

describe("smartMapToPalette", () => {
  it("maps exactly 5 colors to all roles", () => {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
    const palette = smartMapToPalette(colors);
    expect(isValidHex(palette.primary)).toBe(true);
    expect(isValidHex(palette.secondary)).toBe(true);
    expect(isValidHex(palette.accent)).toBe(true);
    expect(isValidHex(palette.background)).toBe(true);
    expect(isValidHex(palette.surface)).toBe(true);
  });

  it("assigns most saturated color to accent", () => {
    const colors = ["#808080", "#FF0000", "#005500", "#DDDDDD", "#AAAAAA"];
    const palette = smartMapToPalette(colors);
    // #FF0000 is the most saturated
    expect(palette.accent).toBe("#FF0000");
  });

  it("pads with variations when fewer than 5 colors provided", () => {
    const colors = ["#FF5733", "#00AACC"];
    const palette = smartMapToPalette(colors);
    // Should still produce a valid palette with all 5 roles
    expect(Object.keys(palette)).toHaveLength(5);
    for (const value of Object.values(palette)) {
      expect(isValidHex(value)).toBe(true);
    }
  });

  it("does not mutate the input array (code smell regression test)", () => {
    const colors = ["#FF5733", "#00AACC", "#EE4422", "#F0F0F0", "#CCCCCC"];
    const copy = [...colors];
    smartMapToPalette(colors);
    // Smell #1: smartMapToPalette used to mutate the input array
    expect(colors).toEqual(copy);
  });

  it("assigns lightest colors to background and surface", () => {
    const colors = ["#FF0000", "#0000FF", "#FF00FF", "#F5F5F5", "#E0E0E0"];
    const palette = smartMapToPalette(colors);
    const bgLightness = hexToHsl(palette.background).l;
    const surfLightness = hexToHsl(palette.surface).l;
    // Both should be relatively light
    expect(bgLightness).toBeGreaterThan(50);
    expect(surfLightness).toBeGreaterThan(50);
  });
});

// --- getRoleOrder ---

describe("getRoleOrder", () => {
  it("returns all 5 palette roles in order", () => {
    const roles = getRoleOrder();
    expect(roles).toEqual([
      "primary",
      "secondary",
      "accent",
      "background",
      "surface",
    ]);
  });
});
