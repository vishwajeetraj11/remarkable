"use client";

import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateNumberFill,
  NumberFillPuzzle,
} from "@/lib/generators/number-fill";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

// ─── PDF helpers ──────────────────────────────────────────────────────────────

function drawGrid(
  doc: jsPDF,
  puzzle: NumberFillPuzzle,
  ox: number,
  oy: number,
  gridSize: number,
  showSolution: boolean
) {
  const n = puzzle.size;
  const cell = gridSize / n;

  doc.setFillColor(255, 255, 255);
  doc.rect(ox, oy, gridSize, gridSize, "F");

  doc.setFillColor(30, 30, 30);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (puzzle.grid[r][c] === null) {
        doc.rect(ox + c * cell, oy + r * cell, cell, cell, "F");
      }
    }
  }

  if (showSolution) {
    const fs = Math.max(Math.round(cell * 0.5), 6);
    doc.setFontSize(fs);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const v = puzzle.grid[r][c];
        if (v !== null) {
          doc.text(
            String(v),
            ox + c * cell + cell / 2,
            oy + r * cell + cell * 0.65,
            { align: "center" }
          );
        }
      }
    }
  }

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  for (let i = 0; i <= n; i++) {
    doc.line(ox + i * cell, oy, ox + i * cell, oy + gridSize);
    doc.line(ox, oy + i * cell, ox + gridSize, oy + i * cell);
  }

  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(showSolution ? 1.0 : 1.5);
  doc.rect(ox, oy, gridSize, gridSize, "S");
}

function drawNumberList(
  doc: jsPDF,
  numbers: number[],
  x: number,
  y: number,
  maxWidth: number
) {
  const groups = new Map<number, number[]>();
  for (const n of numbers) {
    const len = String(n).length;
    if (!groups.has(len)) groups.set(len, []);
    groups.get(len)!.push(n);
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => a - b);
  let curY = y;
  const lineHeight = 13;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Numbers to Place", x + maxWidth / 2, curY, { align: "center" });
  curY += 16;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(x, curY - 4, x + maxWidth, curY - 4);

  const labelWidth = 55;
  const numAreaWidth = maxWidth - labelWidth;
  const gap = "   ";

  for (const len of sortedKeys) {
    const nums = groups.get(len)!.sort((a, b) => a - b);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`${len} Digits:`, x, curY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    let line = "";
    const numX = x + labelWidth;

    for (const n of nums) {
      const candidate = line ? line + gap + n : String(n);
      if (doc.getTextWidth(candidate) > numAreaWidth && line) {
        doc.text(line, numX, curY);
        curY += lineHeight;
        line = String(n);
      } else {
        line = candidate;
      }
    }
    if (line) {
      doc.text(line, numX, curY);
      curY += lineHeight + 2;
    }
  }
}

