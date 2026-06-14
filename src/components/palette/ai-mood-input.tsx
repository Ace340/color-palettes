"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePalette } from "@/hooks/use-palette";
import { generatePaletteFromMood } from "@/app/actions/generate-palette";
import type { GenerateErrorCode } from "@/lib/ai-palette-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

export function AiMoodInput() {
  const t = useTranslations("AiMoodInput");
  const [mood, setMood] = useState("");
  const [errorCode, setErrorCode] = useState<GenerateErrorCode | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setPalette } = usePalette();

  const handleGenerate = () => {
    if (!mood.trim()) return;

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
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

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
          disabled={isPending || !mood.trim()}
          size="default"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("generate")
          )}
        </Button>
      </div>
      {errorCode && (
        <p className="text-xs text-destructive">{t(`errors.${errorCode}`)}</p>
      )}
    </div>
  );
}
