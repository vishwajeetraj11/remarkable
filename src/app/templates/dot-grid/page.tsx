"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZES = {
  remarkable: { w: 495.72, h: 661.68, label: "reMarkable (1404×1872)" },
  a4: { w: 595.28, h: 841.89, label: "A4" },
  letter: { w: 612, h: 792, label: "US Letter" },
};

type PageSizeKey = keyof typeof PAGE_SIZES;

// mm to points
const MM_TO_PT = 72 / 25.4;

export default function DotGridPage() {
  const [spacingMm, setSpacingMm] = useState(5);
  const [dotSize, setDotSize] = useState<"small" | "medium">("small");
  const [pageCount, setPageCount] = useState(5);
  const [pageSize, setPageSize] = useState<PageSizeKey>("remarkable");
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 28;
    const spacingPt = spacingMm * MM_TO_PT;
    const radius = dotSize === "small" ? 0.6 : 1.0;

    doc.setFillColor(80, 80, 80);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      const startX = margin + ((w - margin * 2) % spacingPt) / 2;
      const startY = margin + ((h - margin * 2) % spacingPt) / 2;

      for (let x = startX; x <= w - margin; x += spacingPt) {
        for (let y = startY; y <= h - margin; y += spacingPt) {
          doc.circle(x, y, radius, "F");
        }
      }
    }

    doc.save(`dot-grid-${spacingMm}mm-${pageCount}p.pdf`);
    setGenerating(false);
  }

  // Preview dot count estimate
  const { w: pw, h: ph } = PAGE_SIZES[pageSize];
  const spacingPt = spacingMm * MM_TO_PT;
  const margin = 28;
  const dotsX = Math.floor((pw - margin * 2) / spacingPt) + 1;
  const dotsY = Math.floor((ph - margin * 2) / spacingPt) + 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dot Grid</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evenly spaced dots across the page — the bullet journal staple.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-2">
          <Label>Dot spacing: {spacingMm} mm</Label>
          <Slider
            min={3}
            max={8}
            step={0.5}
            value={[spacingMm]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setSpacingMm(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 mm (dense)</span><span>8 mm (sparse)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Dot size</Label>
          <Select value={dotSize} onValueChange={(v) => setDotSize(v as "small" | "medium")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (subtle)</SelectItem>
              <SelectItem value="medium">Medium (visible)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Page count: {pageCount}</Label>
          <Slider
            min={1}
            max={20}
            value={[pageCount]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setPageCount(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>20</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAGE_SIZES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-white p-4 flex items-center justify-center" style={{ minHeight: 200 }}>
          <div
            className="relative border border-border/30 rounded"
            style={{
              width: 260,
              height: 200,
              overflow: "hidden",
            }}
          >
            {/* Simulated dots */}
            {(() => {
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
                <svg width={260} height={200}>
                  {dots.map((d, i) => (
                    <circle key={i} cx={d.x} cy={d.y} r={r} fill="#555" />
                  ))}
                </svg>
              );
            })()}
          </div>
          <div className="ml-5 text-xs text-muted-foreground space-y-1">
            <div><span className="font-medium">{dotsX} × {dotsY}</span> dots per page</div>
            <div>{pageCount} page{pageCount > 1 ? "s" : ""}</div>
            <div>{spacingMm} mm spacing</div>
            <div>{dotSize} dots</div>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
