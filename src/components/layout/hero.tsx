import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto w-full px-4 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Create Beautiful
            <br />
            Color Palettes
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
            Design harmonious palettes with AI, color theory, and live
            previews. Export anywhere in one click.
          </p>
          <div className="flex justify-center md:justify-start">
            <a href="#generator">
              <Button size="lg" className="gap-2 text-base">
                Get Started
                <ArrowDown className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Right: Gradient blob */}
        <div className="flex-1 w-full max-w-md md:max-w-none aspect-square md:aspect-[4/3] relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
          <div className="absolute top-[15%] left-[10%] w-[45%] h-[45%] rounded-full bg-amber-400/60 blur-2xl" />
          <div className="absolute bottom-[10%] right-[15%] w-[40%] h-[40%] rounded-full bg-teal-400/50 blur-2xl" />
          <div className="absolute top-[40%] left-[35%] w-[35%] h-[35%] rounded-full bg-rose-400/40 blur-xl" />
          <div className="absolute top-[5%] right-[10%] w-[25%] h-[25%] rounded-full bg-sky-300/50 blur-xl" />
        </div>
      </div>
    </section>
  );
}
