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

const RULINGS = {
  narrow: { mm: 6, label: "Narrow (6 mm)" },
  college: { mm: 7, label: "College (7 mm)" },
  wide: { mm: 9, label: "Wide (9 mm)" },
};

type RulingKey = keyof typeof RULINGS;

const MM_TO_PT = 72 / 25.4;

export default function LinedPage() {
  const [ruling, setRuling] = useState<RulingKey>("college");
  const [margin, setMargin] = useState(true);
  const [header, setHeader] = useState(true);
  const [pageCount, setPageCount] = useState(5);
  const [pageSize, setPageSize] = useState<PageSizeKey>("remarkable");
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const leftMargin = margin ? 56 : 28;
    const rightMargin = w - 28;
    const topMargin = 28;
    const spacingPt = RULINGS[ruling].mm * MM_TO_PT;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      // Header space
      const headerLineY = header ? topMargin + spacingPt * 2 : topMargin;

      if (header) {
        // Title line
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.8);
        doc.line(leftMargin, headerLineY, rightMargin, headerLineY);
        // Lighter date/title area top border
        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(0.4);
        doc.line(leftMargin, topMargin + 4, rightMargin, topMargin + 4);
      }

      // Left margin line
      if (margin) {
        doc.setDrawColor(220, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, topMargin, leftMargin, h - 28);
      }

      // Horizontal lines
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.4);
      let y = headerLineY + spacingPt;
      while (y <= h - 28) {
        doc.line(leftMargin, y, rightMargin, y);
        y += spacingPt;
      }
    }

    doc.save(`lined-${ruling}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  // Preview line count
  const { h: ph } = PAGE_SIZES[pageSize];
  const spacingPt = RULINGS[ruling].mm * MM_TO_PT;
  const linesPerPage = Math.floor((ph - 56 - (header ? spacingPt * 2 : 0)) / spacingPt);
  const previewLines = 8;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Lined Paper</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Classic horizontal ruling with adjustable spacing, optional left margin, and header zone.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Line spacing (ruling)</Label>
          <Select value={ruling} onValueChange={(v) => setRuling(v as RulingKey)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RULINGS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMargin((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors focus:outline-none ${margin ? "bg-foreground border-foreground" : "bg-muted border-border"}`}
            >
              <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${margin ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <Label className="cursor-pointer" onClick={() => setMargin((v) => !v)}>Left margin line</Label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHeader((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors focus:outline-none ${header ? "bg-foreground border-foreground" : "bg-muted border-border"}`}
            >
              <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${header ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <Label className="cursor-pointer" onClick={() => setHeader((v) => !v)}>Header space</Label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-white p-6 flex gap-6">
          <div className="relative border border-border/40 rounded" style={{ width: 200, height: 240, flexShrink: 0 }}>
            {header && (
              <>
                <div className="absolute left-0 right-0 border-t border-gray-400" style={{ top: 28 }} />
                <div className="absolute left-0 right-0 border-t-2 border-gray-500" style={{ top: 52 }} />
              </>
            )}
            {margin && (
              <div className="absolute top-0 bottom-0 border-l border-red-300" style={{ left: 36 }} />
            )}
            {Array.from({ length: previewLines }, (_, i) => {
              const spacingPx = RULINGS[ruling].mm * 3.2;
              const top = (header ? 52 : 12) + (i + 1) * spacingPx;
              return (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ top }}
                />
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div><span className="font-medium">~{linesPerPage}</span> lines per page</div>
            <div>{pageCount} page{pageCount > 1 ? "s" : ""}</div>
            <div>{RULINGS[ruling].mm} mm ruling</div>
            {margin && <div>Left margin</div>}
            {header && <div>Header space</div>}
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
