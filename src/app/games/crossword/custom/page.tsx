"use client";

import { useState, useCallback } from "react";
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
import type { CrosswordPuzzle, CrosswordWord } from "@/lib/generators/crossword";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

interface WordClue {
  word: string;
  clue: string;
}

function parseInput(raw: string): { pairs: WordClue[]; errors: string[] } {
  const pairs: WordClue[] = [];
  const errors: string[] = [];
  const lines = raw.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      errors.push(`"${line.trim().slice(0, 30)}" — missing colon separator`);
      continue;
    }
    const word = line.slice(0, colonIdx).trim().toUpperCase();
    const clue = line.slice(colonIdx + 1).trim();

    if (!word) {
      errors.push(`Empty word on line: "${line.trim().slice(0, 30)}"`);
      continue;
    }
    if (!/^[A-Z]+$/.test(word)) {
      errors.push(`"${word}" — letters only`);
      continue;
    }
    if (word.length < 3 || word.length > 15) {
      errors.push(`"${word}" — must be 3–15 letters`);
      continue;
    }
    if (!clue) {
      errors.push(`"${word}" — clue is empty`);
      continue;
    }
    if (pairs.some((p) => p.word === word)) {
      errors.push(`"${word}" — duplicate`);
      continue;
    }
    pairs.push({ word, clue });
  }

  return { pairs, errors };
}

function makeGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down",
  size: number
): boolean {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  const endRow = row + dr * (word.length - 1);
  const endCol = col + dc * (word.length - 1);
  if (endRow >= size || endCol >= size || row < 0 || col < 0) return false;

  let intersections = 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const cell = grid[r][c];
    if (cell !== null && cell !== word[i]) return false;
    if (cell === word[i]) intersections++;

    if (cell === null) {
      if (i === 0) {
        const prevR = r - dr;
        const prevC = c - dc;
        if (prevR >= 0 && prevC >= 0 && grid[prevR][prevC] !== null) return false;
      }
      if (i === word.length - 1) {
        const nextR = r + dr;
        const nextC = c + dc;
        if (nextR < size && nextC < size && grid[nextR][nextC] !== null) return false;
      }
      const sideR1 = r + dc;
      const sideC1 = c + dr;
      const sideR2 = r - dc;
      const sideC2 = c - dr;
      if (sideR1 >= 0 && sideR1 < size && sideC1 >= 0 && sideC1 < size && grid[sideR1][sideC1] !== null) return false;
      if (sideR2 >= 0 && sideR2 < size && sideC2 >= 0 && sideC2 < size && grid[sideR2][sideC2] !== null) return false;
    }
  }

  return intersections > 0 || grid.every((row) => row.every((cell) => cell === null));
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down"
) {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

function generateCustomCrossword(pairs: WordClue[]): CrosswordPuzzle {
  const size = 15;
  const grid = makeGrid(size);
  const placedWords: CrosswordWord[] = [];
  const shuffled = [...pairs].sort(() => Math.random() - 0.5);

  for (const entry of shuffled) {
    const word = entry.word;

    if (placedWords.length === 0) {
      const row = Math.floor(size / 2);
      const col = Math.floor((size - word.length) / 2);
      if (canPlace(grid, word, row, col, "across", size)) {
        placeWord(grid, word, row, col, "across");
        placedWords.push({ word, clue: entry.clue, row, col, direction: "across", number: 1 });
      }
    } else {
      const placements: { row: number; col: number; direction: "across" | "down" }[] = [];
      for (const direction of ["across", "down"] as const) {
        const dr = direction === "down" ? 1 : 0;
        const dc = direction === "across" ? 1 : 0;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (grid[r][c] !== null) {
              for (let i = 0; i < word.length; i++) {
                if (word[i] === grid[r][c]) {
                  const startR = r - dr * i;
                  const startC = c - dc * i;
                  if (canPlace(grid, word, startR, startC, direction, size)) {
                    placements.push({ row: startR, col: startC, direction });
                  }
                }
              }
            }
          }
        }
      }
      if (placements.length > 0) {
        const chosen = placements[Math.floor(Math.random() * placements.length)];
        placeWord(grid, word, chosen.row, chosen.col, chosen.direction);
        placedWords.push({ word, clue: entry.clue, row: chosen.row, col: chosen.col, direction: chosen.direction, number: 0 });
      }
    }

    if (placedWords.length >= 14) break;
  }

  const sorted = [...placedWords].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );
  sorted.forEach((w, i) => { w.number = i + 1; });

  return { grid, words: sorted, size };
}

const CELL_PX = 28;

function getCellNumber(words: CrosswordWord[], row: number, col: number): number | null {
  for (const w of words) {
    if (w.row === row && w.col === col) return w.number;
  }
  return null;
}

