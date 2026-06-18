# ADR 0006: Upstash Redis Ratelimit for AI Mood Cost Control

## Status

Accepted

## Context

The AI Mood Generation feature (`src/app/actions/generate-palette.ts`) calls Z.AI's paid `glm-4.7-flash` endpoint per user submission. The app is unauthenticated (CONTEXT.md: "No database", localStorage-only), so the only stable per-caller identifier available is the IP address. The action also retries once on transient failure, so a single user submission can issue up to two paid provider calls.

Without a server-side rate limit, a trivial script (`for i in $(seq 10000); do curl ...; done`) from one laptop can exhaust a monthly flash-tier quota in under a minute. This is the primary threat. Secondary concern is anti-spam (accidental double-clicks, held-Enter).

The app is deployed on Vercel serverless, which rules out an in-memory `Map`: each invocation may hit a different instance, and cold starts wipe per-process state — enforcement would be effectively random.

## Decision

Add a two-layer rate-limiting design:

**Layer 1 — Server-side wall (cost control):**

- Use `@upstash/ratelimit` with `@upstash/redis` as the backing store. Sliding-window algorithm, `Ratelimit.slidingWindow(60, "10 requests")`, keyed per-IP. The IP is read from request headers via `headers()` from `next/headers` (Vercel sets `x-forwarded-for` trustworthily).
- The check is the first thing inside `generatePaletteFromMood`, *before* input validation and *before* any Z.AI call. A blocked request must never reach the provider.
- On a hit, return `{ success: false, errorCode: "RATE_LIMITED", retryAfterSeconds }`. The `retryAfterSeconds` value comes from `result.resetTime` returned by the ratelimit library, so the UI can show an accurate countdown.
- **Fail-open in dev:** if `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` is unset, the rate-limit step is skipped and the request proceeds (with a server-side warning log). This keeps `npm run dev` working without requiring local Redis or Upstash credentials.
- Limits are named constants (`RATE_LIMIT_MAX_REQUESTS = 10`, `RATE_LIMIT_WINDOW_SECONDS = 60`) so they can be tuned as the Z.AI plan changes.

**Layer 2 — Client-side throttle (anti-spam, free):**

- In `src/components/palette/ai-mood-input.tsx`, disable the generate button for 3 seconds after each submit completes (or for the duration of the pending state, whichever is longer). This is a UX control, not a security control — its job is to absorb accidental double-submits. Layer 1 remains the load-bearing wall.

The rate limit counts **user submissions**, not Z.AI calls. Worst case is therefore 20 provider calls/min/IP (10 submissions × the retry). We size the limit against that worst case, not the optimistic 10.

New error code `RATE_LIMITED` added to `GenerateErrorCode` (alongside `INVALID_MOOD` for input-validation failures). The existing `GenerateResult` shape gains an optional `retryAfterSeconds?: number` field, surfaced only when `errorCode === "RATE_LIMITED"`.

## Considered Options

- **Upstash Redis + `@upstash/ratelimit` (chosen)** — purpose-built for serverless, canonical Vercel pairing, free tier covers ~10K commands/day, single-round-trip sliding window. Adds 2 deps + 2 env vars.
- **In-memory `Map`** — rejected. Vercel serverless runs multiple instances across regions; cold starts wipe state. Enforcement becomes effectively random.
- **Vercel KV** — rejected. Same underlying technology as Upstash (it *is* Upstash under the hood), but adds Vercel-specific vendor lock-in with no benefit over portable Upstash.
- **Rely on Z.AI's own quotas** — rejected. When Z.AI cuts the account off, *every* user gets `QUOTA_EXCEEDED`, not just the abuser. One bad actor can take the feature down for everyone.
- **Pure client-side throttle** — rejected as the *only* layer (trivially bypassed by direct curl). Kept as a complementary Layer 2 for accidental double-submit.

## Consequences

- Two new dependencies: `@upstash/ratelimit`, `@upstash/redis`.
- Two new environment variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Both must be provisioned on Vercel (and locally in `.env.local` if you want to test rate-limiting in dev).
- `GenerateErrorCode` enum gains two values: `INVALID_MOOD`, `RATE_LIMITED`. Client i18n message files must add `AiMoodInput.errors.INVALID_MOOD` and `AiMoodInput.errors.RATE_LIMITED` in every locale.
- `GenerateResult` gains optional `retryAfterSeconds?: number`. Client (`ai-mood-input.tsx`) can use this to render a countdown and disable the button for the indicated duration.
- CONTEXT.md previously claimed "No database" — technically still true (no persistent application state), but the app now depends on an external Redis for rate-limit counters. Worth noting that this is ephemeral operational state, not domain state.
- The "first line of defense" against prompt injection remains the **output Zod schema** (`PaletteResponseSchema`), not the rate limiter or system-prompt clause. The rate limiter's job is purely cost control.
