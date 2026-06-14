# ADR 0004: The Gemini system prompt stays English-only

The AI mood-generation system prompt (`SYSTEM_PROMPT` in `generate-palette.ts`) is maintained in English only, even though the app UI is bilingual (en/es).

## Context

The prompt's sole purpose is to constrain the *output format*: it demands a JSON object with exactly five keys — `primary`, `secondary`, `accent`, `background`, `surface` — which are validated by a Zod schema against those exact English identifiers. Per the i18n scope rule, those keys are code identifiers and must stay English regardless of locale. Gemini is multilingual, so a Spanish mood input (*"atardecer cálido"*) is understood correctly even when the system instructions are in English.

## Decision

Keep a single English system prompt. Do not maintain a localized `es` copy.

## Considered Options

- **One English prompt (chosen)** — locale-independent format constraints; Gemini handles multilingual input.
- **Localized en/es prompts** — rejected. It would produce a half-translated artifact (Spanish prose demanding English JSON keys), double the maintenance of a detailed prompt, and buy no perceptible quality gain since the output structure is identical.

## Consequences

- A future reader seeing a bilingual app with an English-only AI prompt may question it — the justification is that the prompt governs format, not user-facing copy, and the output keys must be English.
- Error strings from the action are returned as codes and translated client-side (a separate implementation pattern, not an architectural decision).
