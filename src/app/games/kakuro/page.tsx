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
  generateKakuro,
  KakuroDifficulty,
  KakuroPuzzle,
  Cell,
} from "@/lib/generators/kakuro";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const DIFFICULTY_LABELS: Record<KakuroDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// ─── PDF Drawing ──────────────────────────────────────────────────────────────

function drawKakuroGrid(
  doc: jsPDF,
  puzzle: KakuroPuzzle,
  originX: number,
  originY: number,
  gridSize: number,
  isAnswerKey: boolean
) {
  const { grid, size } = puzzle;
  const cellSize = gridSize / size;

  doc.setFillColor(255, 255, 255);
  doc.rect(originX, originY, gridSize, gridSize, "F");

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = grid[r][c];
      const x = originX + c * cellSize;
      const y = originY + r * cellSize;

      if (cell.type === "black") {
        doc.setFillColor(35, 35, 35);
        doc.rect(x, y, cellSize, cellSize, "F");
      } else if (cell.type === "clue") {
        doc.setFillColor(35, 35, 35);
        doc.rect(x, y, cellSize, cellSize, "F");

        // Diagonal line from top-left to bottom-right
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(x, y, x + cellSize, y + cellSize);

        const clueFontSize = Math.max(6, Math.round(cellSize * 0.28));
        doc.setFontSize(clueFontSize);
        doc.setFont("helvetica", "bold");

        // Across sum (bottom-left triangle)
        if (cell.across !== undefined) {
          doc.setTextColor(255, 255, 255);
          doc.text(
            String(cell.across),
            x + cellSize * 0.55,
            y + cellSize * 0.88,
            { align: "center" }
          );
        }
        // Down sum (top-right triangle)
        if (cell.down !== undefined) {
          doc.setTextColor(255, 255, 255);
          doc.text(
            String(cell.down),
            x + cellSize * 0.78,
            y + cellSize * 0.38,
            { align: "center" }
          );
        }
      } else if (cell.type === "white") {
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, cellSize, cellSize, "F");

        if (isAnswerKey) {
          const valSize = Math.round(cellSize * 0.45);
          doc.setFontSize(valSize);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(
            String(cell.value),
            x + cellSize / 2,
            y + cellSize * 0.65,
            { align: "center" }
          );
        }
      }
    }
  }

  // Grid lines
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.4);
  for (let i = 0; i <= size; i++) {
    const px = originX + i * cellSize;
    const py = originY + i * cellSize;
    doc.line(px, originY, px, originY + gridSize);
    doc.line(originX, py, originX + gridSize, py);
  }

  // Outer border
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(2);
  doc.rect(originX, originY, gridSize, gridSize, "S");
}

function generatePDF(
  puzzles: KakuroPuzzle[],
  difficulty: KakuroDifficulty,
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

  // Puzzle pages
  puzzles.forEach((puzzle, idx) => {
    if (idx > 0) doc.addPage([pageW, pageH]);

    const headerY = margin * 0.6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`Kakuro — ${difficultyLabel}`, pageW / 2, headerY, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Puzzle ${idx + 1} of ${puzzles.length}`,
      pageW / 2,
      headerY + 16,
      { align: "center" }
    );

    const gridX = (pageW - maxGridSize) / 2;
    const gridY = margin;

    drawKakuroGrid(doc, puzzle, gridX, gridY, maxGridSize, false);
  });

  // Answer key pages (up to 4 per page)
  const answerGridSize = Math.min(
    usableW / 2 - margin * 0.25,
    usableH / 2 - margin * 0.25
  );
  const perPage = 4;
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
      const col = localIdx % 2;
      const row = Math.floor(localIdx / 2);

      const cellPadding = margin * 0.35;
      const gridX =
        margin * 0.5 + col * (answerGridSize + cellPadding * 2 + margin * 0.2);
      const gridY =
        margin + row * (answerGridSize + cellPadding * 2 + margin * 0.1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Puzzle ${i + 1}`,
        gridX + answerGridSize / 2,
        gridY - 6,
        { align: "center" }
      );

      drawKakuroGrid(doc, puzzles[i], gridX, gridY, answerGridSize, true);
    }
  }

  doc.save(`kakuro-${difficulty}-${puzzles.length}puzzles.pdf`);
}

