"use client";

import { useState, useEffect, useCallback } from "react";
import { savePdf } from "@/lib/download-tracker";
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
import {
  generateFutoshiki,
  FutoshikiDifficulty,
  FutoshikiPuzzle,
  Inequality,
} from "@/lib/generators/futoshiki";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const DIFFICULTY_LABELS: Record<FutoshikiDifficulty, string> = {
  easy: "Easy (4×4)",
  medium: "Medium (5×5)",
  hard: "Hard (6×6)",
};

// ─── Inequality sign helpers ────────────────────────────────────────────────
//
// Each inequality stores its "greater" cell first (r1,c1) and the "lesser"
// cell second (r2,c2). To draw the sign in the gap between the two cells we
// figure out which direction the ">" opens: it always opens toward the larger
// value (the greater cell).

/** For a horizontal pair, the sign is "<" or ">" depending on cell order. */
function horizontalSign(ineq: Inequality): "<" | ">" {
  // Same row. If the greater cell is on the right, the left cell is smaller,
  // so the sign reads "<"; otherwise ">".
  return ineq.c1 > ineq.c2 ? "<" : ">";
}

/** For a vertical pair, the sign is "∧" (top<bottom) or "∨" (top>bottom). */
function verticalSign(ineq: Inequality): "∧" | "∨" {
  // If the greater cell is the lower row, the top cell is smaller → "∧".
  return ineq.r1 > ineq.r2 ? "∧" : "∨";
}

/** The row/col of the upper-left cell of a horizontal or vertical pair. */
function pairAnchor(ineq: Inequality): { row: number; col: number } {
  return {
    row: Math.min(ineq.r1, ineq.r2),
    col: Math.min(ineq.c1, ineq.c2),
  };
}

// ─── PDF Generation ──────────────────────────────────────────────────────────

function drawFutoshikiGrid(
  doc: jsPDF,
  puzzle: FutoshikiPuzzle,
  originX: number,
  originY: number,
  gridSize: number,
  isAnswerKey: boolean
) {
  const n = puzzle.size;
  const cellSize = gridSize / n;

  doc.setFillColor(255, 255, 255);
  doc.rect(originX, originY, gridSize, gridSize, "F");

  // Cell grid lines
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(isAnswerKey ? 0.6 : 0.9);
  for (let i = 0; i <= n; i++) {
    doc.line(originX + i * cellSize, originY, originX + i * cellSize, originY + gridSize);
    doc.line(originX, originY + i * cellSize, originX + gridSize, originY + i * cellSize);
  }

  // Numbers: answer key shows full solution; puzzle shows only givens.
  const numSize = Math.round(cellSize * 0.42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(numSize);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const value = isAnswerKey ? puzzle.solution[r][c] : puzzle.givens[r][c];
      if (value === 0) continue;
      doc.setTextColor(isAnswerKey ? 80 : 30, isAnswerKey ? 80 : 30, isAnswerKey ? 80 : 30);
      const cx = originX + c * cellSize + cellSize / 2;
      const cy = originY + r * cellSize + cellSize * 0.66;
      doc.text(String(value), cx, cy, { align: "center" });
    }
  }

  // Inequality signs in the gaps between cells.
  const signSize = Math.round(cellSize * 0.34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(signSize);
  doc.setTextColor(20, 20, 20);

  for (const ineq of puzzle.inequalities) {
    const { row, col } = pairAnchor(ineq);
    if (ineq.orientation === "horizontal") {
      // Between cell (row,col) and (row,col+1): centre on the shared edge.
      const x = originX + (col + 1) * cellSize;
      const y = originY + row * cellSize + cellSize * 0.62;
      doc.text(horizontalSign(ineq), x, y, { align: "center" });
    } else {
      // Between cell (row,col) and (row+1,col): centre on the shared edge.
      const x = originX + col * cellSize + cellSize / 2;
      const y = originY + (row + 1) * cellSize + signSize * 0.35;
      doc.text(verticalSign(ineq), x, y, { align: "center" });
    }
  }
}

