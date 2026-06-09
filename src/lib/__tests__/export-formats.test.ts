import { describe, it, expect } from "vitest";
import {
  toCssVariables,
  toTailwindConfig,
  toJson,
  formatExport,
  getFileExtension,
  getFileName,
} from "../export-formats";
import { DEFAULT_PALETTE } from "../types";

const TEST_PALETTE = DEFAULT_PALETTE;

// --- toCssVariables ---

describe("toCssVariables", () => {
  it("produces valid CSS with all 5 custom properties", () => {
    const css = toCssVariables(TEST_PALETTE);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary:");
    expect(css).toContain("--color-secondary:");
    expect(css).toContain("--color-accent:");
    expect(css).toContain("--color-background:");
    expect(css).toContain("--color-surface:");
    expect(css).toContain("}");
  });

  it("includes the actual hex values", () => {
    const css = toCssVariables(TEST_PALETTE);
    expect(css).toContain(TEST_PALETTE.primary);
    expect(css).toContain(TEST_PALETTE.secondary);
    expect(css).toContain(TEST_PALETTE.accent);
    expect(css).toContain(TEST_PALETTE.background);
    expect(css).toContain(TEST_PALETTE.surface);
  });
});

// --- toTailwindConfig ---

describe("toTailwindConfig", () => {
  it("produces a Tailwind config with palette section", () => {
    const config = toTailwindConfig(TEST_PALETTE);
    expect(config).toContain("palette: {");
    expect(config).toContain('"primary"');
    expect(config).toContain('"secondary"');
    expect(config).toContain('"accent"');
    expect(config).toContain('"background"');
    expect(config).toContain('"surface"');
  });

  it("includes hex values in the config", () => {
    const config = toTailwindConfig(TEST_PALETTE);
    expect(config).toContain(`"primary": "${TEST_PALETTE.primary}"`);
    expect(config).toContain(`"accent": "${TEST_PALETTE.accent}"`);
  });
});

// --- toJson ---

describe("toJson", () => {
  it("produces valid JSON matching the palette shape", () => {
    const json = toJson(TEST_PALETTE);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(TEST_PALETTE);
  });

  it("is pretty-printed (2-space indent)", () => {
    const json = toJson(TEST_PALETTE);
    expect(json).toContain('  "primary"');
  });
});

// --- formatExport ---

describe("formatExport", () => {
  it("delegates to toCssVariables for 'css'", () => {
    expect(formatExport(TEST_PALETTE, "css")).toBe(
      toCssVariables(TEST_PALETTE)
    );
  });

  it("delegates to toTailwindConfig for 'tailwind'", () => {
    expect(formatExport(TEST_PALETTE, "tailwind")).toBe(
      toTailwindConfig(TEST_PALETTE)
    );
  });

  it("delegates to toJson for 'json'", () => {
    expect(formatExport(TEST_PALETTE, "json")).toBe(toJson(TEST_PALETTE));
  });

  it("returns empty string for 'url'", () => {
    expect(formatExport(TEST_PALETTE, "url")).toBe("");
  });
});

// --- getFileExtension ---

describe("getFileExtension", () => {
  it("returns 'css' for css format", () => {
    expect(getFileExtension("css")).toBe("css");
  });

  it("returns 'js' for tailwind format", () => {
    expect(getFileExtension("tailwind")).toBe("js");
  });

  it("returns 'json' for json format", () => {
    expect(getFileExtension("json")).toBe("json");
  });

  it("returns 'txt' for url format", () => {
    expect(getFileExtension("url")).toBe("txt");
  });
});

// --- getFileName ---

describe("getFileName", () => {
  it("returns 'palette.css' for css", () => {
    expect(getFileName("css")).toBe("palette.css");
  });

  it("returns 'palette.js' for tailwind", () => {
    expect(getFileName("tailwind")).toBe("palette.js");
  });

  it("returns 'palette.json' for json", () => {
    expect(getFileName("json")).toBe("palette.json");
  });

  it("returns 'palette.txt' for url", () => {
    expect(getFileName("url")).toBe("palette.txt");
  });
});
