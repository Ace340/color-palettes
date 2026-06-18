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

/**
 * Input validation for the mood string. See ADR-0006 for the threat model:
 * this is defense-in-depth, not the load-bearing wall (the output
 * {@link PaletteResponseSchema} is). Goals:
 *   - Reject prompt-injection vectors (newlines for role markers, code fences,
 *     JSON/HTML syntax that could carry `<|im_start|>`-style tokens).
 *   - Allow legitimate mood descriptions in any language (Unicode letters and
 *     numbers via `\p{L}` / `\p{N}` with the `u` flag), preserving the
 *     non-English input behavior recorded in ADR-0004.
 *
 * Uses a literal space (not `\s`) so `\n`, `\r`, `\t`, and `\u00a0` are all
 * rejected — "no newlines" is enforced for real.
 *
 * Allowed punctuation: `&()/—¿¡,.'-?!`. Blocked on purpose: backticks (code
 * fences), `{}[]<>` (JSON / markup role markers), `:;` (role markers like
 * `system:`), and all quote characters (prompt-escape vectors).
 */
export const MOOD_SCHEMA = z
  .string()
  .min(2, "Mood must be at least 2 characters")
  .max(200, "Mood must be less than 200 characters")
  .refine(
    (s) => s.trim().length >= 2,
    "Mood must contain at least 2 non-space characters"
  )
  .regex(
    /^[\p{L}\p{N} &()/—¿¡,.'\-?!]+$/u,
    "Only letters, numbers, spaces, and basic punctuation allowed"
  );

export type Mood = z.infer<typeof MOOD_SCHEMA>;

export type GenerateErrorCode =
  | "NOT_CONFIGURED"
  | "UNAUTHORIZED"
  | "QUOTA_EXCEEDED"
  | "INVALID_FORMAT"
  | "EMPTY_MOOD"
  | "INVALID_MOOD"
  | "RATE_LIMITED"
  | "GENERIC";

export interface GenerateResult {
  success: boolean;
  palette?: PaletteResponse;
  /** Error codes are translated client-side (AiMoodInput.errors.*). */
  errorCode?: GenerateErrorCode;
  /**
   * Seconds until the caller may retry. Only set when
   * `errorCode === "RATE_LIMITED"`. Derived from Upstash's `resetTime`.
   */
  retryAfterSeconds?: number;
}
