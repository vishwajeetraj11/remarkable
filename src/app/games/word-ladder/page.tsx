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
  generateWordLadder,
  Difficulty,
  WordLength,
  WordLadderPuzzle,
} from "@/lib/generators/word-ladder";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy (3–4 steps)",
  medium: "Medium (5–6 steps)",
  hard: "Hard (7+ steps)",
};

// ─── PDF Generation ───────────────────────────────────────────────────────────

function drawLadderPuzzle(
  doc: jsPDF,
  puzzle: WordLadderPuzzle,
  puzzleIndex: number,
  totalPuzzles: number,
  originX: number,
  originY: number,
  width: number,
  maxHeight: number,
  isAnswerKey: boolean
) {
  const stepCount = puzzle.steps.length;
  const letterCount = puzzle.wordLength;

  const cellSize = Math.min(
    width / (letterCount + 2),
    maxHeight / (stepCount + 2),
    28
  );
  const gridWidth = cellSize * letterCount;
  const startX = originX + (width - gridWidth) / 2;

  const headerFontSize = Math.min(12, cellSize * 0.5);
  const cellFontSize = Math.min(16, cellSize * 0.6);
  const lineSpacing = cellSize * 1.3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(headerFontSize);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Puzzle ${puzzleIndex + 1} of ${totalPuzzles}`,
    originX + width / 2,
    originY,
    { align: "center" }
  );

  let currentY = originY + headerFontSize + 8;

  for (let step = 0; step < stepCount; step++) {
    const word = puzzle.steps[step];
    const isStartOrEnd = step === 0 || step === stepCount - 1;
    const showWord = isStartOrEnd || isAnswerKey;

    for (let i = 0; i < letterCount; i++) {
      const cx = startX + i * cellSize;
      const cy = currentY;

      if (isStartOrEnd) {
        doc.setFillColor(35, 35, 35);
        doc.setDrawColor(35, 35, 35);
        doc.roundedRect(cx, cy, cellSize - 2, cellSize - 2, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(cellFontSize);
        doc.setTextColor(255, 255, 255);
        doc.text(
          word[i],
          cx + (cellSize - 2) / 2,
          cy + (cellSize - 2) * 0.68,
          { align: "center" }
        );
      } else if (isAnswerKey) {
        doc.setFillColor(245, 245, 245);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.roundedRect(cx, cy, cellSize - 2, cellSize - 2, 2, 2, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(cellFontSize * 0.85);
        doc.setTextColor(80, 80, 80);
        doc.text(
          word[i],
          cx + (cellSize - 2) / 2,
          cy + (cellSize - 2) * 0.68,
          { align: "center" }
        );
      } else {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cx, cy, cellSize - 2, cellSize - 2, 2, 2, "FD");
      }
    }

    if (!isStartOrEnd && !showWord) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Step ${step}`,
        startX - 6,
        currentY + (cellSize - 2) / 2 + 3,
        { align: "right" }
      );
    }

    if (step < stepCount - 1) {
      const arrowX = originX + width / 2;
      const arrowY = currentY + cellSize;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.6);
      doc.line(arrowX, arrowY, arrowX, arrowY + lineSpacing - cellSize - 2);
      const tipY = arrowY + lineSpacing - cellSize - 2;
      doc.line(arrowX - 3, tipY - 3, arrowX, tipY);
      doc.line(arrowX + 3, tipY - 3, arrowX, tipY);
    }

    currentY += lineSpacing;
  }
}

function generatePDF(
  puzzles: WordLadderPuzzle[],
  difficulty: Difficulty,
  pageSize: PageSizeKey
) {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];
  const margin = pageW * 0.08;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  const maxSteps = Math.max(...puzzles.map((p) => p.steps.length));
  const puzzlesPerPage = maxSteps <= 5 ? 2 : 1;

  for (let i = 0; i < puzzles.length; i += puzzlesPerPage) {
    if (i > 0) doc.addPage([pageW, pageH]);

    const headerY = margin * 0.6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Word Ladder", pageW / 2, headerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Change one letter at a time. Each step must be a valid word.",
      pageW / 2,
      headerY + 14,
      { align: "center" }
    );

    const batch = puzzles.slice(i, i + puzzlesPerPage);
    const colWidth = usableW / batch.length;
    const contentStartY = margin + 10;
    const availableHeight = usableH - 10;

    batch.forEach((puzzle, colIdx) => {
      const ox = margin + colIdx * colWidth;
      drawLadderPuzzle(
        doc,
        puzzle,
        i + colIdx,
        puzzles.length,
        ox,
        contentStartY,
        colWidth,
        availableHeight,
        false
      );
    });
  }

  // ── Answer key pages ──────────────────────────────────────────────────────

  const answersPerPage = 4;
  const totalAnswerPages = Math.ceil(puzzles.length / answersPerPage);

  for (let pageIdx = 0; pageIdx < totalAnswerPages; pageIdx++) {
    doc.addPage([pageW, pageH]);

    const headerY = margin * 0.55;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Keys", pageW / 2, headerY, { align: "center" });

    const startPuzzle = pageIdx * answersPerPage;
    const endPuzzle = Math.min(startPuzzle + answersPerPage, puzzles.length);
    const batch = puzzles.slice(startPuzzle, endPuzzle);

    const cols = Math.min(batch.length, 2);
    const rows = Math.ceil(batch.length / cols);
    const colW = usableW / cols;
    const rowH = (usableH - 10) / rows;

    batch.forEach((puzzle, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const ox = margin + col * colW;
      const oy = margin + 10 + row * rowH;

      drawLadderPuzzle(
        doc,
        puzzle,
        startPuzzle + idx,
        puzzles.length,
        ox,
        oy,
        colW,
        rowH - 10,
        true
      );
    });
  }

  doc.save(
    `word-ladder-${difficulty}-${puzzles.length}puzzles.pdf`
  );
}

