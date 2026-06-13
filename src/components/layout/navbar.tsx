"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { HistoryPanel } from "@/components/panels/history-panel";
import { ExtractPanel } from "@/components/panels/extract-panel";
import { ExportPanel } from "@/components/panels/export-panel";
import { Sun, Moon, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Generator", href: "#generator" },
  { label: "Harmony", href: "#harmony" },
  { label: "AI", href: "#ai" },
  { label: "Preview", href: "#preview" },
] as const;

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto w-full px-4 h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/Chrom.svg"
            alt="Color Palettes logo"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Color Palettes
          </span>
        </div>

        {/* Center Nav Links — desktop only */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Actions — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
          <HistoryPanel />
          <ExtractPanel />
          <ExportPanel />
        </div>

        {/* Mobile: hamburger + theme toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <HistoryPanel />
              <ExtractPanel />
              <ExportPanel />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