// ─── Preview Grid Component ──────────────────────────────────────────────────

function KakuroPreviewGrid({ puzzle }: { puzzle: KakuroPuzzle }) {
  const { grid, size } = puzzle;
  const previewSize = 360;
  const cellSize = previewSize / size;

  return (
    <svg
      viewBox={`0 0 ${previewSize} ${previewSize}`}
      className="w-full max-w-[360px] h-auto border-2 border-foreground bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kakuro puzzle preview"
    >
      <rect x="0" y="0" width={previewSize} height={previewSize} fill="white" />

      {grid.map((row: Cell[], r: number) =>
        row.map((cell: Cell, c: number) => {
          const x = c * cellSize;
          const y = r * cellSize;

          if (cell.type === "black") {
            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill="#232323"
              />
            );
          }

          if (cell.type === "clue") {
            const clueFontSize = Math.max(8, cellSize * 0.3);
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill="#232323"
                />
                <line
                  x1={x}
                  y1={y}
                  x2={x + cellSize}
                  y2={y + cellSize}
                  stroke="#888"
                  strokeWidth={0.8}
                />
                {cell.across !== undefined && (
                  <text
                    x={x + cellSize * 0.55}
                    y={y + cellSize * 0.9}
                    textAnchor="middle"
                    fontSize={clueFontSize}
                    fontWeight={700}
                    fill="white"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {cell.across}
                  </text>
                )}
                {cell.down !== undefined && (
                  <text
                    x={x + cellSize * 0.78}
                    y={y + cellSize * 0.38}
                    textAnchor="middle"
                    fontSize={clueFontSize}
                    fontWeight={700}
                    fill="white"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {cell.down}
                  </text>
                )}
              </g>
            );
          }

          // White cell — shown empty in preview (user fills in)
          return (
            <rect
              key={`${r}-${c}`}
              x={x}
              y={y}
              width={cellSize}
              height={cellSize}
              fill="white"
            />
          );
        })
      )}

      {/* Grid lines */}
      {Array.from({ length: size + 1 }).map((_, i) => (
        <g key={`line-${i}`}>
          <line
            x1={i * cellSize}
            y1={0}
            x2={i * cellSize}
            y2={previewSize}
            stroke="#a0a0a0"
            strokeWidth={i === 0 || i === size ? 2.5 : 0.8}
          />
          <line
            x1={0}
            y1={i * cellSize}
            x2={previewSize}
            y2={i * cellSize}
            stroke="#a0a0a0"
            strokeWidth={i === 0 || i === size ? 2.5 : 0.8}
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KakuroPage() {
  const [difficulty, setDifficulty] = useState<KakuroDifficulty>("easy");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<KakuroPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    const puzzle = generateKakuro(difficulty);
    setPreviewPuzzle(puzzle);
  }, [difficulty]);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzles: KakuroPuzzle[] = Array.from(
          { length: numPuzzles },
          () => generateKakuro(difficulty)
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
        <h1 className="text-3xl font-bold tracking-tight">
          Kakuro Generator
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate printable Kakuro (math crossword) puzzles. Fill white cells
          with digits 1–9 so each run sums to the clue — no repeats within a
          run. Each PDF includes answer keys.
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
            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) =>
                  setDifficulty(v as KakuroDifficulty)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (6 × 6)</SelectItem>
                  <SelectItem value="medium">Medium (8 × 8)</SelectItem>
                  <SelectItem value="hard">Hard (10 × 10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              {DIFFICULTY_LABELS[difficulty]} · sample puzzle
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center pt-0 pb-6">
            {previewPuzzle ? (
              <KakuroPreviewGrid puzzle={previewPuzzle} />
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
