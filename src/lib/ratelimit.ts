import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { GenerateResult } from "./ai-palette-types";

/**
 * Per-IP sliding-window rate limiting for the AI mood-generation action.
 * See ADR-0006 for the full rationale (cost control primary, anti-spam
 * secondary). Lives outside the `"use server"` action file because (a) the
 * reset hook must be a synchronous export and Next.js 16 requires all
 * exports from `"use server"` files to be async, and (b) it keeps the rate
 * limit concern separable from the provider-call concern.
 */

/** Sliding-window size. Counted in user submissions, not Z.AI calls. */
export const RATE_LIMIT_MAX_REQUESTS = 10;

/** Window duration in seconds. */
export const RATE_LIMIT_WINDOW_SECONDS = 60;

/**
 * Lazily-built singleton limiter. Returns `null` when Upstash env vars are
 * missing so the action **fails open** in dev (no Redis account required for
 * `npm run dev`). Production must set `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` on Vercel.
 *
 * Cached at module scope: the underlying Redis client holds a connection and
 * should not be re-created per request.
 */
let _ratelimit: Ratelimit | null | undefined;

export function getRatelimit(): Ratelimit | null {
  if (_ratelimit !== undefined) return _ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _ratelimit = null;
    return null;
  }
  _ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_MAX_REQUESTS,
      `${RATE_LIMIT_WINDOW_SECONDS} s`
    ),
    analytics: true,
    prefix: "color-palettes:mood",
  });
  return _ratelimit;
}

/** Test-only hook: resets the cached limiter so env changes take effect. */
export function resetRatelimit(): void {
  _ratelimit = undefined;
}

/**
 * Reads the caller's IP for rate-limit keying. Vercel sets `x-forwarded-for`
 * trustworthily (it overrides any client-supplied value). Falls back to
 * `x-real-ip`, then to the literal `"unknown"` — the latter buckets
 * unidentifiable callers together, which is safer than failing open.
 */
async function getCallerIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    // Comma-separated client → proxy chain; first entry is the original client.
    return xff.split(",")[0].trim();
  }
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Enforces the per-IP sliding-window limit. Returns a failure result if the
 * caller is over quota, or `null` to proceed. Fails open (returns null) when
 * Upstash isn't configured or Redis throws — see {@link getRatelimit}.
 */
export async function enforceRateLimit(): Promise<GenerateResult | null> {
  const limiter = getRatelimit();
  if (!limiter) {
    // Dev mode or missing credentials: don't block, don't even read headers.
    console.warn(
      "[generate-palette] Upstash not configured (UPSTASH_REDIS_REST_URL / _TOKEN missing); skipping rate limit (fail-open)."
    );
    return null;
  }

  const ip = await getCallerIp();
  let result: { success: boolean; resetTime?: Date };
  try {
    result = await limiter.limit(ip);
  } catch (err) {
    // Redis outage: fail open rather than blocking every user. Log loudly so
    // it's noticed in production.
    console.error("[generate-palette] Rate-limit check threw; failing open:", err);
    return null;
  }

  if (!result.success) {
    const retryAfterSeconds = result.resetTime
      ? Math.max(1, Math.ceil((result.resetTime.getTime() - Date.now()) / 1000))
      : RATE_LIMIT_WINDOW_SECONDS;
    return { success: false, errorCode: "RATE_LIMITED", retryAfterSeconds };
  }
  return null;
}
