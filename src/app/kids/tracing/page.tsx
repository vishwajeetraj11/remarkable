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
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

type ContentType = "uppercase" | "lowercase" | "numbers" | "words";

const CONTENT_SETS: Record<ContentType, string[]> = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  lowercase: "abcdefghijklmnopqrstuvwxyz".split(""),
  numbers: "0123456789".split(""),
  words: ["CAT", "DOG", "SUN", "RUN", "HAT", "BIG", "RED", "FUN", "CUP", "BUS", "PIG", "HEN", "FOX", "JAR", "MIX"],
};

// Simple stroke-based letter drawing with dashed lines
// Returns an array of line segments [{x1,y1,x2,y2}] for a character at (cx, cy) with given size
type Seg = { x1: number; y1: number; x2: number; y2: number };

function getLetterStrokes(ch: string, cx: number, cy: number, size: number): Seg[] {
  const s = size;
  const segs: Seg[] = [];

  // We define strokes as fractions of `s` (the cap height).
  // cx = left edge, cy = top of letter
  const x = cx;
  const y = cy;
  const r = x + s * 0.6; // right edge
  const b = y + s;       // bottom
  const m = y + s / 2;   // mid
  const mc = x + s * 0.3; // mid-center x

  function seg(x1: number, y1: number, x2: number, y2: number) {
    segs.push({ x1, y1, x2, y2 });
  }

  const c = ch.toUpperCase();

  switch (c) {
    case "A": seg(x, b, mc, y); seg(mc, y, r, b); seg(x + s*0.1, m+s*0.1, r-s*0.05, m+s*0.1); break;
    case "B": seg(x, y, x, b); seg(x, y, mc+s*0.1, y); seg(mc+s*0.1, y, r, y+s*0.15); seg(r, y+s*0.15, mc+s*0.1, m); seg(mc+s*0.1, m, x, m); seg(x, m, x, b); seg(x, b, mc+s*0.15, b); seg(mc+s*0.15, b, r, b-s*0.15); seg(r, b-s*0.15, mc+s*0.15, m); break;
    case "C": seg(r, y+s*0.1, mc, y); seg(mc, y, x, m); seg(x, m, mc, b); seg(mc, b, r, b-s*0.1); break;
    case "D": seg(x, y, x, b); seg(x, y, mc, y); seg(mc, y, r, m); seg(r, m, mc, b); seg(mc, b, x, b); break;
    case "E": seg(x, y, x, b); seg(x, y, r, y); seg(x, m, mc+s*0.1, m); seg(x, b, r, b); break;
    case "F": seg(x, y, x, b); seg(x, y, r, y); seg(x, m, mc+s*0.1, m); break;
    case "G": seg(r, y+s*0.1, mc, y); seg(mc, y, x, m); seg(x, m, mc, b); seg(mc, b, r, b); seg(r, b, r, m); seg(r, m, mc+s*0.1, m); break;
    case "H": seg(x, y, x, b); seg(r, y, r, b); seg(x, m, r, m); break;
    case "I": seg(x, y, r, y); seg(mc, y, mc, b); seg(x, b, r, b); break;
    case "J": seg(r, y, r, b-s*0.15); seg(r, b-s*0.15, mc, b); seg(mc, b, x, b-s*0.15); break;
    case "K": seg(x, y, x, b); seg(r, y, x, m); seg(x, m, r, b); break;
    case "L": seg(x, y, x, b); seg(x, b, r, b); break;
    case "M": seg(x, b, x, y); seg(x, y, mc, m); seg(mc, m, r, y); seg(r, y, r, b); break;
    case "N": seg(x, b, x, y); seg(x, y, r, b); seg(r, b, r, y); break;
    case "O": seg(x, m, mc, y); seg(mc, y, r, m); seg(r, m, mc, b); seg(mc, b, x, m); break;
    case "P": seg(x, y, x, b); seg(x, y, mc+s*0.1, y); seg(mc+s*0.1, y, r, y+s*0.12); seg(r, y+s*0.12, mc+s*0.1, m); seg(mc+s*0.1, m, x, m); break;
    case "Q": seg(x, m, mc, y); seg(mc, y, r, m); seg(r, m, mc, b); seg(mc, b, x, m); seg(mc, b-s*0.15, r, b); break;
    case "R": seg(x, y, x, b); seg(x, y, mc+s*0.1, y); seg(mc+s*0.1, y, r, y+s*0.12); seg(r, y+s*0.12, mc+s*0.1, m); seg(mc+s*0.1, m, x, m); seg(mc+s*0.05, m, r, b); break;
    case "S": seg(r, y+s*0.1, mc, y); seg(mc, y, x, y+s*0.2); seg(x, y+s*0.2, mc, m); seg(mc, m, r, m+s*0.2); seg(r, m+s*0.2, mc, b); seg(mc, b, x, b-s*0.1); break;
    case "T": seg(x, y, r, y); seg(mc, y, mc, b); break;
    case "U": seg(x, y, x, b-s*0.15); seg(x, b-s*0.15, mc, b); seg(mc, b, r, b-s*0.15); seg(r, b-s*0.15, r, y); break;
    case "V": seg(x, y, mc, b); seg(mc, b, r, y); break;
    case "W": seg(x, y, x+s*0.15, b); seg(x+s*0.15, b, mc, m+s*0.1); seg(mc, m+s*0.1, r-s*0.15, b); seg(r-s*0.15, b, r, y); break;
    case "X": seg(x, y, r, b); seg(r, y, x, b); break;
    case "Y": seg(x, y, mc, m); seg(r, y, mc, m); seg(mc, m, mc, b); break;
    case "Z": seg(x, y, r, y); seg(r, y, x, b); seg(x, b, r, b); break;
    case "0": seg(x, m, mc, y); seg(mc, y, r, m); seg(r, m, mc, b); seg(mc, b, x, m); seg(x+s*0.15, y+s*0.3, r-s*0.15, b-s*0.3); break;
    case "1": seg(mc-s*0.05, y, mc, y); seg(mc, y, mc, b); seg(mc-s*0.15, b, mc+s*0.15, b); break;
    case "2": seg(x+s*0.05, y+s*0.1, mc, y); seg(mc, y, r, y+s*0.2); seg(r, y+s*0.2, x, b); seg(x, b, r, b); break;
    case "3": seg(x, y+s*0.1, mc, y); seg(mc, y, r, y+s*0.2); seg(r, y+s*0.2, mc, m); seg(mc, m, r, m+s*0.2); seg(r, m+s*0.2, mc, b); seg(mc, b, x, b-s*0.1); break;
    case "4": seg(x, y, x, m); seg(x, m, r, m); seg(r, y, r, b); break;
    case "5": seg(r, y, x, y); seg(x, y, x, m); seg(x, m, mc+s*0.1, m); seg(mc+s*0.1, m, r, m+s*0.2); seg(r, m+s*0.2, mc, b); seg(mc, b, x, b-s*0.1); break;
    case "6": seg(r, y+s*0.1, mc, y); seg(mc, y, x, m); seg(x, m, x, b-s*0.1); seg(x, b-s*0.1, mc, b); seg(mc, b, r, b-s*0.2); seg(r, b-s*0.2, mc+s*0.1, m); seg(mc+s*0.1, m, x, m); break;
    case "7": seg(x, y, r, y); seg(r, y, mc-s*0.05, b); break;
    case "8": seg(mc, m, x, y+s*0.2); seg(x, y+s*0.2, mc, y); seg(mc, y, r, y+s*0.2); seg(r, y+s*0.2, mc, m); seg(mc, m, x, m+s*0.2); seg(x, m+s*0.2, mc, b); seg(mc, b, r, m+s*0.2); seg(r, m+s*0.2, mc, m); break;
    case "9": seg(x, m-s*0.1, mc, m); seg(mc, m, r, m-s*0.2); seg(r, m-s*0.2, mc, y); seg(mc, y, x, y+s*0.2); seg(x, y+s*0.2, mc, m); seg(r, m, r, b); break;
    default: seg(x, y, r, b); seg(r, y, x, b); // X for unknown
  }
  return segs;
}

