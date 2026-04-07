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
import { generateSudoku, SudokuDifficulty, SudokuPuzzle } from "@/lib/generators/sudoku";

type PageSize = "A4" | "Letter" | "reMarkable";

const PAGE_DIMENSIONS: Record<PageSize, [number, number]> = {
  A4: [595, 842],
  Letter: [612, 792],
  reMarkable: [495.72, 661.68],
};

const DIFFICULTY_LABELS: Record<SudokuDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  evil: "Evil",
};

// ─── PDF Generation ───────────────────────────────────────────────────────────

function drawSudokuGrid(
  doc: jsPDF,
  puzzle: number[][],
  solution: number[][] | null,
  originX: number,
  originY: number,
  gridSize: number,
  isAnswerKey: boolean
) {
  const cellSize = gridSize / 9;

  // Fill background
  doc.setFillColor(255, 255, 255);
  doc.rect(originX, originY, gridSize, gridSize, "F");

  // Draw cell values
  const fontSize = isAnswerKey ? Math.round(cellSize * 0.45) : Math.round(cellSize * 0.55);
  doc.setFontSize(fontSize);

  const grid = isAnswerKey && solution ? solution : puzzle;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const val = grid[row][col];
      if (val !== 0) {
        const cx = originX + col * cellSize + cellSize / 2;
        const cy = originY + row * cellSize + cellSize * 0.65;

        if (isAnswerKey) {
          // All numbers in answer key shown in a muted color
          doc.setTextColor(80, 80, 80);
        } else if (puzzle[row][col] !== 0) {
          // Given (clue) numbers: dark/bold
          doc.setTextColor(20, 20, 20);
        } else {
          doc.setTextColor(20, 20, 20);
        }

        doc.text(String(val), cx, cy, { align: "center" });
      }
    }
  }

  // Draw thin cell lines
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  for (let i = 0; i <= 9; i++) {
    const x = originX + i * cellSize;
    const y = originY + i * cellSize;
    doc.line(x, originY, x, originY + gridSize);
    doc.line(originX, y, originX + gridSize, y);
  }

  // Draw thick 3x3 box borders
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(isAnswerKey ? 1.2 : 1.8);
  for (let i = 0; i <= 3; i++) {
    const x = originX + i * cellSize * 3;
    const y = originY + i * cellSize * 3;
    doc.line(x, originY, x, originY + gridSize);
    doc.line(originX, y, originX + gridSize, y);
  }
}

function generatePDF(
  puzzles: SudokuPuzzle[],
  difficulty: SudokuDifficulty,
  pageSize: PageSize
) {
  const [pageW, pageH] = PAGE_DIMENSIONS[pageSize];
  const margin = pageW * 0.1;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // Grid occupies 80% of the smaller usable dimension
  const maxGridSize = Math.min(usableW, usableH * 0.82);
  const gridSize = maxGridSize;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  const difficultyLabel = DIFFICULTY_LABELS[difficulty];

  // ── Puzzle pages ──────────────────────────────────────────────────────────
  puzzles.forEach((puzzleData, idx) => {
    if (idx > 0) doc.addPage([pageW, pageH]);

    const headerY = margin * 0.6;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`Sudoku — ${difficultyLabel}`, pageW / 2, headerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Puzzle ${idx + 1} of ${puzzles.length}`, pageW / 2, headerY + 16, {
      align: "center",
    });

    // Center the grid horizontally; place it below header with some padding
    const gridX = (pageW - gridSize) / 2;
    const gridY = margin;

    drawSudokuGrid(doc, puzzleData.puzzle, puzzleData.solution, gridX, gridY, gridSize, false);
  });

  // ── Answer key pages ──────────────────────────────────────────────────────
  // Up to 4 answer-key grids per page, arranged in a 2×2 layout
  const answerGridSize = Math.min(usableW / 2 - margin * 0.25, usableH / 2 - margin * 0.25);
  const colsPerRow = 2;
  const rowsPerPage = 2;
  const perPage = colsPerRow * rowsPerPage;

  const totalAnswerPages = Math.ceil(puzzles.length / perPage);

  for (let pageIdx = 0; pageIdx < totalAnswerPages; pageIdx++) {
    doc.addPage([pageW, pageH]);

    const headerY = margin * 0.55;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Keys", pageW / 2, headerY, { align: "center" });

    const startPuzzle = pageIdx * perPage;
    const endPuzzle = Math.min(startPuzzle + perPage, puzzles.length);

    for (let i = startPuzzle; i < endPuzzle; i++) {
      const localIdx = i - startPuzzle;
      const col = localIdx % colsPerRow;
      const row = Math.floor(localIdx / colsPerRow);

      const cellPadding = margin * 0.35;
      const gridX =
        margin * 0.5 + col * (answerGridSize + cellPadding * 2 + margin * 0.2);
      const gridY =
        margin +
        row * (answerGridSize + cellPadding * 2 + margin * 0.1);

      // Mini label above each answer grid
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Puzzle ${i + 1}`, gridX + answerGridSize / 2, gridY - 6, {
        align: "center",
      });

      drawSudokuGrid(
        doc,
        puzzles[i].puzzle,
        puzzles[i].solution,
        gridX,
        gridY,
        answerGridSize,
        true
      );
    }
  }

  doc.save(`sudoku-${difficulty}-${puzzles.length}puzzles.pdf`);
}

