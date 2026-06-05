"use client";

import { usePalette } from "@/hooks/use-palette";
import { getRoleOrder, ROLE_LABELS } from "@/lib/color";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { History, Trash2 } from "lucide-react";

export function HistoryPanel() {
  const { savedPalettes, save, remove, loadSaved } = usePalette();

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
      >
        <History className="w-4 h-4 mr-1" />
        Saved
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Saved Palettes</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <Button onClick={save} variant="default" size="sm">
            Save Current Palette
          </Button>

          <Separator />

          {savedPalettes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved palettes yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh]">
              {savedPalettes.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={() => loadSaved(saved.colors)}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    <div className="flex gap-0.5">
                      {getRoleOrder().map((role) => (
                        <div
                          key={role}
                          className="w-6 h-6 rounded-sm first:rounded-l-md last:rounded-r-md"
                          style={{ backgroundColor: saved.colors[role] }}
                          title={ROLE_LABELS[role]}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => remove(saved.id)}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
