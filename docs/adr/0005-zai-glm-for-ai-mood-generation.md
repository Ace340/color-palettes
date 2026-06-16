# ADR 0005: Z.AI GLM for AI Mood Generation

## Status

Accepted

## Context

ADR-0001 chose Google Gemini for the AI mood-generation feature. We are replacing it with Z.AI (Zhipu). The feature's contract is unchanged: a natural-language mood in, a validated 5-role hex palette out. Only the provider and transport change.

## Decision

Use the Z.AI OpenAI-compatible chat-completions endpoint via plain `fetch` (no SDK):

- **Model:** `glm-4.7-flash` — cheap and fast for a trivial "mood → 5 hex codes as JSON" task. The coding-plan model `glm-5.1` (a 744B reasoning model) is capable but overkill: slower and costlier than this job requires.
- **Endpoint:** `https://api.z.ai/api/paas/v4/chat/completions`, authenticated with the raw API key as a `Bearer` token (the new `api.z.ai` platform accepts the key directly, unlike the legacy `bigmodel.cn` API which required JWT signing).
- **Transport:** plain `fetch`, no `openai` SDK. The existing flow is already a thin "send prompt → read text → strip fences → Zod-validate" wrapper; a SDK would add a dependency for unused surface. The 5-key JSON contract is owned entirely by our Zod schema.
- **Env var:** `ZAI_API_KEY` (matches Z.AI's own SDK convention).

ADR-0004 (English-only system prompt for English JSON keys) is provider-independent and still holds; its principle carries over unchanged.

## Considered Options

- **Z.AI `glm-4.7-flash` via `fetch` (chosen)** — cheapest/fastest capable model; zero new dependencies; proven parse-and-validate pattern reused.
- **Z.AI `glm-5.1` (coding-plan model)** — rejected as overkill (deep-reasoning model for a ~80-token JSON payload).
- **`openai` npm SDK against Z.AI** — rejected. Adds a second AI dependency while we are removing one; the response contract is fully owned by Zod, so SDK typing adds no value.
- **Keep Gemini (ADR-0001)** — rejected per the product decision to move to Z.AI.

## Consequences

- Application requires a `ZAI_API_KEY` environment variable (replaces `GEMINI_API_KEY`).
- A new `UNAUTHORIZED` error code distinguishes HTTP 401/403 (bad key) from quota/generic failures — `fetch` exposes HTTP statuses that Gemini's SDK obscured.
- `response_format` (JSON mode) is intentionally not used: unconfirmed for this model, and the prompt + Zod schema are the source of truth. The defensive code-fence strip is retained as a safety net.
- `thinking` (reasoning mode) is **explicitly disabled** via `thinking: { type: "disabled" }`. Unlike `glm-4.5` (where thinking is opt-in), `glm-4.7-flash` reasons **by default**, emitting a separate `reasoning_content` field. Left on, reasoning consumed the entire token budget and left `content` empty — surfacing as `INVALID_FORMAT`. For a trivial 5-hex JSON task, reasoning is pure overhead, so it is turned off for speed, cost, and correctness.
- Supersedes ADR-0001.
