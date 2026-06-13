import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/Chrom.svg"
            alt="Color Palettes logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Color Palettes
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {year} Color Palettes
        </p>
      </div>
    </footer>
  );
}