async function downloadPDF(puzzle: CrosswordPuzzle, pageSizeKey: PageSizeKey) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h] });
  const margin = 36;
  const cellSize = Math.min(20, (ps.w - margin * 2) / puzzle.size);
  const gridWidth = cellSize * puzzle.size;
  const gridHeight = cellSize * puzzle.size;
  const gridX = (ps.w - gridWidth) / 2;

  const drawPage = (filled: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Custom Crossword", ps.w / 2, margin, { align: "center" });

    const startY = margin + 24;
    const { grid, words } = puzzle;

    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const x = gridX + c * cellSize;
        const y = startY + r * cellSize;
        const cell = grid[r][c];

        if (cell === null) {
          doc.setFillColor(30, 30, 30);
          doc.rect(x, y, cellSize, cellSize, "F");
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(0.5);
          doc.rect(x, y, cellSize, cellSize, "FD");

          if (filled) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(cellSize * 0.5);
            doc.setTextColor(0, 0, 0);
            doc.text(cell, x + cellSize / 2, y + cellSize * 0.72, { align: "center" });
          }

          const num = words.find((w) => w.row === r && w.col === c)?.number;
          if (num !== undefined) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(cellSize * 0.28);
            doc.setTextColor(0, 0, 0);
            doc.text(String(num), x + 1.5, y + cellSize * 0.3);
          }
        }
      }
    }

    const clueStartY = startY + gridHeight + 20;
    const acrossWords = words.filter((w) => w.direction === "across");
    const downWords = words.filter((w) => w.direction === "down");
    const colWidth = (ps.w - margin * 2) / 2 - 8;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ACROSS", margin, clueStartY);
    doc.text("DOWN", margin + colWidth + 16, clueStartY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    let acrossY = clueStartY + 12;
    for (const w of acrossWords) {
      const line = `${w.number}. ${w.clue}`;
      const lines = doc.splitTextToSize(line, colWidth);
      doc.text(lines, margin, acrossY);
      acrossY += lines.length * 9;
    }

    let downY = clueStartY + 12;
    for (const w of downWords) {
      const line = `${w.number}. ${w.clue}`;
      const lines = doc.splitTextToSize(line, colWidth);
      doc.text(lines, margin + colWidth + 16, downY);
      downY += lines.length * 9;
    }
  };

  drawPage(false);
  doc.addPage();
  drawPage(true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("— Answer Key —", ps.w / 2, margin - 12, { align: "center" });

  doc.save("crossword-custom.pdf");
}

export default function CustomCrosswordPage() {
  const [rawInput, setRawInput] = useState("");
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    const { pairs, errors: errs } = parseInput(rawInput);
    setErrors(errs);
    if (pairs.length < 3) {
      if (errs.length === 0) setErrors(["Enter at least 3 word-clue pairs."]);
      setPuzzle(null);
      return;
    }
    setPuzzle(generateCustomCrossword(pairs));
  }, [rawInput]);

  const handleDownload = useCallback(async () => {
    if (!puzzle) return;
    setGenerating(true);
    try {
      await downloadPDF(puzzle, pageSize);
    } finally {
      setGenerating(false);
    }
  }, [puzzle, pageSize]);

  const placedCount = puzzle?.words.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/games/crossword"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Crossword
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Custom Crossword</h1>
        <p className="mt-1 text-muted-foreground">
          Create a crossword puzzle with your own words and clues.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Words & Clues</CardTitle>
            <CardDescription>
              One pair per line in the format: WORD: clue text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              rows={10}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none resize-y focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-mono"
              placeholder={`PLANET: A celestial body orbiting a star\nROCKET: Vehicle used for space travel\nORBIT: Path around a celestial body\nMOON: Natural satellite of a planet\nSTAR: Ball of gas that emits light\nCOMET: Icy body with a tail`}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />

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
            <Button onClick={handleGenerate} variant="outline" className="w-full">
              Generate Crossword
            </Button>
            <Button onClick={handleDownload} disabled={!puzzle || generating} className="w-full">
              {generating ? "Generating…" : "Download PDF"}
            </Button>
          </div>

          {puzzle && (
            <p className="text-xs text-muted-foreground text-center">
              {placedCount} word{placedCount !== 1 ? "s" : ""} placed in grid
            </p>
          )}
        </div>
      </div>

      {puzzle && (
        <div className="mt-8 border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Preview
          </h2>
          <CrosswordPreview puzzle={puzzle} />
        </div>
      )}
    </div>
  );
}

function CrosswordPreview({ puzzle }: { puzzle: CrosswordPuzzle }) {
  const { grid, words, size } = puzzle;
  const acrossWords = words.filter((w) => w.direction === "across");
  const downWords = words.filter((w) => w.direction === "down");

  return (
    <div className="space-y-6">
      <div className="overflow-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, ${CELL_PX}px)`,
            gap: 1,
            backgroundColor: "#888",
            border: "1px solid #888",
            width: "fit-content",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const num = getCellNumber(words, r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: CELL_PX,
                    height: CELL_PX,
                    backgroundColor: cell === null ? "#222" : "#fff",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {num !== null && (
                    <span
                      style={{
                        position: "absolute",
                        top: 1,
                        left: 2,
                        fontSize: 7,
                        lineHeight: 1,
                        color: "#222",
                        fontWeight: 600,
                        pointerEvents: "none",
                      }}
                    >
                      {num}
                    </span>
                  )}
                  {cell !== null && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#666",
                        userSelect: "none",
                      }}
                    >
                      {cell}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-sm mb-2">Across</h3>
          <ol className="space-y-1">
            {acrossWords.map((w) => (
              <li key={`across-${w.number}`} className="text-sm">
                <span className="font-medium">{w.number}.</span> {w.clue}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-2">Down</h3>
          <ol className="space-y-1">
            {downWords.map((w) => (
              <li key={`down-${w.number}`} className="text-sm">
                <span className="font-medium">{w.number}.</span> {w.clue}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
