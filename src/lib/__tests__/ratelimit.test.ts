import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getRatelimit,
  resetRatelimit,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS,
} from "../ratelimit";

/**
 * Tests for the rate-limit module's fail-open behavior and configuration
 * constants. The sliding-window math itself is the Upstash library's
 * responsibility — tested in production, not here.
 *
 * Per ADR-0006: when Upstash env vars are missing, `getRatelimit` returns
 * null and the action skips rate limiting (so local dev works without Redis).
 */

const ORIGINAL_URL = process.env.UPSTASH_REDIS_REST_URL;
const ORIGINAL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  resetRatelimit();
});

afterEach(() => {
  if (ORIGINAL_URL !== undefined) process.env.UPSTASH_REDIS_REST_URL = ORIGINAL_URL;
  if (ORIGINAL_TOKEN !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = ORIGINAL_TOKEN;
  resetRatelimit();
});

describe("getRatelimit — fail-open when Upstash not configured", () => {
  it("returns null when both env vars are missing", () => {
    expect(getRatelimit()).toBeNull();
  });

  it("returns null when only URL is set (token missing)", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    resetRatelimit();
    expect(getRatelimit()).toBeNull();
  });

  it("returns null when only token is set (URL missing)", () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    resetRatelimit();
    expect(getRatelimit()).toBeNull();
  });

  it("caches the null result (idempotent across calls without re-checking env)", () => {
    expect(getRatelimit()).toBeNull();
    // Even if env vars appear later, the cached null is returned until reset.
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    expect(getRatelimit()).toBeNull();
  });
});

describe("resetRatelimit", () => {
  it("clears the cache so the next getRatelimit re-reads env vars", () => {
    expect(getRatelimit()).toBeNull();
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    resetRatelimit();
    // Now with env vars set, getRatelimit will try to build a real limiter.
    // We can't fully test it without a real Redis connection, but we can
    // confirm it no longer returns null (it either returns a Ratelimit or
    // throws on connection — either way, the cache was cleared).
    const result = getRatelimit();
    expect(result).not.toBeNull();
  });
});

describe("rate-limit constants", () => {
  it("exposes the configured limits per ADR-0006", () => {
    expect(RATE_LIMIT_MAX_REQUESTS).toBe(10);
    expect(RATE_LIMIT_WINDOW_SECONDS).toBe(60);
  });
});
