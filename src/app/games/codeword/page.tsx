"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { savePdf } from "@/lib/download-tracker";
import { captureEvent, normalizeTemplateDevice } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  generateCodeword,
  type CodewordPuzzle,
} from "@/lib/generators/codeword";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "codeword";

const THEMES = [
  { value: "general", label: "General" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "nature", label: "Nature" },
];

const GRID_SIZES = [
  { value: 11, label: "11 × 11 — Quick" },
  { value: 13, label: "13 × 13 — Standard" },
  { value: 15, label: "15 × 15 — Full size" },
];

// Map page-size keys to the device vocabulary used by funnel events.
const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

// ---------------------------------------------------------------------------
// PDF generation (runs client-side)
// ---------------------------------------------------------------------------

function drawCodewordGrid(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  puzzle: CodewordPuzzle,
  x: number,
  y: number,
  gridPx: number,
  answerKey: boolean
) {
  const size = puzzle.size;
  const cell = gridPx / size;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  for (let r = 0; r <= size; r++) {
    doc.line(x, y + r * cell, x + gridPx, y + r * cell);
    doc.line(x + r * cell, y, x + r * cell, y + gridPx);
  }

  // Blocked cells.
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (puzzle.grid[r][c] === 0) {
        doc.setFillColor(30, 30, 30);
        doc.rect(x + c * cell, y + r * cell, cell, cell, "F");
      }
    }
  }

  const revealedByCell = new Map<string, string>();
  for (const rev of puzzle.revealed) {
    revealedByCell.set(`${rev.row},${rev.col}`, rev.letter);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const num = puzzle.grid[r][c];
      if (num === 0) continue;
      const cx = x + c * cell;
      const cy = y + r * cell;
      const letter = puzzle.code[num];

      if (answerKey) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(Math.max(8, cell * 0.42));
        doc.setTextColor(20, 20, 20);
        doc.text(letter, cx + cell / 2, cy + cell * 0.62, { align: "center" });
      } else {
        // Big code number; a given starter letter sits underneath it.
        const starter = revealedByCell.get(`${r},${c}`);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(starter ? Math.max(8, cell * 0.38) : Math.max(9, cell * 0.46));
        doc.setTextColor(0, 0, 0);
        if (starter) {
          doc.text(String(num), cx + cell / 2, cy + cell * 0.45, {
            align: "center",
          });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(Math.max(6, cell * 0.26));
          doc.setTextColor(90, 90, 90);
          doc.text(starter, cx + cell / 2, cy + cell * 0.78, {
            align: "center",
          });
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text(String(num), cx + cell / 2, cy + cell * 0.64, {
            align: "center",
          });
        }
      }
    }
  }
}

