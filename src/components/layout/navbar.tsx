"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { HistoryPanel } from "@/components/panels/history-panel";
import { ExtractPanel } from "@/components/panels/extract-panel";
import { ExportPanel } from "@/components/panels/export-panel";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Sun, Moon, Menu, X } from "lucide-react";

// hrefs are in-page anchors (not locale routes); labels come from Navbar.nav.*
const NAV_LINKS = [
  { labelKey: "generator", href: "#generator" },
  { labelKey: "harmony", href: "#harmony" },
  { labelKey: "ai", href: "#ai" },
  { labelKey: "preview", href: "#preview" },
] as const;

export function Navbar() {
  const t = useTranslations("Navbar");
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="page-container h-20 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/Chrom-letters.png"
            alt="Color Palettes logo"
            width={200}
            height={49}
            priority
          />
        </div>

        {/* Center Nav Links — desktop only */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(`nav.${link.labelKey}`)}
            </a>
          ))}
        </div>

        {/* Right Actions — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <HistoryPanel />
          <ExtractPanel />
          <ExportPanel />
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("toggleTheme")}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Mobile: hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("toggleMenu")}
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
          <div className="page-container py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {t(`nav.${link.labelKey}`)}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <HistoryPanel />
              <ExtractPanel />
              <ExportPanel />
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={t("toggleTheme")}
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
