"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { savePdf } from "@/lib/download-tracker";
import { captureEvent, normalizeTemplateDevice } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateBinairo, type BinairoPuzzle } from "@/lib/generators/binairo";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "binairo";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(
  puzzles: BinairoPuzzle[],
  pageSizeKey: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawGrid = (puzzle: BinairoPuzzle, answerKey: boolean, index: number) => {
    const size = puzzle.size;
    const top = margin + 44;
    const gridPx = Math.min(usableW - 40, ps.h - top - margin - 30);
    const cell = gridPx / size;
    const gx = margin + (usableW - gridPx) / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Binairo ${size}×${size}${puzzles.length > 1 ? ` · Puzzle ${index + 1}` : ""}${answerKey ? " — Solution" : ""}`,
      ps.w / 2,
      margin + 14,
      { align: "center" }
    );
    if (!answerKey) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Fill every empty cell with 0 or 1: equal counts per row and column, never three alike in a row, no duplicate lines.",
        ps.w / 2,
        margin + 28,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.2);
    for (let i = 0; i <= size; i++) {
      const thick = i % 2 === 0;
      doc.setLineWidth(thick ? 1.4 : 0.5);
      doc.line(gx, top + i * cell, gx + gridPx, top + i * cell);
      doc.line(gx + i * cell, top, gx + i * cell, top + gridPx);
    }
    // Dot markers on thick intersections keep counting easy.
    for (let r = 0; r <= size; r += 2) {
      for (let c = 0; c <= size; c += 2) {
        doc.circle(gx + c * cell, top + r * cell, 1.1, "F");
      }
    }

    doc.setFont("courier", "bold");
    doc.setFontSize(cell * 0.55);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const v = puzzle.puzzle[r][c];
        if (v === -1) continue;
        doc.text(
          String(v),
          gx + c * cell + cell / 2,
          top + r * cell + cell * 0.68,
          { align: "center" }
        );
      }
    }
    if (answerKey) {
      doc.setFont("courier", "normal");
      doc.setFontSize(cell * 0.45);
      doc.setTextColor(120, 120, 120);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (puzzle.puzzle[r][c] !== -1) continue;
          doc.text(
            String(puzzle.solution[r][c]),
            gx + c * cell + cell / 2,
            top + r * cell + cell * 0.68,
            { align: "center" }
          );
        }
      }
      doc.setTextColor(0, 0, 0);
    }
  };

  puzzles.forEach((_, i) => {
    if (i > 0) doc.addPage();
    drawGrid(puzzles[i], false, i);
  });
  puzzles.forEach((_, i) => {
    doc.addPage();
    drawGrid(puzzles[i], true, i);
  });

  savePdf(doc, `${PUZZLE_KEY}-${puzzles[0].size}x${puzzles[0].size}-${puzzles.length}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: puzzles.length,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function BinairoPreview({ puzzle }: { puzzle: BinairoPuzzle }) {
  const size = puzzle.size;
  const cellPx = Math.min(34, Math.floor(360 / size));
  const clues = puzzle.puzzle.flat().filter((v) => v >= 0).length;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div
          className="inline-grid border-2 border-neutral-900 bg-white"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellPx}px)` }}
        >
          {puzzle.puzzle.flat().map((v, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center font-mono font-bold text-neutral-900"
              style={{
                width: cellPx,
                height: cellPx,
                fontSize: Math.max(11, cellPx * 0.5),
                outline: "0.5px solid #9ca3af",
                outlineOffset: "-0.5px",
              }}
            >
              {v === -1 ? "" : v}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {clues} starting cells of {size * size} ·
        solution verified unique.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BinairoPage() {
  const pathname = usePathname();
  const [size, setSize] = useState(8);
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<BinairoPuzzle | null>(null);

  const generateOne = useCallback(() => generateBinairo(size as 6 | 8 | 10 | 12), [size]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setPreview(generateOne());
    });
    return () => {
      cancelled = true;
    };
  }, [generateOne]);

  const funnelProps = useCallback(
    () => ({
      template_slug: pathname,
      template_name: "Binairo Generator",
      device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
      orientation: "portrait" as const,
      source_page: pathname,
      puzzle_key: PUZZLE_KEY,
      grid_size: size,
      count: numPuzzles,
    }),
    [pathname, pageSize, size, numPuzzles]
  );

  const handleDownload = async () => {
    captureEvent("template_generator_started", funnelProps());
    const puzzles = Array.from({ length: numPuzzles }, () => generateOne());
    await downloadPDF(puzzles, pageSize);
    captureEvent("template_generated", funnelProps());
    setPreview(puzzles[0]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Binairo Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Takuzu-style binary logic grids — balance the 0s and 1s without
          tripling a digit or repeating a line. Every puzzle has exactly one
          solution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your puzzle before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Board size</Label>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 × 6 — Warm-up</SelectItem>
                  <SelectItem value="8">8 × 8 — Classic</SelectItem>
                  <SelectItem value="10">10 × 10 — Tricky</SelectItem>
                  <SelectItem value="12">12 × 12 — Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Puzzles per download</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{numPuzzles}</span>
              </div>
              <Slider
                min={1}
                max={6}
                step={1}
                value={[numPuzzles]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setNumPuzzles(val);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Page size</Label>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAGE_SIZES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setPreview(generateOne())}>
                Create new preview
              </Button>
              <Button onClick={handleDownload} disabled={!preview}>
                Generate & Download PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              12 × 12 boards take an extra moment — uniqueness checking is the
              slow part, and it always runs.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <BinairoPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}
