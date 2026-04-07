"use client";

import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateKenKen, KenKenDifficulty, KenKenPuzzle, Cage } from "@/lib/generators/kenken";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const DIFFICULTY_LABELS: Record<KenKenDifficulty, string> = {
  easy: "Easy (4×4)",
  medium: "Medium (5×5)",
  hard: "Hard (6×6)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCageMap(puzzle: KenKenPuzzle): number[][] {
  const map: number[][] = Array.from({ length: puzzle.size }, () =>
    Array(puzzle.size).fill(-1)
  );
  puzzle.cages.forEach((cage, idx) => {
    for (const [r, c] of cage.cells) map[r][c] = idx;
  });
  return map;
}

function cageLabel(cage: Cage): string {
  return cage.cells.length === 1 ? `${cage.target}` : `${cage.target}${cage.operation}`;
}

function cageTopLeftCell(cage: Cage): [number, number] {
  return [...cage.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

function drawKenKenGrid(
  doc: jsPDF,
  puzzle: KenKenPuzzle,
  originX: number,
  originY: number,
  gridSize: number,
  isAnswerKey: boolean
) {
  const n = puzzle.size;
  const cellSize = gridSize / n;
  const cageMap = buildCageMap(puzzle);

  doc.setFillColor(255, 255, 255);
  doc.rect(originX, originY, gridSize, gridSize, "F");

  // Thin cell grid lines
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  for (let i = 0; i <= n; i++) {
    doc.line(originX + i * cellSize, originY, originX + i * cellSize, originY + gridSize);
    doc.line(originX, originY + i * cellSize, originX + gridSize, originY + i * cellSize);
  }

  // Thick cage borders
  const borderW = isAnswerKey ? 1.0 : 1.6;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(borderW);

  doc.rect(originX, originY, gridSize, gridSize);

  for (let c = 1; c < n; c++) {
    for (let r = 0; r < n; r++) {
      if (cageMap[r][c - 1] !== cageMap[r][c]) {
        const x = originX + c * cellSize;
        doc.line(x, originY + r * cellSize, x, originY + (r + 1) * cellSize);
      }
    }
  }
  for (let r = 1; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cageMap[r - 1][c] !== cageMap[r][c]) {
        const y = originY + r * cellSize;
        doc.line(originX + c * cellSize, y, originX + (c + 1) * cellSize, y);
      }
    }
  }

  // Cage labels (target + operation in top-left cell)
  const labelSize = Math.max(7, Math.round(cellSize * (isAnswerKey ? 0.2 : 0.25)));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(labelSize);
  doc.setTextColor(30, 30, 30);

  for (const cage of puzzle.cages) {
    const [r, c] = cageTopLeftCell(cage);
    const x = originX + c * cellSize + cellSize * 0.06;
    const y = originY + r * cellSize + labelSize * 1.15;
    doc.text(cageLabel(cage), x, y);
  }

  // Answer key: fill in solution numbers
  if (isAnswerKey) {
    const numSize = Math.round(cellSize * 0.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(numSize);
    doc.setTextColor(80, 80, 80);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cx = originX + c * cellSize + cellSize / 2;
        const cy = originY + r * cellSize + cellSize * 0.7;
        doc.text(String(puzzle.solution[r][c]), cx, cy, { align: "center" });
      }
    }
  }
}

function generatePDF(
  puzzles: KenKenPuzzle[],
  difficulty: KenKenDifficulty,
  pageSize: PageSizeKey
) {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];
  const margin = pageW * 0.1;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;
  const maxGridSize = Math.min(usableW, usableH * 0.82);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  const difficultyLabel = DIFFICULTY_LABELS[difficulty];

  // ── Puzzle pages ────────────────────────────────────────────────────────────
  puzzles.forEach((puzzle, idx) => {
    if (idx > 0) doc.addPage([pageW, pageH]);

    const headerY = margin * 0.6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`KenKen — ${difficultyLabel}`, pageW / 2, headerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Puzzle ${idx + 1} of ${puzzles.length}`, pageW / 2, headerY + 16, {
      align: "center",
    });

    const gridX = (pageW - maxGridSize) / 2;
    const gridY = margin;

    drawKenKenGrid(doc, puzzle, gridX, gridY, maxGridSize, false);
  });

  // ── Answer key pages (2×2 layout) ──────────────────────────────────────────
  const answerGridSize = Math.min(usableW / 2 - margin * 0.25, usableH / 2 - margin * 0.25);
  const colsPerRow = 2;
  const rowsPerPage = 2;
  const perPage = colsPerRow * rowsPerPage;
  const totalAnswerPages = Math.ceil(puzzles.length / perPage);

  for (let pageIdx = 0; pageIdx < totalAnswerPages; pageIdx++) {
    doc.addPage([pageW, pageH]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Keys", pageW / 2, margin * 0.55, { align: "center" });

    const startPuzzle = pageIdx * perPage;
    const endPuzzle = Math.min(startPuzzle + perPage, puzzles.length);

    for (let i = startPuzzle; i < endPuzzle; i++) {
      const localIdx = i - startPuzzle;
      const col = localIdx % colsPerRow;
      const row = Math.floor(localIdx / colsPerRow);

      const cellPadding = margin * 0.35;
      const gridX = margin * 0.5 + col * (answerGridSize + cellPadding * 2 + margin * 0.2);
      const gridY = margin + row * (answerGridSize + cellPadding * 2 + margin * 0.1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Puzzle ${i + 1}`, gridX + answerGridSize / 2, gridY - 6, {
        align: "center",
      });

      drawKenKenGrid(doc, puzzles[i], gridX, gridY, answerGridSize, true);
    }
  }

  doc.save(`kenken-${difficulty}-${puzzles.length}puzzles.pdf`);
}

