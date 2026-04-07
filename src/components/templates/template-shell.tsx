"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { VariantControls } from "./variant-controls";
import { thumbs } from "./thumbs";
import {
  type TemplateVariants,
  DEFAULT_VARIANTS,
} from "@/lib/templates/variants";

export interface TemplateShellProps {
  title: string;
  description: string;
  showWeekStart?: boolean;
  showPageCount?: boolean;
  maxPages?: number;
  defaultPageCount?: number;
  children?: (variants: TemplateVariants, pageCount: number) => ReactNode;
  extraControls?: (
    variants: TemplateVariants,
    pageCount: number
  ) => ReactNode;
  onGenerate: (variants: TemplateVariants, pageCount: number) => Promise<void>;
  downloadLabel?: (pageCount: number) => string;
}

export function TemplateShell({
  title,
  description,
  showWeekStart = false,
  showPageCount = true,
  maxPages = 20,
  defaultPageCount = 5,
  children,
  extraControls,
  onGenerate,
  downloadLabel,
}: TemplateShellProps) {
  const pathname = usePathname();
  const thumb = thumbs[pathname];
  const [variants, setVariants] = useState<TemplateVariants>(DEFAULT_VARIANTS);
  const [pageCount, setPageCount] = useState(defaultPageCount);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await onGenerate(variants, pageCount);
    } finally {
      setGenerating(false);
    }
  }

  const label = downloadLabel
    ? downloadLabel(pageCount)
    : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>

      {(thumb || children) && (
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Preview
          </h2>
          <div className="border border-border rounded-xl overflow-hidden bg-white p-5">
            {thumb && (
              <div className="flex justify-start mb-4">
                <div className="w-48 aspect-5/7 rounded-lg border border-border/60 bg-white p-3">
                  <svg viewBox="0 0 120 168" fill="none" className="w-full h-full text-foreground">
                    {thumb}
                  </svg>
                </div>
              </div>
            )}
            {children?.(variants, pageCount)}
          </div>
        </div>
      )}

      <div className="space-y-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <VariantControls
          variants={variants}
          onChange={setVariants}
          showWeekStart={showWeekStart}
        />

        {showPageCount && (
          <div className="space-y-2">
            <Label>Page count: {pageCount}</Label>
            <Slider
              min={1}
              max={maxPages}
              value={[pageCount]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setPageCount(val);
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>{maxPages}</span>
            </div>
          </div>
        )}

        {extraControls?.(variants, pageCount)}
      </div>

      <Button onClick={handleGenerate} disabled={generating} size="lg">
        {generating ? "Generating…" : label}
      </Button>
    </div>
  );
}
