import type { Palette } from "./types";
import { PALETTE_ROLES } from "./types";

export type ExportFormat = "css" | "tailwind" | "json" | "url";

export function toCssVariables(palette: Palette): string {
  const lines = PALETTE_ROLES.map(
    (role) => `  --color-${role}: ${palette[role]};`
  );
  return `:root {\n${lines.join("\n")}\n}`;
}

export function toTailwindConfig(palette: Palette): string {
  const entries = PALETTE_ROLES.map(
    (role) => `        "${role}": "${palette[role]}"`
  );
  return `// tailwind.config.ts (colors section)
module.exports = {
  theme: {
    extend: {
      colors: {
        palette: {
${entries.join(",\n")}
        }
      }
    }
  }
}`;
}

export function toJson(palette: Palette): string {
  return JSON.stringify(palette, null, 2);
}

export function formatExport(
  palette: Palette,
  format: ExportFormat
): string {
  switch (format) {
    case "css":
      return toCssVariables(palette);
    case "tailwind":
      return toTailwindConfig(palette);
    case "json":
      return toJson(palette);
    case "url":
      // URL export is handled via the URL bar, not text output
      return "";
  }
}

export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case "css":
      return "css";
    case "tailwind":
      return "js";
    case "json":
      return "json";
    case "url":
      return "txt";
  }
}

export function getFileName(format: ExportFormat): string {
  const ext = getFileExtension(format);
  return `palette.${ext}`;
}

export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
