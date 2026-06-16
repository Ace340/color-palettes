"use server";

import {
  PaletteResponseSchema,
  type GenerateErrorCode,
  type GenerateResult,
} from "@/lib/ai-palette-types";

// --- Provider configuration -------------------------------------------------
// Z.AI (Zhipu) OpenAI-compatible platform. See ADR-0005 (supersedes ADR-0001).
// Model/base URL are constants so a provider swap is a one-line change.
const ZAI_MODEL = "glm-4.7-flash";
const ZAI_CHAT_ENDPOINT =
  "https://api.z.ai/api/paas/v4/chat/completions";
const REQUEST_TEMPERATURE = 0.7;
const REQUEST_MAX_TOKENS = 256;

// NOTE (ADR-0004): the system prompt is intentionally English-only. It governs
// the output *format* (5 fixed English JSON keys validated below), and the model
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

// --- Pure helpers -----------------------------------------------------------

/** Strip ```json / ``` code fences if the model wraps its JSON output. */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * Maps an HTTP status from the provider to an error code. Quota and auth
 * failures are non-retryable; server errors are transient (caller retries).
 */
function mapHttpStatus(status: number): GenerateErrorCode {
  if (status === 429) return "QUOTA_EXCEEDED";
  if (status === 401 || status === 403) return "UNAUTHORIZED";
  return "GENERIC";
}

/** Parse + Zod-validate the model's raw text. Returns INVALID_FORMAT on failure. */
function parsePaletteResponse(text: string): GenerateResult {
  const cleaned = stripCodeFences(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, errorCode: "INVALID_FORMAT" };
  }

  const validated = PaletteResponseSchema.safeParse(parsed);
  return validated.success
    ? { success: true, palette: validated.data }
    : { success: false, errorCode: "INVALID_FORMAT" };
}

// --- Provider call ----------------------------------------------------------

/**
 * Calls the Z.AI chat-completions endpoint for a single mood. Network failures
 * and 5xx responses surface as GENERIC (retryable by the caller); quota/auth
 * failures are returned as their dedicated non-retryable codes.
 */
async function callZai(mood: string): Promise<GenerateResult> {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    return { success: false, errorCode: "NOT_CONFIGURED" };
  }

  let response: Response;
  try {
    response = await fetch(ZAI_CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: ZAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Mood: "${mood}"` },
        ],
        temperature: REQUEST_TEMPERATURE,
        max_tokens: REQUEST_MAX_TOKENS,
        // glm-4.7-flash reasons by default, emitting `reasoning_content` that
        // can consume the entire token budget and leave `content` empty (which
        // surfaces as INVALID_FORMAT). This is a trivial JSON task, so disable
        // thinking explicitly for speed and to guarantee the answer fits.
        // `response_format` is intentionally omitted: unconfirmed for this
        // model, and the prompt + Zod schema are the source of truth.
        thinking: { type: "disabled" },
      }),
    });
  } catch (err) {
    // Network-level failure (DNS, connection, timeout). Retryable.
    console.error("[generate-palette] Z.AI network error:", err);
    return { success: false, errorCode: "GENERIC" };
  }

  if (!response.ok) {
    const code = mapHttpStatus(response.status);
    if (code !== "GENERIC") {
      // Non-retryable: quota or auth. Log the status for server-side debugging.
      console.error(
        `[generate-palette] Z.AI HTTP ${response.status} → ${code}`
      );
      return { success: false, errorCode: code };
    }
    // Transient (5xx etc.) → retryable as GENERIC. Log for debugging.
    console.error(`[generate-palette] Z.AI HTTP ${response.status}`);
    return { success: false, errorCode: "GENERIC" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (err) {
    console.error("[generate-palette] Z.AI JSON body parse failed:", err);
    return { success: false, errorCode: "GENERIC" };
  }

  const text = extractContent(payload);
  if (text === null) {
    console.error(
      "[generate-palette] Z.AI response missing choices[0].message.content:",
      payload
    );
    return { success: false, errorCode: "INVALID_FORMAT" };
  }

  return parsePaletteResponse(text);
}

/** Safely reads `choices[0].message.content` from an OpenAI-shaped response. */
function extractContent(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  return typeof content === "string" ? content.trim() : null;
}

// --- Server action ----------------------------------------------------------

/** Error codes that retrying cannot fix. */
const NON_RETRYABLE: ReadonlySet<GenerateErrorCode> = new Set([
  "NOT_CONFIGURED",
  "UNAUTHORIZED",
  "QUOTA_EXCEEDED",
]);

export async function generatePaletteFromMood(
  mood: string
): Promise<GenerateResult> {
  if (!mood.trim()) {
    return { success: false, errorCode: "EMPTY_MOOD" };
  }

  try {
    // First attempt
    const result = await callZai(mood);
    if (result.success) return result;

    // Deterministic / non-transient failures: retrying can't help.
    if (result.errorCode && NON_RETRYABLE.has(result.errorCode)) {
      return result;
    }

    // Retry once on transient failures (network blip, 5xx, or a malformed
    // response that may parse cleanly on a second attempt).
    const retry = await callZai(mood);
    return retry.success
      ? retry
      : { success: false, errorCode: retry.errorCode ?? "GENERIC" };
  } catch (err) {
    // Defensive: callZai handles known errors, but a server action should
    // never throw an unstructured error to the client.
    console.error("[generate-palette] Unexpected error:", err);
    return { success: false, errorCode: "GENERIC" };
  }
}