// ─── Preview Grid Component ───────────────────────────────────────────────────

function SudokuPreviewGrid({ puzzle }: { puzzle: number[][] }) {
  const previewSize = 360;
  const cellSize = previewSize / 9;

  return (
    <svg
      viewBox={`0 0 ${previewSize} ${previewSize}`}
      className="w-full max-w-[360px] h-auto border-2 border-foreground bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Sudoku puzzle preview"
    >
      <rect x="0" y="0" width={previewSize} height={previewSize} fill="white" />

      {Array.from({ length: 10 }).map((_, i) => (
        <g key={`line-${i}`}>
          <line
            x1={i * cellSize}
            y1={0}
            x2={i * cellSize}
            y2={previewSize}
            stroke={i % 3 === 0 ? "#111111" : "#d4d4d8"}
            strokeWidth={i % 3 === 0 ? 2.5 : 1}
          />
          <line
            x1={0}
            y1={i * cellSize}
            x2={previewSize}
            y2={i * cellSize}
            stroke={i % 3 === 0 ? "#111111" : "#d4d4d8"}
            strokeWidth={i % 3 === 0 ? 2.5 : 1}
          />
        </g>
      ))}

      {puzzle.map((row, rowIdx) =>
        row.map((val, colIdx) => {
          if (val === 0) return null;
          return (
            <text
              key={`${rowIdx}-${colIdx}`}
              x={colIdx * cellSize + cellSize / 2}
              y={rowIdx * cellSize + cellSize * 0.64}
              textAnchor="middle"
              fontSize={21}
              fontWeight={600}
              fill="#111111"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {val}
            </text>
          );
        })
      )}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SudokuPage() {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("medium");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<SudokuPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    const puzzle = generateSudoku(difficulty);
    setPreviewPuzzle(puzzle);
  }, [difficulty]);

  // Generate preview on first load and whenever difficulty changes
  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    // Use setTimeout to let React re-render the "generating" state before the
    // synchronous PDF work blocks the thread.
    setTimeout(() => {
      try {
        const puzzles: SudokuPuzzle[] = Array.from({ length: numPuzzles }, () =>
          generateSudoku(difficulty)
        );
        generatePDF(puzzles, difficulty, pageSize);
        // Update preview with the first generated puzzle
        setPreviewPuzzle(puzzles[0]);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sudoku Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Generate printable Sudoku puzzles at any difficulty. Each PDF includes
          answer keys on the final pages.
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
                onValueChange={(v) => setDifficulty(v as SudokuDifficulty)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (35 clues)</SelectItem>
                  <SelectItem value="medium">Medium (28 clues)</SelectItem>
                  <SelectItem value="hard">Hard (22 clues)</SelectItem>
                  <SelectItem value="evil">Evil (17 clues)</SelectItem>
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
                onValueChange={(v) => setPageSize(v as PageSize)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="reMarkable">reMarkable (1404 × 1872 px)</SelectItem>
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
              <SudokuPreviewGrid puzzle={previewPuzzle.puzzle} />
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