async function downloadPDF(
  puzzles: CodewordPuzzle[],
  themeLabel: string,
  pageSizeKey: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;
  const usableH = ps.h - margin * 2 - 40;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawPageFrame = (
    puzzle: CodewordPuzzle,
    index: number,
    answerKey: boolean
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Codeword${puzzles.length > 1 ? ` ${index + 1}` : ""}${answerKey ? " — Answers" : ""}`,
      ps.w / 2,
      margin + 12,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Theme: ${themeLabel} · Every letter has its own number (1-26)`, ps.w / 2, margin + 28, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);

    const gridPx = Math.min(usableW, usableH);
    const gx = margin + (usableW - gridPx) / 2;
    drawCodewordGrid(doc, puzzle, gx, margin + 44, gridPx, answerKey);

    if (!answerKey) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Three starting letters are filled in. Each number always stands for the same letter.",
        ps.w / 2,
        margin + 52 + gridPx,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }
  };

  puzzles.forEach((_, i) => {
    if (i > 0) doc.addPage();
    drawPageFrame(puzzles[i], i, false);
  });
  puzzles.forEach((_, i) => {
    doc.addPage();
    drawPageFrame(puzzles[i], i, true);
  });

  savePdf(doc, `codeword-${PUZZLE_KEY}-${puzzles.length}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: puzzles.length,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CodewordPage() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("general");
  const [gridSize, setGridSize] = useState(15);
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<CodewordPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generateOne = useCallback(
    () => generateCodeword(theme, gridSize),
    [theme, gridSize]
  );

  const generatePreview = useCallback(() => {
    try {
      setGenerationError(null);
      setPreview(generateOne());
    } catch {
      setGenerationError("Could not generate a preview.");
    }
  }, [generateOne]);

  // Generate away from the synchronous effect body so setting changes never
  // cascade renders.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) generatePreview();
    });
    return () => {
      cancelled = true;
    };
  }, [generatePreview]);

  const funnelProps = () => ({
    template_slug: pathname,
    template_name: "Codeword Generator",
    device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
    orientation: "portrait" as const,
    page_count: numPuzzles * 2,
    source_page: pathname,
    puzzle_key: PUZZLE_KEY,
    theme,
    grid_size: gridSize,
    count: numPuzzles,
  });

  const handleDownload = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    captureEvent("template_generator_started", funnelProps());
    try {
      const puzzles = Array.from({ length: numPuzzles }, () => generateOne());
      await downloadPDF(puzzles, THEMES.find((t) => t.value === theme)?.label ?? theme, pageSize);
      captureEvent("template_generated", funnelProps());
      setPreview(puzzles[0]);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not generate the codeword PDF. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Codeword Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Crack the letter-number code to complete crossword-style grids.
          Printable puzzles with answer keys for reMarkable, e-ink, and paper.
        </p>
        <Link
          href="/games/crossword"
          className="inline-block mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Prefer regular clues? Try the Crossword Generator →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your puzzle before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full">
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

            <div className="space-y-2">
              <Label>Grid Size</Label>
              <Select
                value={String(gridSize)}
                onValueChange={(v) => setGridSize(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRID_SIZES.map((g) => (
                    <SelectItem key={g.value} value={String(g.value)}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Puzzles per download</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{numPuzzles}</span>
              </div>
              <Slider
                min={1}
                max={6}
                step={1}
                value={[numPuzzles]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setNumPuzzles(val);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Page size</Label>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
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

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={generatePreview}>
                Create new preview
              </Button>
              <Button onClick={handleDownload} disabled={!preview || isGenerating}>
                {isGenerating ? "Generating…" : "Generate & Download PDF"}
              </Button>
            </div>

            {generationError && (
              <p className="text-sm text-destructive">{generationError}</p>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <CodewordPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview component
// ---------------------------------------------------------------------------

function CodewordPreview({ puzzle }: { puzzle: CodewordPuzzle }) {
  const size = puzzle.size;
  const cellPx = Math.min(30, Math.floor(420 / size));
  const revealedByCell = new Map<string, string>();
  for (const rev of puzzle.revealed) {
    revealedByCell.set(`${rev.row},${rev.col}`, rev.letter);
  }
  const filled = puzzle.grid.flat().filter((v) => v > 0).length;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-px border border-border rounded-lg overflow-hidden bg-border"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellPx}px)` }}
        >
          {puzzle.grid.flat().map((num, idx) => {
            if (num === 0) {
              return <div key={idx} className="bg-neutral-900" style={{ width: cellPx, height: cellPx }} />;
            }
            const r = Math.floor(idx / size);
            const c = idx % size;
            const starter = revealedByCell.get(`${r},${c}`);
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-background leading-none"
                style={{ width: cellPx, height: cellPx }}
              >
                <span
                  className="font-mono font-semibold text-foreground"
                  style={{ fontSize: Math.max(10, cellPx * (starter ? 0.34 : 0.42)) }}
                >
                  {num}
                </span>
                {starter && (
                  <span
                    className="font-mono font-bold text-primary"
                    style={{ fontSize: Math.max(8, cellPx * 0.32) }}
                  >
                    {starter}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {filled} letters to decode · numbers stay in the
        downloaded file even when the preview regenerates.
      </p>
    </div>
  );
}
