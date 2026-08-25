"use client";

import { useId, useState, type ReactNode } from "react";
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
import { trackDownload } from "@/lib/download-tracker";
import {
  captureTemplateFunnelEvent,
  normalizeTemplateDevice,
} from "@/lib/analytics";
import { thumbs } from "./thumbs";
import { PostDownloadSuggestion } from "./post-download-suggestion";
import { TemplateGuide } from "./template-guide";
import { TEMPLATE_PAGE_GUIDES } from "@/lib/templates/page-guides";
import {
  type TemplateVariants,
  type LineSpacing,
  DEFAULT_VARIANTS,
} from "@/lib/templates/variants";
import { TEMPLATES_WITH_HEADER } from "@/lib/templates/custom-title";
import { DEVICES } from "@/lib/templates/constants";
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
  onSampleGenerate?: (variants: TemplateVariants) => Promise<void>;
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
  onSampleGenerate,
  downloadLabel,
}: TemplateShellProps) {
  const pathname = usePathname();
  const thumb = thumbs[pathname];
  const guide = TEMPLATE_PAGE_GUIDES[pathname];
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
  const [generatingSample, setGeneratingSample] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const lineSpacingId = useId();
  const tappableNavigationId = useId();
  const pageCountId = useId();

  async function handleGenerate() {
    setGenerating(true);
    const funnelProps = {
      templateSlug: pathname,
      templateName: title,
      device: variants.device,
      orientation: variants.orientation,
      pageCount,
    };
    captureTemplateFunnelEvent("template_generator_started", funnelProps);
    try {
      await onGenerate(variants, pageCount);
      captureTemplateFunnelEvent("template_generated", funnelProps);
      trackDownload({
        template: title,
        template_slug: pathname,
        content_type: "template",
        device: normalizeTemplateDevice(variants.device),
        orientation: variants.orientation,
        page_count: pageCount,
      });
      setShowSuggestion(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSampleGenerate() {
    setGeneratingSample(true);
    const funnelProps = {
      templateSlug: pathname,
      templateName: title,
      device: variants.device,
      orientation: variants.orientation,
      pageCount: 1,
    };
    captureTemplateFunnelEvent("template_generator_started", funnelProps);
    try {
      if (onSampleGenerate) {
        await onSampleGenerate(variants);
      } else {
        await onGenerate(variants, 1);
      }
      captureTemplateFunnelEvent("template_generated", funnelProps);
      trackDownload({
        template: title,
        template_slug: pathname,
        content_type: "template_sample",
        device: normalizeTemplateDevice(variants.device),
        orientation: variants.orientation,
        page_count: 1,
      });
      setShowSuggestion(true);
    } finally {
      setGeneratingSample(false);
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
                  <svg
                    viewBox="0 0 120 168"
                    fill="none"
                    className="w-full h-full text-foreground"
                    role="img"
                    aria-label={`${title} page preview`}
                  >
                    {thumb}
                  </svg>
                </div>
              </div>
            )}
            {children?.(variants, pageCount)}
            <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
              Preview settings: {DEVICES[variants.device].label} · {variants.orientation} ·{" "}
              {variants.handedness}-hand binding · {variants.inkIntensity} ink
              {showPageCount ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
            </p>
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
            <Label htmlFor={lineSpacingId}>Line spacing</Label>
            <Select
              value={variants.lineSpacing}
              onValueChange={(v) =>
                setVariants({ ...variants, lineSpacing: v as LineSpacing })
              }
            >
              <SelectTrigger id={lineSpacingId} className="w-full">
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
            <Label htmlFor={tappableNavigationId}>Tappable navigation</Label>
            <Select
              value={variants.tappableNav ? "on" : "off"}
              onValueChange={(v) =>
                setVariants({ ...variants, tappableNav: v === "on" })
              }
            >
              <SelectTrigger id={tappableNavigationId} className="w-full">
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
            <Label htmlFor={pageCountId}>Page count: {pageCount}</Label>
            <Slider
              id={pageCountId}
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

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={generating || generatingSample}
          size="lg"
        >
          {generating ? "Generating…" : label}
        </Button>
        {(showPageCount || onSampleGenerate) && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleSampleGenerate}
            disabled={generating || generatingSample}
          >
            {generatingSample ? "Preparing sample…" : "Download 1-page sample"}
          </Button>
        )}
      </div>

      {guide && <TemplateGuide guide={guide} />}

      {showSuggestion && (
        <PostDownloadSuggestion
          templateSlug={pathname}
          templateName={title}
          device={variants.device}
        />
      )}
    </div>
  );
}
