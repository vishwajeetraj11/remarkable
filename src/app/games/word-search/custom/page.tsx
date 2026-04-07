"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { WordSearchPuzzle, WordPlacement } from "@/lib/generators/word-search";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function validateWords(raw: string): { valid: string[]; errors: string[] } {
  const valid: string[] = [];
  const errors: string[] = [];

  const parts = raw
    .split(",")
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean);

  for (const w of parts) {
    if (!/^[A-Z]+$/.test(w)) {
      errors.push(`"${w}" — letters only`);
    } else if (w.length < 3) {
      errors.push(`"${w}" — too short (min 3)`);
    } else if (w.length > 15) {
      errors.push(`"${w}" — too long (max 15)`);
    } else if (valid.includes(w)) {
      errors.push(`"${w}" — duplicate`);
    } else {
      valid.push(w);
    }
  }

  return { valid, errors };
}

type Direction = { dr: number; dc: number; name: string };

const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1, name: "right" },
  { dr: 0, dc: -1, name: "left" },
  { dr: 1, dc: 0, name: "down" },
  { dr: -1, dc: 0, name: "up" },
  { dr: 1, dc: 1, name: "down-right" },
  { dr: 1, dc: -1, name: "down-left" },
  { dr: -1, dc: 1, name: "up-right" },
  { dr: -1, dc: -1, name: "up-left" },
];

function generateCustomWordSearch(words: string[], size: number): WordSearchPuzzle {
  const clampedSize = Math.max(12, Math.min(20, size));
  const eligible = words.filter((w) => w.length <= clampedSize);
  const grid: string[][] = Array.from({ length: clampedSize }, () =>
    Array(clampedSize).fill("")
  );
  const placements: WordPlacement[] = [];

  for (const word of eligible) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * clampedSize);
      const col = Math.floor(Math.random() * clampedSize);

      if (canPlace(grid, word, row, col, dir, clampedSize)) {
        placeWord(grid, word, row, col, dir);
        placements.push({ word, row, col, direction: dir });
        placed = true;
      }
    }
  }

  for (let r = 0; r < clampedSize; r++) {
    for (let c = 0; c < clampedSize; c++) {
      if (grid[r][c] === "") grid[r][c] = randomLetter();
    }
  }

  return { grid, words: placements.map((p) => p.word), size: clampedSize, placements };
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction,
  size: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction
): void {
  for (let i = 0; i < word.length; i++) {
    grid[row + dir.dr * i][col + dir.dc * i] = word[i];
  }
}

async function downloadPDF(
  puzzle: WordSearchPuzzle,
  title: string,
  pageSize: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const { w, h } = PAGE_SIZES[pageSize];
  const doc = new jsPDF({ unit: "pt", format: [w, h], orientation: "portrait" });
  const margin = 36;
  const usableW = w - margin * 2;
  const usableH = h - margin * 2;

  drawPage(doc, puzzle, title, margin, usableW, usableH, false);
  doc.addPage();
  drawPage(doc, puzzle, title, margin, usableW, usableH, true);

  doc.save(`word-search-custom.pdf`);
}

