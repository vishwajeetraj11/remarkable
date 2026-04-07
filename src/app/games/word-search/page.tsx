"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { generateWordSearch, WordSearchPuzzle } from "@/lib/generators/word-search";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageSize = "a4" | "letter" | "remarkable";

const PAGE_DIMENSIONS: Record<PageSize, { w: number; h: number; label: string }> = {
  a4:        { w: 595,    h: 842,    label: "A4" },
  letter:    { w: 612,    h: 792,    label: "Letter" },
  remarkable: { w: 495.72, h: 661.68, label: "reMarkable" },
};

const THEMES = [
  { value: "animals",    label: "Animals"    },
  { value: "food",       label: "Food"       },
  { value: "science",    label: "Science"    },
  { value: "sports",     label: "Sports"     },
  { value: "geography",  label: "Geography"  },
  { value: "technology", label: "Technology" },
];

// ---------------------------------------------------------------------------
// PDF generation (runs client-side)
// ---------------------------------------------------------------------------

async function downloadPDF(
  puzzle: WordSearchPuzzle,
  theme: string,
  pageSize: PageSize
) {
  const { jsPDF } = await import("jspdf");
  const { w, h } = PAGE_DIMENSIONS[pageSize];

  const doc = new jsPDF({ unit: "pt", format: [w, h], orientation: "portrait" });

  const margin = 36;
  const usableW = w - margin * 2;
  const usableH = h - margin * 2;

  // ---------- Page 1: Puzzle ----------
  drawPuzzlePage(doc, puzzle, theme, margin, usableW, usableH, false);

  // ---------- Page 2: Answer Key ----------
  doc.addPage();
  drawPuzzlePage(doc, puzzle, theme, margin, usableW, usableH, true);

  doc.save(`word-search-${theme}.pdf`);
}

function drawPuzzlePage(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  puzzle: WordSearchPuzzle,
  theme: string,
  margin: number,
  usableW: number,
  usableH: number,
  isAnswerKey: boolean
) {
  const { grid, words, size, placements } = puzzle;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  const title = isAnswerKey
    ? `Word Search — ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Answer Key)`
    : `Word Search — ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
  doc.text(title, margin + usableW / 2, margin + 16, { align: "center" });

  // Reserve space for word list at bottom (approx 80pt)
  const wordListH = 80;
  const gridAreaH = usableH - 30 - wordListH; // 30 for title
  const gridAreaY = margin + 30;

  const cellSize = Math.min(usableW / size, gridAreaH / size);
  const gridW = cellSize * size;
  const gridH = cellSize * size;
  const gridX = margin + (usableW - gridW) / 2;
  const gridY = gridAreaY;

  const fontSize = Math.max(5, Math.min(10, cellSize * 0.55));
  doc.setFontSize(fontSize);

  // Draw grid cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;

      // On answer key, highlight solution cells
      if (isAnswerKey) {
        const isHighlighted = placements.some((p) => {
          for (let i = 0; i < p.word.length; i++) {
            if (
              p.row + p.direction.dr * i === r &&
              p.col + p.direction.dc * i === c
            ) {
              return true;
            }
          }
          return false;
        });

        if (isHighlighted) {
          doc.setFillColor(200, 230, 255);
          doc.rect(x, y, cellSize, cellSize, "F");
        }
      }

      // Draw cell border
      doc.setDrawColor(180, 180, 180);
      doc.rect(x, y, cellSize, cellSize, "S");

      // Draw letter
      doc.setFont("courier", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(
        grid[r][c],
        x + cellSize / 2,
        y + cellSize * 0.67,
        { align: "center" }
      );
    }
  }

  // Word list below grid
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
    const wx = margin + col * colW;
    const wy = wordListY + 14 + row * 12;
    doc.text(`• ${word}`, wx, wy);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WordSearchPage() {
  const [theme, setTheme] = useState("animals");
  const [gridSize, setGridSize] = useState(15);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(() => {
    const p = generateWordSearch(theme, gridSize);
    setPuzzle(p);
  }, [theme, gridSize]);

  // Auto-generate on mount and when settings change
  useEffect(() => {
    generate();
  }, [generate]);

  const handleDownload = async () => {
    if (!puzzle) return;
    setIsGenerating(true);
    try {
      await downloadPDF(puzzle, theme, pageSize);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Word Search Generator</h1>
        <p className="mt-1 text-muted-foreground">
          Themed letter grids with answer keys — ready to print or load on your reMarkable.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-6 items-end">
        {/* Theme */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid size */}
        <div className="flex flex-col gap-2 w-52">
          <label className="text-sm font-medium">
            Grid size: <span className="text-muted-foreground">{gridSize} × {gridSize}</span>
          </label>
          <Slider
            min={12}
            max={20}
            value={[gridSize]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setGridSize(val); }}
          />
        </div>

        {/* Page size */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Page size</label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="remarkable">reMarkable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={generate}>
            Regenerate
          </Button>
          <Button onClick={handleDownload} disabled={!puzzle || isGenerating}>
            {isGenerating ? "Generating…" : "Generate & Download PDF"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {puzzle && <WordSearchPreview puzzle={puzzle} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview component
// ---------------------------------------------------------------------------

function WordSearchPreview({ puzzle }: { puzzle: WordSearchPuzzle }) {
  const { grid, words, size } = puzzle;

  // Calculate a font size that keeps the grid readable but not huge
  const cellPx = Math.min(32, Math.floor(600 / size));

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-px border border-border rounded-lg overflow-hidden bg-border"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
          }}
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

      {/* Word list */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Words to find ({words.length})
        </h2>
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