// ─── Preview Grid Component ───────────────────────────────────────────────────

function KenKenPreviewGrid({ puzzle }: { puzzle: KenKenPuzzle }) {
  const n = puzzle.size;
  const viewSize = 360;
  const cellSize = viewSize / n;
  const cageMap = buildCageMap(puzzle);

  const cageBorders: React.ReactElement[] = [];

  for (let c = 1; c < n; c++) {
    for (let r = 0; r < n; r++) {
      if (cageMap[r][c - 1] !== cageMap[r][c]) {
        cageBorders.push(
          <line
            key={`v-${c}-${r}`}
            x1={c * cellSize}
            y1={r * cellSize}
            x2={c * cellSize}
            y2={(r + 1) * cellSize}
            stroke="#111111"
            strokeWidth={2.5}
          />
        );
      }
    }
  }

  for (let r = 1; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cageMap[r - 1][c] !== cageMap[r][c]) {
        cageBorders.push(
          <line
            key={`h-${r}-${c}`}
            x1={c * cellSize}
            y1={r * cellSize}
            x2={(c + 1) * cellSize}
            y2={r * cellSize}
            stroke="#111111"
            strokeWidth={2.5}
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="w-full max-w-[360px] h-auto border-2 border-foreground bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="KenKen puzzle preview"
    >
      <rect x="0" y="0" width={viewSize} height={viewSize} fill="white" />

      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={i * cellSize} y1={0}
            x2={i * cellSize} y2={viewSize}
            stroke="#d4d4d8" strokeWidth={0.5}
          />
          <line
            x1={0} y1={i * cellSize}
            x2={viewSize} y2={i * cellSize}
            stroke="#d4d4d8" strokeWidth={0.5}
          />
        </g>
      ))}

      {cageBorders}

      <rect
        x={0} y={0} width={viewSize} height={viewSize}
        fill="none" stroke="#111111" strokeWidth={2.5}
      />

      {puzzle.cages.map((cage, i) => {
        const [r, c] = cageTopLeftCell(cage);
        const label = cageLabel(cage);
        const fontSize = cellSize * 0.24;
        return (
          <text
            key={`label-${i}`}
            x={c * cellSize + cellSize * 0.06}
            y={r * cellSize + fontSize * 1.2}
            fontSize={fontSize}
            fontWeight={700}
            fill="#111111"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KenKenPage() {
  const [difficulty, setDifficulty] = useState<KenKenDifficulty>("medium");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<KenKenPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    setPreviewPuzzle(generateKenKen(difficulty));
  }, [difficulty]);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzles: KenKenPuzzle[] = Array.from({ length: numPuzzles }, () =>
          generateKenKen(difficulty)
        );
        generatePDF(puzzles, difficulty, pageSize);
        setPreviewPuzzle(puzzles[0]);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">KenKen Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Generate printable KenKen puzzles — arithmetic logic puzzles combining
          Latin squares with cage operations. Each PDF includes answer keys.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your puzzle before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as KenKenDifficulty)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (4×4)</SelectItem>
                  <SelectItem value="medium">Medium (5×5)</SelectItem>
                  <SelectItem value="hard">Hard (6×6)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of puzzles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Puzzles</Label>
                <span className="text-sm font-semibold tabular-nums">{numPuzzles}</span>
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
              <Button variant="ghost" size="sm" className="shrink-0" onClick={regeneratePreview}>
                Regenerate
              </Button>
            </div>
            <CardDescription>
              {DIFFICULTY_LABELS[difficulty]} · sample puzzle
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center pt-0 pb-6">
            {previewPuzzle ? (
              <KenKenPreviewGrid puzzle={previewPuzzle} />
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
