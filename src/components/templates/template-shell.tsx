"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VariantControls } from "./variant-controls";
import { thumbs } from "./thumbs";
import {
  type TemplateVariants,
  type LineSpacing,
  DEFAULT_VARIANTS,
} from "@/lib/templates/variants";
import { TEMPLATES_WITH_HEADER } from "@/lib/templates/custom-title";
import {
  TEMPLATES_WITH_LINE_SPACING,
  TEMPLATES_WITH_PAGE_NAV,
} from "@/lib/templates/template-options";

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
  // Only templates whose PDF header routes through drawHeader can honor a
  // custom title or print a dated header, so both header-only controls gate on
  // the same shared registry.
  const hasHeader = TEMPLATES_WITH_HEADER.has(pathname);
  const supportsCustomTitle = hasHeader;
  const supportsStartDate = hasHeader;
  // Only templates that draw ruled lines via drawHorizontalLines expose the
  // line-spacing control (see template-options.ts).
  const supportsLineSpacing = TEMPLATES_WITH_LINE_SPACING.has(pathname);
  // Only multi-page templates that draw the shared footer via drawPageNumber
  // expose the tappable-navigation control (see template-options.ts). Also
  // require the page-count slider to be active so the links span >1 page.
  const supportsPageNav =
    showPageCount && TEMPLATES_WITH_PAGE_NAV.has(pathname);
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
          <div className="paper-preview border border-border rounded-xl overflow-hidden p-5">
            {thumb && (
              <div className="flex justify-start mb-4">
                <div className="w-48 aspect-5/7 rounded-lg border border-border bg-white p-3">
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

        {supportsCustomTitle && (
          <div className="space-y-1.5">
            <Label htmlFor="custom-title">Custom title (optional)</Label>
            <Input
              id="custom-title"
              value={variants.customTitle ?? ""}
              placeholder={title}
              maxLength={60}
              onChange={(e) =>
                setVariants({ ...variants, customTitle: e.target.value })
              }
            />
          </div>
        )}

        {supportsStartDate && (
          <div className="space-y-1.5">
            <Label htmlFor="start-date">Start date (optional)</Label>
            <Input
              id="start-date"
              type="date"
              value={variants.startDate ?? ""}
              onChange={(e) =>
                setVariants({ ...variants, startDate: e.target.value })
              }
            />
          </div>
        )}

        {supportsLineSpacing && (
          <div className="space-y-1.5">
            <Label>Line spacing</Label>
            <Select
              value={variants.lineSpacing}
              onValueChange={(v) =>
                setVariants({ ...variants, lineSpacing: v as LineSpacing })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {supportsPageNav && (
          <div className="space-y-1.5">
            <Label>Tappable navigation</Label>
            <Select
              value={variants.tappableNav ? "on" : "off"}
              onValueChange={(v) =>
                setVariants({ ...variants, tappableNav: v === "on" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="on">On</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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