// ─── Preview Component ───────────────────────────────────────────────────────

function LadderPreview({ puzzle }: { puzzle: WordLadderPuzzle }) {
  const cellSize = 42;
  const gap = 14;
  const letterCount = puzzle.wordLength;
  const stepCount = puzzle.steps.length;
  const gridWidth = cellSize * letterCount;
  const totalWidth = gridWidth + 40;
  const rowHeight = cellSize + gap;
  const totalHeight = stepCount * rowHeight + 20;
  const startX = (totalWidth - gridWidth) / 2;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="w-full max-w-[320px] h-auto"
      role="img"
      aria-label="Word ladder preview"
    >
      {puzzle.steps.map((word, step) => {
        const y = 10 + step * rowHeight;
        const isStartOrEnd = step === 0 || step === stepCount - 1;

        return (
          <g key={step}>
            {Array.from({ length: letterCount }).map((_, i) => {
              const x = startX + i * cellSize;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize - 3}
                    height={cellSize - 3}
                    rx={4}
                    ry={4}
                    fill={isStartOrEnd ? "#1a1a1a" : "white"}
                    stroke={isStartOrEnd ? "#1a1a1a" : "#d4d4d8"}
                    strokeWidth={1.5}
                  />
                  {isStartOrEnd && (
                    <text
                      x={x + (cellSize - 3) / 2}
                      y={y + (cellSize - 3) * 0.68}
                      textAnchor="middle"
                      fontSize={20}
                      fontWeight={700}
                      fill="white"
                      fontFamily="ui-monospace, monospace"
                    >
                      {word[i]}
                    </text>
                  )}
                </g>
              );
            })}

            {step < stepCount - 1 && (
              <g>
                <line
                  x1={totalWidth / 2}
                  y1={y + cellSize - 1}
                  x2={totalWidth / 2}
                  y2={y + cellSize + gap - 5}
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                />
                <polygon
                  points={`${totalWidth / 2 - 4},${y + cellSize + gap - 8} ${totalWidth / 2 + 4},${y + cellSize + gap - 8} ${totalWidth / 2},${y + cellSize + gap - 3}`}
                  fill="#a1a1aa"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WordLadderPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [wordLength, setWordLength] = useState<WordLength>(4);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [previewPuzzle, setPreviewPuzzle] = useState<WordLadderPuzzle | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    const puzzle = generateWordLadder(difficulty, wordLength);
    setPreviewPuzzle(puzzle);
  }, [difficulty, wordLength]);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzles: WordLadderPuzzle[] = Array.from(
          { length: numPuzzles },
          () => generateWordLadder(difficulty, wordLength)
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
          Word Ladder Generator
        </h1>
        <p className="mt-2 text-muted-foreground">
          Transform one word into another by changing a single letter at each
          step. Every intermediate word must be valid. Each PDF includes answer
          keys.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your puzzles before downloading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as Difficulty)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (3–4 steps)</SelectItem>
                  <SelectItem value="medium">Medium (5–6 steps)</SelectItem>
                  <SelectItem value="hard">Hard (7+ steps)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Word Length */}
            <div className="space-y-2">
              <Label>Word Length</Label>
              <Select
                value={String(wordLength)}
                onValueChange={(v) => setWordLength(Number(v) as WordLength)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Letters</SelectItem>
                  <SelectItem value="4">4 Letters</SelectItem>
                  <SelectItem value="5">5 Letters</SelectItem>
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
                max={10}
                value={[numPuzzles]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setNumPuzzles(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
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
              {DIFFICULTY_LABELS[difficulty]} · {wordLength}-letter words
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center pt-0 pb-6">
            {previewPuzzle ? (
              <LadderPreview puzzle={previewPuzzle} />
            ) : (
              <div className="flex aspect-3/4 w-full max-w-[320px] items-center justify-center border-2 border-dashed border-border text-muted-foreground text-sm">
                Generating…
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
