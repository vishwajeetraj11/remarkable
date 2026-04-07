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

const CUE_WIDTHS = {
  slim: { ratio: 0.22, label: "Slim (22%)" },
  standard: { ratio: 0.30, label: "Standard (30%)" },
  wide: { ratio: 0.38, label: "Wide (38%)" },
};

type CueKey = keyof typeof CUE_WIDTHS;

export default function CornellPage() {
  const [cueWidth, setCueWidth] = useState<CueKey>("standard");
  const [summary, setSummary] = useState(true);
  const [pageCount, setPageCount] = useState(5);
  const [pageSize, setPageSize] = useState<PageSizeKey>("remarkable");
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 28;
    const lineSpacing = 18;
    const summaryH = summary ? 100 : 0;
    const headerH = 36;

    const cueRatio = CUE_WIDTHS[cueWidth].ratio;
    const bodyW = w - margin * 2;
    const cueColW = bodyW * cueRatio;
    const cueX = margin;
    const notesX = margin + cueColW;
    const contentTop = margin + headerH;
    const contentBottom = h - margin - summaryH;

    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.5);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      // Header area
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, margin, bodyW, headerH, "F");
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, margin + headerH, w - margin, margin + headerH);

      // Header labels
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text("Date:", margin + 4, margin + 12);
      doc.text("Topic:", margin + cueColW + 4, margin + 12);
      // Date line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 28, margin + 14, margin + cueColW - 8, margin + 14);
      // Topic line
      doc.line(notesX + 36, margin + 14, w - margin - 8, margin + 14);

      // Outer border
      doc.setDrawColor(140, 140, 140);
      doc.setLineWidth(0.7);
      doc.rect(margin, margin, bodyW, h - margin * 2, "S");

      // Vertical divider (cue | notes)
      doc.setLineWidth(0.7);
      doc.line(notesX, contentTop, notesX, contentBottom);

      // Horizontal lines in cue column
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      for (let y = contentTop + lineSpacing; y < contentBottom; y += lineSpacing) {
        doc.line(cueX + 4, y, cueX + cueColW - 4, y);
      }

      // Horizontal lines in notes column
      for (let y = contentTop + lineSpacing; y < contentBottom; y += lineSpacing) {
        doc.line(notesX + 4, y, w - margin - 4, y);
      }

      // Small column labels
      doc.setFontSize(6.5);
      doc.setTextColor(160, 160, 160);
      doc.text("CUE / QUESTIONS", cueX + cueColW / 2, contentTop + 10, { align: "center" });
      doc.text("NOTES", notesX + (w - margin - notesX) / 2, contentTop + 10, { align: "center" });

      // Summary section
      if (summary) {
        const sumY = contentBottom;
        doc.setDrawColor(140, 140, 140);
        doc.setLineWidth(0.7);
        doc.line(margin, sumY, w - margin, sumY);
        doc.setFontSize(6.5);
        doc.setTextColor(140, 140, 140);
        doc.text("SUMMARY", margin + 4, sumY + 10);
        // Summary lines
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        for (let y = sumY + lineSpacing * 1.5; y < h - margin - 4; y += lineSpacing) {
          doc.line(margin + 4, y, w - margin - 4, y);
        }
      }

      doc.setTextColor(0, 0, 0);
    }

    doc.save(`cornell-notes-${cueWidth}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  const cueRatio = CUE_WIDTHS[cueWidth].ratio;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Cornell Notes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Two-column study layout: cue column on the left, notes on the right, optional summary section at the bottom.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Cue column width</Label>
          <Select value={cueWidth} onValueChange={(v) => setCueWidth(v as CueKey)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CUE_WIDTHS).map(([k, v]) => (
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

        <div className="flex items-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => setSummary((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors focus:outline-none ${summary ? "bg-foreground border-foreground" : "bg-muted border-border"}`}
          >
            <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${summary ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <Label className="cursor-pointer" onClick={() => setSummary((v) => !v)}>
            Include summary section
          </Label>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-white p-5 flex gap-5">
          <div className="border border-gray-300 rounded" style={{ width: 220, height: 280, flexShrink: 0, position: "relative", overflow: "hidden" }}>
            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-300 px-2 py-1.5 flex gap-2 text-[9px] text-gray-400">
              <span>Date: ________</span>
              <span className="ml-2">Topic: ___________________</span>
            </div>
            {/* Body */}
            <div className="flex" style={{ height: summary ? "calc(100% - 56px - 28px)" : "calc(100% - 28px)" }}>
              <div
                className="border-r border-gray-300 flex-shrink-0 flex items-start justify-center pt-1 text-[7px] text-gray-400"
                style={{ width: `${cueRatio * 100}%` }}
              >
                CUE
              </div>
              <div className="flex-1 flex items-start justify-center pt-1 text-[7px] text-gray-400">
                NOTES
              </div>
            </div>
            {/* Summary */}
            {summary && (
              <div className="border-t border-gray-300 px-2 py-1 text-[7px] text-gray-400" style={{ height: 28 }}>
                SUMMARY
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div>Cue column: <span className="font-medium">{Math.round(cueRatio * 100)}%</span></div>
            <div>Notes: <span className="font-medium">{Math.round((1 - cueRatio) * 100)}%</span></div>
            <div>{pageCount} page{pageCount > 1 ? "s" : ""}</div>
            {summary && <div>Summary section</div>}
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
