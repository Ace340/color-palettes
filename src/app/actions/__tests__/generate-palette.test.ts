import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// --- Module-level mock (hoisted by vitest before imports) ------------------
// Mocking the rate-limit module is far simpler than mocking three Upstash
// internals. We control what `enforceRateLimit` returns per-test, which is
// all the action needs to know. The real fail-open / sliding-window logic
// is tested separately in ratelimit.test.ts.
const { mockEnforceRateLimit } = vi.hoisted(() => ({
  mockEnforceRateLimit: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
  enforceRateLimit: mockEnforceRateLimit,
  resetRatelimit: vi.fn(),
  RATE_LIMIT_MAX_REQUESTS: 10,
  RATE_LIMIT_WINDOW_SECONDS: 60,
}));

import { generatePaletteFromMood } from "../generate-palette";

/**
 * Regression tests for the Z.AI provider call + ADR-0006 input validation.
 *
 * The core bug (2026-06-16): glm-4.7-flash reasons by default. With thinking
 * left on, reasoning consumed the entire token budget and `content` came back
 * empty → INVALID_FORMAT. The first describe block locks down that thinking is
 * disabled.
 *
 * Rate-limit integration is tested by controlling {@link mockEnforceRateLimit}:
 *   - `null`           → action proceeds (fail-open or allowed)
 *   - RATE_LIMITED obj → action short-circuits before the provider call
 */

const ORIGINAL_KEY = process.env.ZAI_API_KEY;
const ORIGINAL_FETCH = globalThis.fetch;

/** Builds an OpenAI-shaped chat-completion response with the given content. */
function chatResponse(content: string, extras: Record<string, unknown> = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: { role: "assistant", content },
        },
      ],
      ...extras,
    }),
  } as Response;
}

beforeEach(() => {
  process.env.ZAI_API_KEY = "test-key";
  // Default: rate limiter allows the request through (fail-open / under quota).
  mockEnforceRateLimit.mockResolvedValue(null);
});

afterEach(() => {
  process.env.ZAI_API_KEY = ORIGINAL_KEY;
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
  mockEnforceRateLimit.mockReset();
});

describe("generatePaletteFromMood — thinking must be disabled", () => {
  it("sends thinking.type === 'disabled' in the request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      chatResponse(
        JSON.stringify({
          primary: "#FF6B6B",
          secondary: "#FFD93D",
          accent: "#6BCB77",
          background: "#FF9F1C",
          surface: "#FFFFFF",
        })
      )
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await generatePaletteFromMood("warm sunset");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.thinking).toEqual({ type: "disabled" });
  });

  it("wraps the mood in <user_input> tags (ADR-0006 anti-injection)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      chatResponse(
        JSON.stringify({
          primary: "#FF6B6B",
          secondary: "#FFD93D",
          accent: "#6BCB77",
          background: "#FF9F1C",
          surface: "#FFFFFF",
        })
      )
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await generatePaletteFromMood("warm sunset");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    const userMessage = body.messages.find(
      (m: { role: string }) => m.role === "user"
    );
    expect(userMessage.content).toBe("<user_input>\nwarm sunset\n</user_input>");
  });
});

describe("generatePaletteFromMood — happy path", () => {
  it("returns a validated palette when the model returns fenced JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      chatResponse(
        '```json\n{\n  "primary": "#FF6B6B",\n  "secondary": "#FFD93D",\n  "accent": "#6BCB77",\n  "background": "#FF9F1C",\n  "surface": "#FFFFFF"\n}\n```'
      )
    ) as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm sunset");

    expect(result.success).toBe(true);
    expect(result.palette).toEqual({
      primary: "#FF6B6B",
      secondary: "#FFD93D",
      accent: "#6BCB77",
      background: "#FF9F1C",
      surface: "#FFFFFF",
    });
  });
});

describe("generatePaletteFromMood — failure modes", () => {
  it("returns INVALID_FORMAT when content is empty (reasoning truncated it)", async () => {
    // This is the exact bug shape: reasoning_content present, content empty.
    globalThis.fetch = vi.fn().mockResolvedValue(
      chatResponse("", {
        choices: [
          {
            index: 0,
            finish_reason: "length",
            message: {
              role: "assistant",
              content: "",
              reasoning_content: "1. Analyze the request...",
            },
          },
        ],
      })
    ) as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm sunset");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_FORMAT");
  });

  it("returns NOT_CONFIGURED when ZAI_API_KEY is missing", async () => {
    delete process.env.ZAI_API_KEY;
    globalThis.fetch = vi.fn() as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm sunset");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("NOT_CONFIGURED");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("generatePaletteFromMood — input validation (ADR-0006)", () => {
  // These tests run with enforceRateLimit mocked to null (fail-open) → input
  // validation is the first check that actually fires.

  it("returns INVALID_MOOD for input containing a newline", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm\nsunset");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_MOOD");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns INVALID_MOOD for input containing a code fence", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm `sunset`");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_MOOD");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns INVALID_MOOD for a single character", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("a");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_MOOD");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns INVALID_MOOD for input over 200 characters", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("a".repeat(201));

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_MOOD");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("trims whitespace before validating (whitespace-only → INVALID_MOOD)", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("    ");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_MOOD");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts valid non-English input and proceeds to the provider", async () => {
    // Guards against the regex accidentally regressing ADR-0004's non-English
    // mood guarantee at the action level.
    globalThis.fetch = vi.fn().mockResolvedValue(
      chatResponse(
        JSON.stringify({
          primary: "#D46A6A",
          secondary: "#FAB95B",
          accent: "#7CA982",
          background: "#FFFAF0",
          surface: "#F0EAD6",
        })
      )
    ) as unknown as typeof fetch;

    const result = await generatePaletteFromMood("otoño lluvioso");

    expect(result.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("generatePaletteFromMood — rate limiting (ADR-0006)", () => {
  it("returns RATE_LIMITED with retryAfterSeconds when the limiter denies", async () => {
    mockEnforceRateLimit.mockResolvedValue({
      success: false,
      errorCode: "RATE_LIMITED",
      retryAfterSeconds: 47,
    });
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm sunset");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("RATE_LIMITED");
    expect(result.retryAfterSeconds).toBe(47);
    // The provider must never be reached on a blocked request.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rate limit check fires BEFORE input validation (RATE_LIMITED wins over INVALID_MOOD)", async () => {
    // Both conditions are true here: over quota AND invalid input. The
    // rate-limit check is first, so the caller sees RATE_LIMITED — never
    // reaching the mood parse or the provider.
    mockEnforceRateLimit.mockResolvedValue({
      success: false,
      errorCode: "RATE_LIMITED",
      retryAfterSeconds: 5,
    });
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm\nsunset");

    expect(result.errorCode).toBe("RATE_LIMITED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("proceeds normally when enforceRateLimit returns null (fail-open / allowed)", async () => {
    mockEnforceRateLimit.mockResolvedValue(null);
    globalThis.fetch = vi.fn().mockResolvedValue(
      chatResponse(
        JSON.stringify({
          primary: "#FF6B6B",
          secondary: "#FFD93D",
          accent: "#6BCB77",
          background: "#FF9F1C",
          surface: "#FFFFFF",
        })
      )
    ) as unknown as typeof fetch;

    const result = await generatePaletteFromMood("warm sunset");

    expect(result.success).toBe(true);
    expect(mockEnforceRateLimit).toHaveBeenCalledTimes(1);
  });
});
