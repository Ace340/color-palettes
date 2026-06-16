import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generatePaletteFromMood } from "../generate-palette";

/**
 * Regression tests for the Z.AI provider call.
 *
 * The core bug (2026-06-16): glm-4.7-flash reasons by default. With thinking
 * left on, reasoning consumed the entire token budget and `content` came back
 * empty → INVALID_FORMAT. These tests lock down that thinking is disabled.
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
});

afterEach(() => {
  process.env.ZAI_API_KEY = ORIGINAL_KEY;
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
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
