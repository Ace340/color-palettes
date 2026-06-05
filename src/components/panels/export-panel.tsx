"use client";

import { useState } from "react";
import { usePalette } from "@/hooks/use-palette";
import {
  formatExport,
  getFileName,
  downloadAsFile,
  type ExportFormat,
} from "@/lib/export-formats";
import { encodePaletteToUrl } from "@/lib/url-encoding";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, Share2 } from "lucide-react";
const FORMATS: { key: ExportFormat; label: string }[] = [
  { key: "css", label: "CSS Variables" },
  { key: "tailwind", label: "Tailwind" },
  { key: "json", label: "JSON" },
];

export function ExportPanel() {
  const { palette, shareUrl } = usePalette();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (format: ExportFormat) => {
    const content = formatExport(palette, format);
    const filename = getFileName(format);
    downloadAsFile(content, filename);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied("url");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
      >
        <Download className="w-4 h-4 mr-1" />
        Export
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Export Palette</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <Tabs defaultValue="css">
            <TabsList className="w-full">
              {FORMATS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key} className="flex-1 text-xs">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            {FORMATS.map(({ key }) => (
              <TabsContent key={key} value={key} className="mt-3">
                <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {formatExport(palette, key)}
                </pre>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(formatExport(palette, key), key)
                    }
                  >
                    {copied === key ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(key)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share URL
            </h4>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-muted rounded px-2 py-1 text-xs font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
              >
                {copied === "url" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
