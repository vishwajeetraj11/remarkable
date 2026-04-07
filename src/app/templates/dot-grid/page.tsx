"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDoc, MM_TO_PT, drawPageNumber } from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

export default function DotGridPage() {
  const [spacingMm, setSpacingMm] = useState(5);
  const [dotSize, setDotSize] = useState<"small" | "medium">("small");

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const margin = 28;
    const spacingPt = spacingMm * MM_TO_PT;
    const radius = dotSize === "small" ? 0.6 : 1.0;
    const [r, g, b] = COLORS.dot;
    doc.setFillColor(r, g, b);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const startX = margin + (((w - margin * 2) % spacingPt) / 2);
      const startY = margin + (((h - margin * 2) % spacingPt) / 2);
      for (let x = startX; x <= w - margin; x += spacingPt) {
        for (let y = startY; y <= h - margin; y += spacingPt) {
          doc.circle(x, y, radius, "F");
        }
      }
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`dot-grid-${spacingMm}mm-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Dot Grid"
      description="Evenly spaced dots across the page — the bullet journal staple."
      onGenerate={generate}
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Dot spacing: {spacingMm} mm</Label>
            <Slider
              min={3}
              max={8}
              step={0.5}
              value={[spacingMm]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setSpacingMm(val);
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 mm (dense)</span>
              <span>8 mm (sparse)</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dot size</Label>
            <Select
              value={dotSize}
              onValueChange={(v) => setDotSize(v as "small" | "medium")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (subtle)</SelectItem>
                <SelectItem value="medium">Medium (visible)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    >
      {(variants) => {
        const { w: pw, h: ph } = getPageDimensions(variants);
        const sp = spacingMm * MM_TO_PT;
        const m = 28;
        const dotsX = Math.floor((pw - m * 2) / sp) + 1;
        const dotsY = Math.floor((ph - m * 2) / sp) + 1;
        const previewSpacingPx = Math.max(12, spacingMm * 4.5);
        const dots: { x: number; y: number }[] = [];
        const pm = 10;
        for (let x = pm; x <= 260 - pm; x += previewSpacingPx) {
          for (let y = pm; y <= 200 - pm; y += previewSpacingPx) {
            dots.push({ x, y });
          }
        }
        const r = dotSize === "small" ? 1 : 1.8;
        return (
          <div className="flex items-center gap-5">
            <div
              className="relative border border-border/30 rounded"
              style={{ width: 260, height: 200, overflow: "hidden", flexShrink: 0 }}
            >
              <svg width={260} height={200}>
                {dots.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={r} fill="#555" />
                ))}
              </svg>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                <span className="font-medium">
                  {dotsX} x {dotsY}
                </span>{" "}
                dots per page
              </div>
              <div>{spacingMm} mm spacing</div>
              <div>{dotSize} dots</div>
            </div>
          </div>
        );
      }}
    </TemplateShell>
  );
}
