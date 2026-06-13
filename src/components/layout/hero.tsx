"use client";

import { Button } from "@/components/ui/button";
import { usePalette } from "@/hooks/use-palette";

export function Hero() {
  const { palette, surpriseMe } = usePalette();

  return (
    <section className="py-20 pb-8 md:py-24 md:pb-12">
      <div className="page-container flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Create Beautiful
            <br />
            Color Palettes
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
            Discover harmonious palettes with AI, color theory, and live
            previews. Export anywhere in one click.
          </p>
          <div className="flex justify-center md:justify-start">
            <Button
              size="lg"
              className="btn-surprise text-lg px-10 py-6 h-auto rounded-xl min-w-[220px]"
              onClick={surpriseMe}
            >
              Surprise Me
            </Button>
          </div>
        </div>

        {/* Right: Gradient blob — driven by identity colors */}
        <div className="flex-1 w-full max-w-md md:max-w-none aspect-square md:aspect-[4/3] relative rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 transition-colors duration-300 ease-out"
            style={{
              background: `linear-gradient(to bottom right, ${palette.primary}, ${palette.secondary}, ${palette.accent})`,
              opacity: 0.9,
            }}
          />
          <div
            className="absolute top-[15%] left-[10%] w-[45%] h-[45%] rounded-full blur-2xl transition-colors duration-300 ease-out"
            style={{ backgroundColor: palette.primary, opacity: 0.6 }}
          />
          <div
            className="absolute bottom-[10%] right-[15%] w-[40%] h-[40%] rounded-full blur-2xl transition-colors duration-300 ease-out"
            style={{ backgroundColor: palette.secondary, opacity: 0.5 }}
          />
          <div
            className="absolute top-[40%] left-[35%] w-[35%] h-[35%] rounded-full blur-xl transition-colors duration-300 ease-out"
            style={{ backgroundColor: palette.accent, opacity: 0.4 }}
          />
        </div>
      </div>
    </section>
  );
}
