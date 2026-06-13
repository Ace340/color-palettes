import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="page-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/Chrom-letters.png"
            alt="Color Palettes logo"
            width={160}
            height={39}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {year} Color Palettes
        </p>
      </div>
    </footer>
  );
}
