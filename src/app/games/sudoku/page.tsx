"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { savePdf } from "@/lib/download-tracker";
import { captureEvent, normalizeTemplateDevice } from "@/lib/analytics";
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
  boxDimensions,
  cluesForDifficulty,
  type SudokuDifficulty,
  type SudokuGridSize,
  type SudokuPuzzle,
} from "@/lib/generators/sudoku";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const DIFFICULTY_LABELS: Record<SudokuDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  evil: "Evil",
};

const GRID_SIZES: { value: SudokuGridSize; label: string; hint: string }[] = [
  { value: 4, label: "4 × 4", hint: "Kids & warm-up" },
  { value: 6, label: "6 × 6", hint: "Light" },
  { value: 9, label: "9 × 9", hint: "Classic" },
  { value: 12, label: "12 × 12", hint: "Expert" },
];

// Map page-size keys to the device vocabulary used by template funnel events.
const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

// ─── PDF Generation ───────────────────────────────────────────────────────────

function drawSudokuGrid(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  puzzleData: SudokuPuzzle,
  originX: number,
  originY: number,
  gridPx: number,
  isAnswerKey: boolean
) {
  const size = puzzleData.size;
  const { boxW, boxH } = boxDimensions(size);
  const cellSize = gridPx / size;
  const grid = isAnswerKey ? puzzleData.solution : puzzleData.puzzle;

  // Fill background
  doc.setFillColor(255, 255, 255);
  doc.rect(originX, originY, gridPx, gridPx, "F");

  // Draw cell values
  const fontSize = (isAnswerKey ? 0.45 : 0.55) * cellSize;
  doc.setFontSize(fontSize);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const val = grid[row][col];
      if (val !== 0) {
        const cx = originX + col * cellSize + cellSize / 2;
        const cy = originY + row * cellSize + cellSize * 0.65;

        doc.setTextColor(isAnswerKey ? 80 : 20, isAnswerKey ? 80 : 20, isAnswerKey ? 80 : 20);
        doc.text(String(val), cx, cy, { align: "center" });
      }
    }
  }

  // Draw thin cell lines
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  for (let i = 0; i <= size; i++) {
    const x = originX + i * cellSize;
    const y = originY + i * cellSize;
    doc.line(x, originY, x, originY + gridPx);
    doc.line(originX, y, originX + gridPx, y);
  }

  // Draw thick box borders
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(isAnswerKey ? 1.2 : 1.8);
  for (let x = 0; x <= size; x += boxW) {
    const px = originX + x * cellSize;
    doc.line(px, originY, px, originY + gridPx);
  }
  for (let y = 0; y <= size; y += boxH) {
    const py = originY + y * cellSize;
    doc.line(originX, py, originX + gridPx, py);
  }
}

/** Answer-key grids per page: small grids fit 3×3, large grids 2×2. */
function answerLayout(size: SudokuGridSize) {
  return size <= 6
    ? { colsPerRow: 3, rowsPerPage: 3 }
    : { colsPerRow: 2, rowsPerPage: 2 };
}

export function countPdfPages(puzzleCount: number, size: SudokuGridSize): number {
  const perPage =
    answerLayout(size).colsPerRow * answerLayout(size).rowsPerPage;
  const answerPages = Math.ceil(puzzleCount / perPage);
  const indexPages = puzzleCount > 1 ? 1 : 0;
  return indexPages + puzzleCount + answerPages;
}

