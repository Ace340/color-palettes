import { describe, expect, it } from "vitest";
import {
  encodeHexColors,
  isSocialBot,
  parseHexColors,
} from "@/lib/share-og";

describe("parseHexColors", () => {
  it("parses a valid share parameter into #HEX values", () => {
    expect(parseHexColors("6366F1-8B5CF6-F59E0B-F8FAFC-F1F5F9")).toEqual([
      "#6366F1",
      "#8B5CF6",
      "#F59E0B",
      "#F8FAFC",
      "#F1F5F9",
    ]);
  });

  it("uppercases lowercase hex input", () => {
    expect(parseHexColors("abcdef-123456-000000-ffffff-0a0a0a")).toEqual([
      "#ABCDEF",
      "#123456",
      "#000000",
      "#FFFFFF",
      "#0A0A0A",
    ]);
  });

  it("rejects wrong color counts", () => {
    expect(parseHexColors("6366F1-8B5CF6-F59E0B")).toBeNull();
    expect(
      parseHexColors("6366F1-8B5CF6-F59E0B-F8FAFC-F1F5F9-111111")
    ).toBeNull();
  });

  it("rejects invalid hex values", () => {
    expect(parseHexColors("GGGGGG-8B5CF6-F59E0B-F8FAFC-F1F5F9")).toBeNull();
    expect(parseHexColors("6366F-8B5CF6-F59E0B-F8FAFC-F1F5F9")).toBeNull();
    expect(parseHexColors("#6366F1-8B5CF6-F59E0B-F8FAFC-F1F5F9")).toBeNull();
  });

  it("returns null for missing or empty input", () => {
    expect(parseHexColors(null)).toBeNull();
    expect(parseHexColors(undefined)).toBeNull();
    expect(parseHexColors("")).toBeNull();
  });
});

describe("encodeHexColors", () => {
  it("round-trips through parseHexColors", () => {
    const raw = "6366F1-8B5CF6-F59E0B-F8FAFC-F1F5F9";
    const parsed = parseHexColors(raw);
    expect(parsed && encodeHexColors(parsed)).toBe(raw);
  });
});

describe("isSocialBot", () => {
  it("matches known social crawler user agents", () => {
    expect(isSocialBot("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")).toBe(true);
    expect(isSocialBot("Twitterbot/1.0")).toBe(true);
    expect(isSocialBot("WhatsApp/2.19.81 A")).toBe(true);
    expect(isSocialBot("Discordbot/2.0")).toBe(true);
    expect(isSocialBot("LinkedInBot/1.0 (compatible; Mozilla/5.0)")).toBe(true);
    expect(isSocialBot("TelegramBot (like TwitterBot)")).toBe(true);
    expect(isSocialBot("Slackbot-LinkExpanding 1.0")).toBe(true);
  });

  it("does not match regular browsers or SEO crawlers", () => {
    expect(
      isSocialBot(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"
      )
    ).toBe(false);
    expect(isSocialBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(false);
    expect(isSocialBot("curl/8.0")).toBe(false);
    expect(isSocialBot(null)).toBe(false);
  });
});
