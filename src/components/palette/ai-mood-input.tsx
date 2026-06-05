"use client";

import { useState, useTransition } from "react";
import { usePalette } from "@/hooks/use-palette";
import { generatePaletteFromMood } from "@/app/actions/generate-palette";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

export function AiMoodInput() {
  const [mood, setMood] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setPalette } = usePalette();

  const handleGenerate = () => {
    if (!mood.trim()) return;

    setError(null);
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
      } else {
        setError(result.error || "Generation failed.");
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
        AI Mood Generator
      </h3>
      <div className="flex gap-2">
        <Input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a mood... (e.g., warm sunset, cyberpunk Tokyo)"
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
            "Generate"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
