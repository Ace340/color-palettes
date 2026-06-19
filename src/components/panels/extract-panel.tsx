"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePalette } from "@/hooks/use-palette";
import { smartMapToPalette } from "@/lib/color";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageIcon, Loader2 } from "lucide-react";

export function ExtractPanel() {
  const t = useTranslations("ExtractPanel");
  const { setPalette } = usePalette();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);

      try {
        const { getPalette } = await import("colorthief");

        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = dataUrl;
        });

        const colors = await getPalette(img, { colorCount: 5 });

        if (!colors) return;

        const hexColors = colors.map((c) => c.hex().toUpperCase());
        const palette = smartMapToPalette(hexColors);
        setPalette(palette);
      } catch {
        // Graceful error — just don't apply
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
      >
        <ImageIcon className="w-4 h-4 mr-1" />
        {t("trigger")}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 mr-2" />
            )}
            {loading ? t("extracting") : t("chooseImage")}
          </Button>

          {preview && (
            // Raw <img> is intentional: `preview` is a transient object/data
            // URL of a user-uploaded image. next/image would add optimization
            // overhead and require blob/data-URL remote-pattern config for no
            // benefit on a throwaway client-side preview.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={t("previewAlt")}
              className="rounded-lg border border-border max-h-48 object-contain"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
