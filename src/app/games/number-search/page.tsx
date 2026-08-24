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
  generateNumberSearch,
  type NumberSearchPuzzle,
} from "@/lib/generators/number-search";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "number-search";

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

async function downloadPDF(
  puzzle: NumberSearchPuzzle,
  pageSizeKey: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;
  const usableH = ps.h - margin * 2;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawPage = (answerKey: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Number Search${answerKey ? " — Answer Key" : ""}`,
      ps.w / 2,
      margin + 16,
      { align: "center" }
    );

    // Reserve space for the sequence list at the bottom.
    const listRows = Math.ceil(puzzle.targets.length / 5);
    const listH = 34 + listRows * 14;
    const gridAreaH = usableH - 30 - listH;
    const size = puzzle.size;
    const cellSize = Math.min(usableW / size, gridAreaH / size);
    const gridW = cellSize * size;
    const gridX = margin + (usableW - gridW) / 2;
    const gridY = margin + 32;

    const highlighted = new Set<string>();
    if (answerKey) {
      for (const p of puzzle.placements) {
        for (let i = 0; i < p.target.length; i++) {
          highlighted.add(`${p.row},${p.col + i}`);
        }
      }
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const x = gridX + c * cellSize;
        const y = gridY + r * cellSize;

        if (highlighted.has(`${r},${c}`)) {
          doc.setFillColor(255, 230, 180);
          doc.rect(x, y, cellSize, cellSize, "F");
        }

        doc.setDrawColor(180, 180, 180);
        doc.rect(x, y, cellSize, cellSize, "S");

        doc.setFont("courier", "bold");
        doc.setFontSize(Math.max(6, Math.min(10, cellSize * 0.55)));
        doc.setTextColor(0, 0, 0);
        doc.text(puzzle.grid[r][c], x + cellSize / 2, y + cellSize * 0.67, {
          align: "center",
        });
      }
    }

    // Sequence list below the grid.
    const listY = gridY + cellSize * size + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(
      answerKey ? `Sequences found (${puzzle.targets.length}):` : `Find these ${puzzle.targets.length} sequences:`,
      margin,
      listY
    );
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    if (answerKey) {
      doc.setTextColor(40, 40, 180);
    }
    const perCol = 5;
    const colW = usableW / perCol;
    puzzle.targets.forEach((t, idx) => {
      const col = Math.floor(idx / Math.ceil(puzzle.targets.length / perCol));
      const row = idx % Math.ceil(puzzle.targets.length / perCol);
      doc.text(t, margin + col * colW + 8, listY + 16 + row * 14);
    });
    doc.setTextColor(0, 0, 0);
  };

  drawPage(false);
  doc.addPage();
  drawPage(true);

  savePdf(doc, `${PUZZLE_KEY}-${puzzle.size}x${puzzle.size}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: puzzle.targets.length,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NumberSearchPage() {
  const pathname = usePathname();
  const [gridSize, setGridSize] = useState(14);
  const [seqCount, setSeqCount] = useState(10);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [puzzle, setPuzzle] = useState<NumberSearchPuzzle | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generate = useCallback(() => {
    return generateNumberSearch(gridSize, seqCount);
  }, [gridSize, seqCount]);

  // Generate away from the synchronous effect body so setting changes never
  // cascade renders.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        setGenerationError(null);
        setPuzzle(generate());
      } catch {
        setGenerationError(
          "Could not fit that many sequences in this grid. Try a larger grid or fewer sequences."
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [generate]);

  const handleDownload = async () => {
    if (!puzzle) return;
    captureEvent("template_generator_started", funnelProps());
    await downloadPDF(puzzle, pageSize);
    captureEvent("template_generated", funnelProps());
  };

  const regenerate = () => {
    try {
      setGenerationError(null);
      setPuzzle(generate());
    } catch {
      setGenerationError(
        "Could not fit that many sequences in this grid. Try a larger grid or fewer sequences."
      );
    }
  };

  const funnelProps = () => ({
    template_slug: pathname,
    template_name: "Number Search Generator",
    device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
    orientation: "portrait" as const,
    source_page: pathname,
    puzzle_key: PUZZLE_KEY,
    grid_size: gridSize,
    count: seqCount,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Number Search Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Hidden number sequences in a grid of digits — every sequence appears
          exactly once. Printable PDFs with answer keys for reMarkable and paper.
        </p>
        <Link
          href="/games/word-search"
          className="inline-block mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Looking for words instead? Try the Word Search Generator →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your puzzle before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Grid size</Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {gridSize} × {gridSize}
                </span>
              </div>
              <Slider
                min={12}
                max={18}
                step={1}
                value={[gridSize]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setGridSize(val);
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sequences</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{seqCount}</span>
              </div>
              <Slider
                min={5}
                max={15}
                step={1}
                value={[seqCount]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setSeqCount(val);
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
              <Button variant="outline" onClick={regenerate}>
                Create new preview
              </Button>
              <Button onClick={handleDownload} disabled={!puzzle}>
                Generate & Download PDF
              </Button>
            </div>

            {generationError && (
              <p className="text-sm text-destructive">{generationError}</p>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {puzzle && <NumberSearchPreview puzzle={puzzle} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview component
// ---------------------------------------------------------------------------

function NumberSearchPreview({ puzzle }: { puzzle: NumberSearchPuzzle }) {
  const size = puzzle.size;
  const cellPx = Math.min(30, Math.floor(480 / size));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-px border border-border rounded-lg overflow-hidden bg-border"
          style={{ gridTemplateColumns: `repeat(${size}, ${cellPx}px)` }}
        >
          {puzzle.grid.flat().map((digit, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center bg-background font-mono font-semibold text-foreground"
              style={{ width: cellPx, height: cellPx, fontSize: Math.max(10, cellPx * 0.55) }}
            >
              {digit}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Sequences to find ({puzzle.targets.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {puzzle.targets.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-md bg-muted font-mono font-medium"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Each sequence hides exactly once, reading left to right. The PDF
          answer key highlights every placement.
        </p>
      </div>
    </div>
  );
}