function drawPage(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  puzzle: WordSearchPuzzle,
  title: string,
  margin: number,
  usableW: number,
  usableH: number,
  isAnswerKey: boolean
) {
  const { grid, words, size, placements } = puzzle;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  const heading = isAnswerKey
    ? `${title || "Word Search"} (Answer Key)`
    : title || "Word Search";
  doc.text(heading, margin + usableW / 2, margin + 16, { align: "center" });

  const wordListH = 80;
  const gridAreaH = usableH - 30 - wordListH;
  const gridAreaY = margin + 30;
  const cellSize = Math.min(usableW / size, gridAreaH / size);
  const gridW = cellSize * size;
  const gridH = cellSize * size;
  const gridX = margin + (usableW - gridW) / 2;
  const gridY = gridAreaY;
  const fontSize = Math.max(5, Math.min(10, cellSize * 0.55));
  doc.setFontSize(fontSize);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;

      if (isAnswerKey) {
        const isHighlighted = placements.some((p) => {
          for (let i = 0; i < p.word.length; i++) {
            if (p.row + p.direction.dr * i === r && p.col + p.direction.dc * i === c) return true;
          }
          return false;
        });
        if (isHighlighted) {
          doc.setFillColor(200, 230, 255);
          doc.rect(x, y, cellSize, cellSize, "F");
        }
      }

      doc.setDrawColor(180, 180, 180);
      doc.rect(x, y, cellSize, cellSize, "S");
      doc.setFont("courier", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(grid[r][c], x + cellSize / 2, y + cellSize * 0.67, { align: "center" });
    }
  }

  const wordListY = gridY + gridH + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("Words to find:", margin, wordListY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const cols = 4;
  const colW = usableW / cols;
  const wordsPerCol = Math.ceil(words.length / cols);
  words.forEach((word, idx) => {
    const col = Math.floor(idx / wordsPerCol);
    const row = idx % wordsPerCol;
    doc.text(`• ${word}`, margin + col * colW, wordListY + 14 + row * 12);
  });
}

export default function CustomWordSearchPage() {
  const [rawWords, setRawWords] = useState("");
  const [title, setTitle] = useState("");
  const [gridSize, setGridSize] = useState(15);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(() => {
    const { valid, errors: errs } = validateWords(rawWords);
    setErrors(errs);
    if (valid.length < 3) {
      if (errs.length === 0) setErrors(["Enter at least 3 valid words."]);
      setPuzzle(null);
      return;
    }
    setPuzzle(generateCustomWordSearch(valid, gridSize));
  }, [rawWords, gridSize]);

  const handleDownload = async () => {
    if (!puzzle) return;
    setIsGenerating(true);
    try {
      await downloadPDF(puzzle, title, pageSize);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/games/word-search"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Word Search
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Custom Word Search</h1>
        <p className="mt-1 text-muted-foreground">
          Create a word search puzzle with your own words. Enter them below, generate, and download as PDF.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Your Words</CardTitle>
            <CardDescription>
              Enter words separated by commas. Letters only, 3–15 characters each.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Puzzle title (optional)</Label>
              <input
                id="title"
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="e.g. Science Vocabulary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="words">Word list</Label>
              <textarea
                id="words"
                rows={5}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none resize-y focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-mono"
                placeholder="ELEPHANT, GIRAFFE, PENGUIN, DOLPHIN, CHEETAH"
                value={rawWords}
                onChange={(e) => setRawWords(e.target.value)}
              />
            </div>

            {errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive space-y-0.5">
                {errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Grid size: <span className="text-muted-foreground">{gridSize} × {gridSize}</span>
                </Label>
                <Slider
                  min={12}
                  max={20}
                  value={[gridSize]}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v;
                    setGridSize(val);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Page size</Label>
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
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
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={generate} variant="outline" className="w-full">
              Generate Puzzle
            </Button>
            <Button onClick={handleDownload} disabled={!puzzle || isGenerating} className="w-full">
              {isGenerating ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      {puzzle && (
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Preview
          </h2>
          <WordSearchPreview puzzle={puzzle} />
        </div>
      )}
    </div>
  );
}

function WordSearchPreview({ puzzle }: { puzzle: WordSearchPuzzle }) {
  const { grid, words, size } = puzzle;
  const cellPx = Math.min(32, Math.floor(600 / size));

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-px border border-border rounded-lg overflow-hidden bg-border"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellPx}px)` }}
        >
          {grid.flat().map((letter, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center bg-background font-mono font-semibold text-foreground"
              style={{ width: cellPx, height: cellPx, fontSize: Math.max(10, cellPx * 0.55) }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Words to find ({words.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <span
              key={word}
              className="px-2.5 py-1 rounded-md bg-muted text-sm font-mono font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
