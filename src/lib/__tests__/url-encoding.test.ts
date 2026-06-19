import { describe, it, expect } from "vitest";
import {
  encodePaletteToUrl,
  decodePaletteFromUrl,
  getDefaultOrUrlPalette,
} from "../url-encoding";
import { DEFAULT_PALETTE } from "../types";

// --- encodePaletteToUrl ---

describe("encodePaletteToUrl", () => {
  it("encodes the default palette as a query string", () => {
    const result = encodePaletteToUrl(DEFAULT_PALETTE);
    expect(result).toMatch(/^\?p=/);
  });

  it("encodes hex values without # prefix, hyphen-separated", () => {
    const result = encodePaletteToUrl(DEFAULT_PALETTE);
    // Remove ?p= prefix, split by hyphen
    const parts = result.replace("?p=", "").split("-");
    expect(parts).toHaveLength(5);
    // Each part should be a 6-char hex string without #
    for (const part of parts) {
      expect(part).toHaveLength(6);
      expect(/^[0-9A-Fa-f]{6}$/.test(part)).toBe(true);
    }
  });

  it("encodes roles in canonical order", () => {
    const palette = {
      primary: "#AABBCC",
      secondary: "#DDEEFF",
      accent: "#112233",
      background: "#445566",
      surface: "#778899",
    };
    const result = encodePaletteToUrl(palette);
    expect(result).toBe(
      "?p=AABBCC-DDEEFF-112233-445566-778899"
    );
  });
});

// --- decodePaletteFromUrl ---

describe("decodePaletteFromUrl", () => {
  it("decodes a valid URL-encoded palette", () => {
    const params = new URLSearchParams("p=AABBCC-DDEEFF-112233-445566-778899");
    const palette = decodePaletteFromUrl(params);
    expect(palette).not.toBeNull();
    expect(palette!.primary).toBe("#AABBCC");
    expect(palette!.secondary).toBe("#DDEEFF");
    expect(palette!.accent).toBe("#112233");
    expect(palette!.background).toBe("#445566");
    expect(palette!.surface).toBe("#778899");
  });

  it("returns null when no p parameter exists", () => {
    const params = new URLSearchParams("");
    expect(decodePaletteFromUrl(params)).toBeNull();
  });

  it("returns null for fewer than 5 hex segments", () => {
    const params = new URLSearchParams("p=AABBCC-DDEEFF-112233");
    expect(decodePaletteFromUrl(params)).toBeNull();
  });

  it("returns null for more than 5 hex segments", () => {
    const params = new URLSearchParams(
      "p=AABBCC-DDEEFF-112233-445566-778899-FFFFFF"
    );
    expect(decodePaletteFromUrl(params)).toBeNull();
  });

  it("returns null for invalid hex values", () => {
    const params = new URLSearchParams("p=AABBCC-GGHHII-112233-445566-778899");
    expect(decodePaletteFromUrl(params)).toBeNull();
  });

  it("normalizes hex to uppercase", () => {
    const params = new URLSearchParams("p=aabbcc-ddeeff-112233-445566-778899");
    const palette = decodePaletteFromUrl(params);
    expect(palette).not.toBeNull();
    expect(palette!.primary).toBe("#AABBCC");
  });

  it("round-trips: encode then decode yields the original palette", () => {
    const encoded = encodePaletteToUrl(DEFAULT_PALETTE);
    const params = new URLSearchParams(encoded.replace("?", ""));
    const decoded = decodePaletteFromUrl(params);
    expect(decoded).not.toBeNull();
    expect(decoded).toEqual(DEFAULT_PALETTE);
  });

  it("round-trips a custom palette", () => {
    const custom = {
      primary: "#FF5733",
      secondary: "#00AACC",
      accent: "#EE4422",
      background: "#F0F0F0",
      surface: "#FFFFFF",
    };
    const encoded = encodePaletteToUrl(custom);
    const params = new URLSearchParams(encoded.replace("?", ""));
    const decoded = decodePaletteFromUrl(params);
    expect(decoded).toEqual(custom);
  });
});

// --- getDefaultOrUrlPalette ---

describe("getDefaultOrUrlPalette", () => {
  it("returns default palette when no URL param", () => {
    const params = new URLSearchParams("");
    expect(getDefaultOrUrlPalette(params)).toEqual(DEFAULT_PALETTE);
  });

  it("returns decoded palette when valid URL param exists", () => {
    const params = new URLSearchParams(
      "p=AABBCC-DDEEFF-112233-445566-778899"
    );
    const result = getDefaultOrUrlPalette(params);
    expect(result.primary).toBe("#AABBCC");
    expect(result).not.toEqual(DEFAULT_PALETTE);
  });
});