function generatePDF(puzzles: NumberFillPuzzle[], pageSize: PageSizeKey) {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];
  const margin = pageW * 0.1;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  // ── Puzzle pages ───────────────────────────────────────────────────────────
  puzzles.forEach((puzzle, idx) => {
    if (idx > 0) doc.addPage([pageW, pageH]);

    const headerY = margin * 0.6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Number Fill-In", pageW / 2, headerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Puzzle ${idx + 1} of ${puzzles.length}`,
      pageW / 2,
      headerY + 16,
      { align: "center" }
    );

    const maxGridSize = Math.min(usableW, usableH * 0.52);
    const gridX = (pageW - maxGridSize) / 2;
    const gridY = margin;

    drawGrid(doc, puzzle, gridX, gridY, maxGridSize, false);

    const listY = gridY + maxGridSize + 20;
    drawNumberList(doc, puzzle.numbers, margin, listY, usableW);
  });

  // ── Answer-key pages (2×2 layout) ─────────────────────────────────────────
  const answerGridSize = Math.min(
    usableW / 2 - margin * 0.25,
    usableH / 2 - margin * 0.35
  );
  const perPage = 4;
  const totalPages = Math.ceil(puzzles.length / perPage);

  for (let p = 0; p < totalPages; p++) {
    doc.addPage([pageW, pageH]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Keys", pageW / 2, margin * 0.55, { align: "center" });

    const start = p * perPage;
    const end = Math.min(start + perPage, puzzles.length);

    for (let i = start; i < end; i++) {
      const li = i - start;
      const col = li % 2;
      const row = Math.floor(li / 2);

      const pad = margin * 0.35;
      const gx =
        margin * 0.5 + col * (answerGridSize + pad * 2 + margin * 0.2);
      const gy = margin + row * (answerGridSize + pad * 2 + margin * 0.1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Puzzle ${i + 1}`, gx + answerGridSize / 2, gy - 6, {
        align: "center",
      });

      drawGrid(doc, puzzles[i], gx, gy, answerGridSize, true);
    }
  }

  doc.save(`number-fill-in-${puzzles.length}puzzles.pdf`);
}

// ─── SVG Preview ──────────────────────────────────────────────────────────────

function NumberFillPreviewGrid({ puzzle }: { puzzle: NumberFillPuzzle }) {
  const viewSize = 360;
  const cell = viewSize / puzzle.size;

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="w-full max-w-[360px] h-auto border-2 border-foreground bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Number Fill-In puzzle preview"
    >
      <rect x="0" y="0" width={viewSize} height={viewSize} fill="white" />

      {puzzle.grid.map((row, r) =>
        row.map((val, c) =>
          val === null ? (
            <rect
              key={`b-${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill="#1a1a1a"
            />
          ) : null
        )
      )}

      {Array.from({ length: puzzle.size + 1 }).map((_, i) => (
        <g key={`l-${i}`}>
          <line
            x1={i * cell}
            y1={0}
            x2={i * cell}
            y2={viewSize}
            stroke={i === 0 || i === puzzle.size ? "#111111" : "#d4d4d8"}
            strokeWidth={i === 0 || i === puzzle.size ? 2.5 : 0.5}
          />
          <line
            x1={0}
            y1={i * cell}
            x2={viewSize}
            y2={i * cell}
            stroke={i === 0 || i === puzzle.size ? "#111111" : "#d4d4d8"}
            strokeWidth={i === 0 || i === puzzle.size ? 2.5 : 0.5}
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NumberFillPage() {
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<NumberFillPuzzle | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    setPreviewPuzzle(generateNumberFill());
  }, []);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzles: NumberFillPuzzle[] = Array.from(
          { length: numPuzzles },
          () => generateNumberFill()
        );
        generatePDF(puzzles, pageSize);
        setPreviewPuzzle(puzzles[0]);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Number Fill-In Generator
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate printable number fill-in puzzles. Fit numbers of various
          lengths into a crossword-style grid. Each PDF includes answer keys on
          the final pages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your puzzle before downloading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of puzzles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Puzzles</Label>
                <span className="text-sm font-semibold tabular-nums">
                  {numPuzzles}
                </span>
              </div>
              <Slider
                min={1}
                max={6}
                value={[numPuzzles]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setNumPuzzles(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>6</span>
              </div>
            </div>

            {/* Page size */}
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select
                value={pageSize}
                onValueChange={(v) => setPageSize(v as PageSizeKey)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">{PAGE_SIZES.A4.label}</SelectItem>
                  <SelectItem value="Letter">{PAGE_SIZES.Letter.label}</SelectItem>
                  <SelectItem value="eInk">{PAGE_SIZES.eInk.label}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating…" : "Generate & Download PDF"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="h-fit">
          <CardHeader className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Preview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={regeneratePreview}
              >
                Regenerate
              </Button>
            </div>
            <CardDescription>
              {previewPuzzle
                ? `${previewPuzzle.numbers.length} numbers to place`
                : "Sample puzzle grid"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center pt-0 pb-6">
            {previewPuzzle ? (
              <NumberFillPreviewGrid puzzle={previewPuzzle} />
            ) : (
              <div className="flex aspect-square w-full max-w-[360px] items-center justify-center border-2 border-dashed border-border text-muted-foreground text-sm">
                Generating…
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
