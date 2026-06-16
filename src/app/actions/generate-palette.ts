"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PaletteResponseSchema,
  type GenerateErrorCode,
  type GenerateResult,
} from "@/lib/ai-palette-types";

// NOTE (ADR-0004): the system prompt is intentionally English-only. It governs
// the output *format* (5 fixed English JSON keys validated below), and Gemini
// understands non-English mood input regardless of the instruction language.
const SYSTEM_PROMPT = `You are a color palette generator. Given a mood description, generate exactly 5 colors for a UI design system.

Each color has a specific role with semantic meaning:
- "primary": Brand identity color, used for main UI elements and actions. Should be distinctive and recognizable.
- "secondary": Supporting color that complements primary. Used for secondary elements.
- "accent": The most vivid, attention-grabbing color. Used for highlights and call-to-action buttons. Should have high chroma/saturation.
- "background": The base canvas color. Should be low-saturation and high-lightness (light, neutral).
- "surface": Color for elevated elements like cards and panels. Slightly more saturated/lower lightness than background.

Rules:
- Return ONLY a valid JSON object with exactly these 5 keys: primary, secondary, accent, background, surface
- Each value must be a hex color string like "#FF5733" (uppercase, with # prefix)
- Background and surface must be light enough to have text on them
- Accent should be the most saturated/vivid color
- All 5 colors should feel cohesive and match the described mood

Respond with ONLY the JSON object, no markdown, no explanation.`;

/**
 * Detects Google API quota / rate-limit failures (HTTP 429). Retrying these
 * immediately makes throttling worse and Gemini asks us to back off, so the
 * caller treats them as non-retryable.
 */
function isQuotaError(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "status" in err) {
    return (err as { status: unknown }).status === 429;
  }
  if (err instanceof Error) {
    return /quota|429|rate limit/i.test(err.message);
  }
  return false;
}

async function callGemini(mood: string): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, errorCode: "NOT_CONFIGURED" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let text: string;
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nMood: "${mood}"` }],
        },
      ],
    });
    text = result.response.text().trim();
  } catch (err) {
    // Never swallow the real cause — log it server-side for debugging.
    console.error("[generate-palette] Gemini API call failed:", err);
    return isQuotaError(err)
      ? { success: false, errorCode: "QUOTA_EXCEEDED" }
      : { success: false, errorCode: "GENERIC" };
  }

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, errorCode: "INVALID_FORMAT" };
  }

  const validated = PaletteResponseSchema.safeParse(parsed);

  if (!validated.success) {
    return {
      success: false,
      errorCode: "INVALID_FORMAT",
    };
  }

  return { success: true, palette: validated.data };
}

export async function generatePaletteFromMood(
  mood: string
): Promise<GenerateResult> {
  if (!mood.trim()) {
    return { success: false, errorCode: "EMPTY_MOOD" };
  }

  try {
    // First attempt
    const result = await callGemini(mood);
    if (result.success) return result;

    // Deterministic / non-transient failures: retrying can't help.
    if (
      result.errorCode === "NOT_CONFIGURED" ||
      result.errorCode === "QUOTA_EXCEEDED"
    ) {
      return result;
    }

    // Retry once on transient failures (network blip, generic API error, or a
    // malformed response that may parse cleanly on a second attempt).
    const retry = await callGemini(mood);
    return retry.success
      ? retry
      : { success: false, errorCode: retry.errorCode ?? "GENERIC" };
  } catch (err) {
    // Defensive: callGemini handles known errors, but a server action should
    // never throw an unstructured error to the client.
    console.error("[generate-palette] Unexpected error:", err);
    return { success: false, errorCode: "GENERIC" };
  }
}
