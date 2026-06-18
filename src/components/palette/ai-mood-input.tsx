"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePalette } from "@/hooks/use-palette";
import { generatePaletteFromMood } from "@/app/actions/generate-palette";
import type { GenerateErrorCode } from "@/lib/ai-palette-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * Anti-spam cooldown applied after every submit (Layer 2 of the rate-limit
 * design, see ADR-0006). Also doubles as the rate-limit countdown display:
 * when the server returns RATE_LIMITED, cooldownSeconds is set to the
 * server-provided retryAfterSeconds and counts down live.
 */
const POST_SUBMIT_COOLDOWN_SECONDS = 3;

export function AiMoodInput() {
  const t = useTranslations("AiMoodInput");
  const [mood, setMood] = useState("");
  const [errorCode, setErrorCode] = useState<GenerateErrorCode | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { setPalette } = usePalette();

  // Single decrementer: fires once per second while cooldownSeconds > 0.
  // Drives both the anti-spam button disable and the rate-limit countdown.
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldownSeconds]);

  const handleGenerate = () => {
    if (!mood.trim() || cooldownSeconds > 0) return;

    setErrorCode(null);
    startTransition(async () => {
      const result = await generatePaletteFromMood(mood);
      if (result.success && result.palette) {
        setPalette({
          primary: result.palette.primary,
          secondary: result.palette.secondary,
          accent: result.palette.accent,
          background: result.palette.background,
          surface: result.palette.surface,
        });
      } else if (result.errorCode) {
        // Server action returns codes; translation happens here, client-side.
        setErrorCode(result.errorCode);
        if (
          result.errorCode === "RATE_LIMITED" &&
          typeof result.retryAfterSeconds === "number"
        ) {
          // Server-driven cooldown overrides the anti-spam minimum.
          setCooldownSeconds(result.retryAfterSeconds);
        }
      }
      // Layer 2 anti-spam: always apply the short post-submit cooldown. Won't
      // override a longer rate-limit cooldown set above (max wins).
      setCooldownSeconds((prev) => Math.max(prev, POST_SUBMIT_COOLDOWN_SECONDS));
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  const isRateLimited = errorCode === "RATE_LIMITED";
  const showRateLimitCountdown = isRateLimited && cooldownSeconds > 0;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        {t("heading")}
      </h3>
      <div className="flex gap-2">
        <Input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          disabled={isPending}
          className="text-sm"
        />
        <Button
          onClick={handleGenerate}
          disabled={isPending || !mood.trim() || cooldownSeconds > 0}
          size="default"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showRateLimitCountdown ? (
            `${cooldownSeconds}s`
          ) : (
            t("generate")
          )}
        </Button>
      </div>
      {/* Non-rate-limit errors: standard translated message. */}
      {errorCode && errorCode !== "RATE_LIMITED" && (
        <p className="text-xs text-destructive">{t(`errors.${errorCode}`)}</p>
      )}
      {/* Rate-limit error: live countdown while cooldown is active. Once the
          cooldown ends the message disappears, signalling the user can retry. */}
      {showRateLimitCountdown && (
        <p className="text-xs text-destructive">
          {t("errors.RATE_LIMITED", { seconds: cooldownSeconds })}
        </p>
      )}
    </div>
  );
}