function generatePDF(
  puzzles: FutoshikiPuzzle[],
  difficulty: FutoshikiDifficulty,
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

  // ── Puzzle pages ───────────────────────────────────────────────────────────
  puzzles.forEach((puzzle, idx) => {
    if (idx > 0) doc.addPage([pageW, pageH]);

    const headerY = margin * 0.6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`Futoshiki — ${difficultyLabel}`, pageW / 2, headerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Puzzle ${idx + 1} of ${puzzles.length}`, pageW / 2, headerY + 16, {
      align: "center",
    });

    const gridX = (pageW - maxGridSize) / 2;
    const gridY = margin;

    drawFutoshikiGrid(doc, puzzle, gridX, gridY, maxGridSize, false);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Fill each row and column with 1–" +
        puzzle.size +
        ". Arrows of inequality (> < ∧ ∨) must hold between cells.",
      pageW / 2,
      gridY + maxGridSize + 24,
      { align: "center" }
    );
  });

  // ── Answer key pages (2×2 layout) ───────────────────────────────────────────
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

      drawFutoshikiGrid(doc, puzzles[i], gridX, gridY, answerGridSize, true);
    }
  }

  savePdf(doc, `futoshiki-${difficulty}-${puzzles.length}puzzles.pdf`);
}

// ─── Preview Grid Component ──────────────────────────────────────────────────

function FutoshikiPreviewGrid({ puzzle }: { puzzle: FutoshikiPuzzle }) {
  const n = puzzle.size;
  const viewSize = 360;
  const cellSize = viewSize / n;

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="w-full max-w-[360px] h-auto border-2 border-neutral-900 bg-white"
      role="img"
      aria-label="Futoshiki puzzle preview"
    >
      <rect x="0" y="0" width={viewSize} height={viewSize} fill="white" />

      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={i * cellSize} y1={0}
            x2={i * cellSize} y2={viewSize}
            stroke="#3f3f46" strokeWidth={1}
          />
          <line
            x1={0} y1={i * cellSize}
            x2={viewSize} y2={i * cellSize}
            stroke="#3f3f46" strokeWidth={1}
          />
        </g>
      ))}

      <rect
        x={0} y={0} width={viewSize} height={viewSize}
        fill="none" stroke="#111111" strokeWidth={2.5}
      />

      {/* Givens */}
      {puzzle.givens.flatMap((rowVals, r) =>
        rowVals.map((value, c) =>
          value === 0 ? null : (
            <text
              key={`g-${r}-${c}`}
              x={c * cellSize + cellSize / 2}
              y={r * cellSize + cellSize * 0.65}
              fontSize={cellSize * 0.42}
              fontWeight={600}
              fill="#111111"
              textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {value}
            </text>
          )
        )
      )}

      {/* Inequality signs */}
      {puzzle.inequalities.map((ineq, i) => {
        const { row, col } = pairAnchor(ineq);
        if (ineq.orientation === "horizontal") {
          return (
            <text
              key={`ineq-${i}`}
              x={(col + 1) * cellSize}
              y={row * cellSize + cellSize * 0.6}
              fontSize={cellSize * 0.36}
              fontWeight={700}
              fill="#111111"
              textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {horizontalSign(ineq)}
            </text>
          );
        }
        return (
          <text
            key={`ineq-${i}`}
            x={col * cellSize + cellSize / 2}
            y={(row + 1) * cellSize + cellSize * 0.14}
            fontSize={cellSize * 0.36}
            fontWeight={700}
            fill="#111111"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {verticalSign(ineq)}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FutoshikiPage() {
  const [difficulty, setDifficulty] = useState<FutoshikiDifficulty>("medium");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<FutoshikiPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sizeFor = useCallback(
    (d: FutoshikiDifficulty) => (d === "easy" ? 4 : d === "medium" ? 5 : 6),
    []
  );

  const regeneratePreview = useCallback(() => {
    setPreviewPuzzle(generateFutoshiki(sizeFor(difficulty), difficulty));
  }, [difficulty, sizeFor]);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzles: FutoshikiPuzzle[] = Array.from({ length: numPuzzles }, () =>
          generateFutoshiki(sizeFor(difficulty), difficulty)
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
        <h1 className="text-3xl font-bold tracking-tight">Futoshiki Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Generate printable Futoshiki puzzles — Latin-square grids with
          greater-than / less-than inequality clues. Every puzzle has a unique
          solution, and each PDF includes answer keys.
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
                onValueChange={(v) => setDifficulty(v as FutoshikiDifficulty)}
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
              <FutoshikiPreviewGrid puzzle={previewPuzzle} />
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