export default function TracingPage() {
  const [contentType, setContentType] = useState<ContentType>("uppercase");
  const [pageCount, setPageCount] = useState(3);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const items = CONTENT_SETS[contentType];
    const margin = 32;
    const letterSize = 72; // pt, cap height
    const rowH = letterSize + 40;
    const copiesPerItem = 3; // model + 2 ghost copies
    const letterAdvance = letterSize * 0.8;
    const colW = copiesPerItem * letterAdvance + 16;
    const cols = Math.max(1, Math.floor((w - margin * 2) / colW));
    const rows = Math.floor((h - margin * 2) / rowH);
    const perPage = cols * rows;

    let idx = 0;
    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const pageItems: string[] = [];
      for (let i = 0; i < perPage; i++) {
        pageItems.push(items[idx % items.length]);
        idx++;
      }

      pageItems.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = margin + col * colW;
        const cy = margin + row * rowH + 8;

        const strokes = getLetterStrokes(item[0], cx, cy, letterSize);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(2.5);

        strokes.forEach(({ x1, y1, x2, y2 }) => {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len === 0) return;
          const dashLen = 5;
          const gapLen = 4;
          let travelled = 0;
          let drawing = true;
          const ux = dx / len;
          const uy = dy / len;
          while (travelled < len) {
            const segLen = Math.min(drawing ? dashLen : gapLen, len - travelled);
            if (drawing) {
              doc.line(
                x1 + ux * travelled,
                y1 + uy * travelled,
                x1 + ux * (travelled + segLen),
                y1 + uy * (travelled + segLen)
              );
            }
            travelled += segLen;
            drawing = !drawing;
          }
        });

        // Baseline for tracing
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.4);
        doc.line(cx, cy + letterSize + 4, cx + letterSize * 0.7, cy + letterSize + 4);

        // Repeat faint copies for tracing practice
        for (let rep = 1; rep < copiesPerItem; rep++) {
          const rx = cx + rep * letterAdvance;
          if (rx + letterSize * 0.7 > w - margin) break;
          doc.setDrawColor(235, 235, 235);
          doc.setLineWidth(1.5);
          getLetterStrokes(item[0], rx, cy, letterSize).forEach(({ x1, y1, x2, y2 }) => {
            doc.line(x1, y1, x2, y2);
          });
          doc.setDrawColor(235, 235, 235);
          doc.setLineWidth(0.3);
          doc.line(rx, cy + letterSize + 4, rx + letterSize * 0.7, cy + letterSize + 4);
        }
      });
    }

    doc.save(`tracing-${contentType}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  const previewItems = CONTENT_SETS[contentType].slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Letter Tracing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Large dashed letter outlines for handwriting practice, with faint ghost copies to trace over.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Content type</Label>
          <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uppercase">Uppercase (A–Z)</SelectItem>
              <SelectItem value="lowercase">Lowercase (a–z)</SelectItem>
              <SelectItem value="numbers">Numbers (0–9)</SelectItem>
              <SelectItem value="words">Simple words</SelectItem>
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
            max={10}
            value={[pageCount]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setPageCount(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>10</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview</h2>
        <div className="border border-border rounded-xl bg-white p-6 overflow-hidden">
          <svg width="100%" viewBox="0 0 480 120" className="max-w-full">
            {previewItems.map((item, i) => {
              const x = 12 + i * 78;
              const y = 10;
              const size = 60;
              const strokes = getLetterStrokes(item[0], x, y, size);
              return (
                <g key={i}>
                  {strokes.map((seg, j) => (
                    <line
                      key={j}
                      x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                      stroke="#aaa"
                      strokeWidth={2.5}
                      strokeDasharray="5,4"
                      strokeLinecap="round"
                    />
                  ))}
                  <line x1={x} y1={y + size + 4} x2={x + size * 0.65} y2={y + size + 4} stroke="#ddd" strokeWidth={0.5} />
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Each letter shown as dashed outline with ghost copies for tracing practice.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
