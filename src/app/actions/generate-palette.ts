"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const PaletteResponseSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type PaletteResponse = z.infer<typeof PaletteResponseSchema>;

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

interface GenerateResult {
  success: boolean;
  palette?: PaletteResponse;
  error?: string;
}

async function callGemini(mood: string): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "AI generation is not configured." };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\nMood: "${mood}"` }],
      },
    ],
  });

  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  const validated = PaletteResponseSchema.safeParse(parsed);

  if (!validated.success) {
    return {
      success: false,
      error: "AI returned an invalid palette format.",
    };
  }

  return { success: true, palette: validated.data };
}

export async function generatePaletteFromMood(
  mood: string
): Promise<GenerateResult> {
  if (!mood.trim()) {
    return { success: false, error: "Please describe a mood." };
  }

  try {
    // First attempt
    const result = await callGemini(mood);
    if (result.success) return result;

    // Retry once on failure
    const retry = await callGemini(mood);
    if (retry.success) return retry;

    return { success: false, error: retry.error || "Generation failed." };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