async function generatePDF(
  puzzles: SudokuPuzzle[],
  difficulty: SudokuDifficulty,
  pageSize: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];
  const margin = pageW * 0.1;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // Grid occupies 80% of the smaller usable dimension
  const gridSize = Math.min(usableW, usableH * 0.82);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  const sample = puzzles[0];
  const hasIndex = puzzles.length > 1;
  const firstPuzzlePage = hasIndex ? 2 : 1;
  const { colsPerRow, rowsPerPage } = answerLayout(sample.size);
  const perPage = colsPerRow * rowsPerPage;
  const totalAnswerPages = Math.ceil(puzzles.length / perPage);
  const firstAnswerPage = firstPuzzlePage + puzzles.length;
  const totalPages = firstAnswerPage + totalAnswerPages - 1;

  const drawFooter = (pageNo: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(`${pageNo} / ${totalPages}`, pageW / 2, pageH - margin * 0.35, {
      align: "center",
    });
  };

  let currentPage = 1;

  // ── Index page (book mode) ────────────────────────────────────────────────
  if (hasIndex) {
    const headerY = margin * 0.6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Sudoku Book", pageW / 2, headerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${difficultyLabel} · ${puzzles.length} puzzles · ${sample.size} × ${sample.size}`,
      pageW / 2,
      headerY + 16,
      { align: "center" }
    );

    let y = margin + 24;
    const rowHeight = Math.min(22, (usableH - 40) / (puzzles.length + 1));

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("CONTENTS", margin, y);
    y += rowHeight * 0.8;

    const entries: { label: string; page: number; y: number }[] = [];

    puzzles.forEach((_, idx) => {
      entries.push({
        label: `Puzzle ${idx + 1}`,
        page: firstPuzzlePage + idx,
        y,
      });
      y += rowHeight;
    });
    entries.push({ label: "Answer Keys", page: firstAnswerPage, y });

    for (const entry of entries) {
      const isAnswers = entry.label === "Answer Keys";

      doc.setFont("helvetica", isAnswers ? "bold" : "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(entry.label, margin + 6, entry.y);
      const nameW = doc.getTextWidth(entry.label);

      const pageStr = `p. ${entry.page}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(pageStr, pageW - margin - 6, entry.y, { align: "right" });

      // Dot leader
      const pageWd = doc.getTextWidth(pageStr);
      doc.setFontSize(7);
      doc.setTextColor(190, 190, 190);
      let dotX = margin + 6 + nameW + 6;
      const dotEnd = pageW - margin - 6 - pageWd - 6;
      while (dotX < dotEnd) {
        doc.text(".", dotX, entry.y);
        dotX += 5;
      }

      // Tappable link to the target page
      doc.link(margin, entry.y - rowHeight * 0.55, usableW, rowHeight * 0.85, {
        pageNumber: entry.page,
      });
    }

    drawFooter(currentPage);
    currentPage += 1;
  }

  // ── Puzzle pages ──────────────────────────────────────────────────────────
  puzzles.forEach((puzzleData, idx) => {
    // Without book mode the very first puzzle reuses the document's initial page.
    const reusesInitialPage = !hasIndex && idx === 0;
    if (!reusesInitialPage) {
      doc.addPage([pageW, pageH]);
      currentPage += 1;
    }

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

    drawSudokuGrid(doc, puzzleData, gridX, gridY, gridSize, false);

    drawFooter(currentPage);
  });

  // ── Answer key pages ──────────────────────────────────────────────────────
  const answerGridSize = Math.min(
    usableW / colsPerRow - margin * 0.25,
    usableH / rowsPerPage - margin * 0.25
  );

  for (let pageIdx = 0; pageIdx < totalAnswerPages; pageIdx++) {
    doc.addPage([pageW, pageH]);
    currentPage += 1;

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

      drawSudokuGrid(doc, puzzles[i], gridX, gridY, answerGridSize, true);
    }

    drawFooter(currentPage);
  }

  savePdf(
    doc,
    `sudoku-${sample.size}x${sample.size}-${difficulty}-${puzzles.length}puzzles.pdf`
  );
}

function requestSudokus(
  difficulty: SudokuDifficulty,
  gridSize: SudokuGridSize,
  count: number
) {
  const worker = new Worker(new URL("./sudoku.worker.ts", import.meta.url), {
    type: "module",
  });

  const promise = new Promise<SudokuPuzzle[]>((resolve, reject) => {
    worker.addEventListener("message", (event) => {
      const data = event.data as
        | { puzzles: SudokuPuzzle[] }
        | { error: string };
      worker.terminate();
      if ("error" in data) {
        reject(new Error(data.error));
        return;
      }
      resolve(data.puzzles);
    });
    worker.addEventListener("error", (event) => {
      worker.terminate();
      reject(new Error(event.message || "Sudoku generation failed"));
    });
    worker.postMessage({ difficulty, gridSize, count });
  });

  return { promise, cancel: () => worker.terminate() };
}

// ─── Preview Grid Component ───────────────────────────────────────────────────

function SudokuPreviewGrid({ puzzleData }: { puzzleData: SudokuPuzzle }) {
  const previewSize = 360;
  const size = puzzleData.size;
  const { boxW, boxH } = boxDimensions(size);
  const cellSize = previewSize / size;

  return (
    <svg
      viewBox={`0 0 ${previewSize} ${previewSize}`}
      className="w-full max-w-[360px] h-auto border-2 border-neutral-900 bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Sudoku puzzle preview"
    >
      <rect x="0" y="0" width={previewSize} height={previewSize} fill="white" />

      {Array.from({ length: size + 1 }).map((_, i) => (
        <g key={`line-${i}`}>
          <line
            x1={i * cellSize}
            y1={0}
            x2={i * cellSize}
            y2={previewSize}
            stroke={i % boxW === 0 ? "#111111" : "#d4d4d8"}
            strokeWidth={i % boxW === 0 ? 2.5 : 1}
          />
          <line
            x1={0}
            y1={i * cellSize}
            x2={previewSize}
            y2={i * cellSize}
            stroke={i % boxH === 0 ? "#111111" : "#d4d4d8"}
            strokeWidth={i % boxH === 0 ? 2.5 : 1}
          />
        </g>
      ))}

      {puzzleData.puzzle.map((row, rowIdx) =>
        row.map((val, colIdx) => {
          if (val === 0) return null;
          return (
            <text
              key={`${rowIdx}-${colIdx}`}
              x={colIdx * cellSize + cellSize / 2}
              y={rowIdx * cellSize + cellSize * 0.64}
              textAnchor="middle"
              fontSize={Math.max(11, Math.round(21 * (9 / size)))}
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

export default function SudokuPage({
  initialDifficulty = "medium",
}: {
  initialDifficulty?: SudokuDifficulty;
} = {}) {
  const pathname = usePathname();
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>(initialDifficulty);
  const [gridSize, setGridSize] = useState<SudokuGridSize>(9);
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<SudokuPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generate previews away from the main thread so changing difficulty does
  // not hold up the next mobile paint.
  useEffect(() => {
    const task = requestSudokus(difficulty, gridSize, 1);
    void task.promise
      .then(([puzzle]) => setPreviewPuzzle(puzzle))
      .catch(() => setGenerationError("Could not generate a preview."));
    return task.cancel;
  }, [difficulty, gridSize]);

  const regeneratePreview = () => {
    const task = requestSudokus(difficulty, gridSize, 1);
    setGenerationError(null);
    void task.promise
      .then(([puzzle]) => setPreviewPuzzle(puzzle))
      .catch(() => setGenerationError("Could not generate a preview."));
  };

  const funnelProps = () => ({
    template_slug: pathname,
    template_name: "Sudoku Generator",
    device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
    orientation: "portrait",
    page_count: countPdfPages(numPuzzles, gridSize),
    source_page: pathname,
    game: "sudoku",
    difficulty,
    grid_size: gridSize,
    puzzle_count: numPuzzles,
  });

  const handleDownload = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    captureEvent("template_generator_started", funnelProps());
    try {
      const { promise } = requestSudokus(difficulty, gridSize, numPuzzles);
      const puzzles = await promise;
      await generatePDF(puzzles, difficulty, pageSize);
      captureEvent("template_generated", funnelProps());
      setPreviewPuzzle(puzzles[0]);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not generate the Sudoku PDF. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sudoku Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Generate printable Sudoku puzzles at any difficulty and grid size.
          Multi-puzzle books include a tappable index page and full answer keys.
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
                  {(
                    ["easy", "medium", "hard", "evil"] as SudokuDifficulty[]
                  ).map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIFFICULTY_LABELS[d]} ({cluesForDifficulty(gridSize, d)} clues)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid size */}
            <div className="space-y-2">
              <Label>Grid Size</Label>
              <Select
                value={String(gridSize)}
                onValueChange={(v) => setGridSize(Number(v) as SudokuGridSize)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRID_SIZES.map((g) => (
                    <SelectItem key={g.value} value={String(g.value)}>
                      {g.label} — {g.hint}
                    </SelectItem>
                  ))}
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
                max={12}
                value={[numPuzzles]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setNumPuzzles(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>12</span>
              </div>
              {numPuzzles > 1 && (
                <p className="text-xs text-muted-foreground">
                  Book mode: adds a tappable index page linking every puzzle.
                </p>
              )}
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
                  {Object.entries(PAGE_SIZES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
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
              {isGenerating
                ? "Generating…"
                : `Generate & Download ${numPuzzles === 1 ? "Sudoku PDF" : `${numPuzzles}-Puzzle Book`}`}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Answer keys are included. Your PDF downloads automatically after generation.
            </p>
            {generationError && (
              <p className="mt-2 text-sm text-destructive" role="alert" aria-live="assertive">
                {generationError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="h-fit">
          <CardHeader className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Preview</CardTitle>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={regeneratePreview}>
                Create new preview
              </Button>
            </div>
            <CardDescription>
              {DIFFICULTY_LABELS[difficulty]} · {gridSize} × {gridSize} sample puzzle
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center pt-0 pb-6">
            {previewPuzzle ? (
              <SudokuPreviewGrid puzzleData={previewPuzzle} />
            ) : (
              <div className="flex aspect-square w-full max-w-[360px] items-center justify-center border-2 border-dashed border-border text-muted-foreground text-sm">
                Generating…
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mt-12 border-t border-border pt-8" aria-labelledby="related-games-heading">
        <h2 id="related-games-heading" className="text-xl font-semibold tracking-tight">
          Try another puzzle
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep the logic practice going with another generator.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Crossword", "/games/crossword"],
            ["Nonogram", "/games/nonogram"],
            ["KenKen", "/games/kenken"],
            ["All games", "/games"],
          ].map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-border px-3 py-3 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-muted/40"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
