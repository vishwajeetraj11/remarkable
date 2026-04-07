"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateCrossword, CrosswordPuzzle } from "@/lib/generators/crossword";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const CELL_PX = 28;

function getCellNumber(
  words: CrosswordPuzzle["words"],
  row: number,
  col: number
): number | null {
  for (const w of words) {
    if (w.row === row && w.col === col) return w.number;
  }
  return null;
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

async function downloadPDF(puzzle: CrosswordPuzzle, pageSizeKey: PageSizeKey) {
  const ps = PAGE_SIZES[pageSizeKey];
  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h] });

  const margin = 36;
  const cellSize = Math.min(20, (ps.w - margin * 2) / puzzle.size);
  const gridWidth = cellSize * puzzle.size;
  const gridHeight = cellSize * puzzle.size;
  const gridX = (ps.w - gridWidth) / 2;

  const drawPage = (filled: boolean) => {
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Crossword Puzzle", ps.w / 2, margin, { align: "center" });

    // Grid
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

          // Cell number
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

    // Clues
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

  // Page 1: blank puzzle
  drawPage(false);

  // Page 2: answer key
  doc.addPage();
  drawPage(true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("— Answer Key —", ps.w / 2, margin - 12, { align: "center" });

  doc.save("crossword.pdf");
}

export default function CrosswordPage() {
  const [theme, setTheme] = useState("general");
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      setPuzzle(generateCrossword(theme));
      setGenerating(false);
    }, 0);
  }, [theme]);

  const handleDownload = useCallback(async () => {
    if (!puzzle) return;
    await downloadPDF(puzzle, pageSize);
  }, [puzzle, pageSize]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crossword Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Generate a themed crossword puzzle with clues and a printable answer key.
        </p>
        <Link
          href="/games/crossword/custom"
          className="inline-block mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Or create with your own words & clues →
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="nature">Nature</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Page Size</label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">{PAGE_SIZES.A4.label}</SelectItem>
              <SelectItem value="Letter">{PAGE_SIZES.Letter.label}</SelectItem>
              <SelectItem value="eInk">{PAGE_SIZES.eInk.label}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate"}
        </Button>

        {puzzle && (
          <Button variant="outline" onClick={handleDownload}>
            Download PDF
          </Button>
        )}
      </div>

      {puzzle && (
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Preview
          </h2>
          <CrosswordPreview puzzle={puzzle} />
        </div>
      )}

      {!puzzle && (
        <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground text-sm">
          Click Generate to create a crossword puzzle.
        </div>
      )}
    </div>
  );
}
