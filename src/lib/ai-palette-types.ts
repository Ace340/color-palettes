import { z } from "zod";

/**
 * Zod schema + derived types for AI-generated palettes.
 *
 * Lives outside the `"use server"` action file so that client components
 * (e.g. AiMoodInput) can import these types without forcing Turbopack to
 * parse the entire server-action module as a client graph — which breaks
 * on `z.infer<typeof …>` expressions.
 */

export const PaletteResponseSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type PaletteResponse = z.infer<typeof PaletteResponseSchema>;

export type GenerateErrorCode =
  | "NOT_CONFIGURED"
  | "QUOTA_EXCEEDED"
  | "INVALID_FORMAT"
  | "EMPTY_MOOD"
  | "GENERIC";

export interface GenerateResult {
  success: boolean;
  palette?: PaletteResponse;
  /** Error codes are translated client-side (AiMoodInput.errors.*). */
  errorCode?: GenerateErrorCode;
}
