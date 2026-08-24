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
import type { KillerSudokuPuzzle } from "@/lib/generators/killer-sudoku";
import type { SudokuDifficulty } from "@/lib/generators/sudoku";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "killer-sudoku";

const DIFFICULTY_LABELS: Record<SudokuDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  evil: "Evil",
};

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

function requestKillers(difficulty: SudokuDifficulty, count: number) {
  const worker = new Worker(new URL("./killer-sudoku.worker.ts", import.meta.url), {
    type: "module",
  });

  const promise = new Promise<KillerSudokuPuzzle[]>((resolve, reject) => {
    worker.addEventListener("message", (event) => {
      const data = event.data as
        | { puzzles: KillerSudokuPuzzle[] }
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
      reject(new Error(event.message || "Killer sudoku generation failed"));
    });
    worker.postMessage({ difficulty, count });
  });

  return { promise, cancel: () => worker.terminate() };
}

// ─── Cage geometry helpers ────────────────────────────────────────────────────

/** cageIndex[r][c] plus the set of internal edges (shared edges inside a cage). */
function cageMap(puzzle: KillerSudokuPuzzle) {
  const index: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  puzzle.cages.forEach((cage, ci) =>
    cage.cells.forEach(([r, c]) => {
      index[r][c] = ci;
    })
  );
  const sumAt = new Map<string, number>();
  for (const cage of puzzle.cages) {
    const [r, c] = cage.cells[0];
    sumAt.set(`${r},${c}`, cage.sum);
  }
  return { index, sumAt };
}

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(
  puzzles: KillerSudokuPuzzle[],
  difficulty: SudokuDifficulty,
  pageSizeKey: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawGrid = (
    puzzle: KillerSudokuPuzzle,
    answerKey: boolean,
    index: number
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Killer Sudoku${puzzles.length > 1 ? ` ${index + 1}` : ""}${answerKey ? " — Solution" : ""}`,
      ps.w / 2,
      margin + 14,
      { align: "center" }
    );
    if (!answerKey) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        `Difficulty: ${DIFFICULTY_LABELS[difficulty]} · The number in each cage corner is the sum of its cells; digits never repeat within a cage.`,
        ps.w / 2,
        margin + 28,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    const top = margin + 40;
    const gridPx = Math.min(usableW, ps.h - top - margin - 24);
    const cell = gridPx / 9;
    const gx = margin + (usableW - gridPx) / 2;
    const { index: cageIdx, sumAt } = cageMap(puzzle);

    // Thin lattice.
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.5);
    for (let i = 0; i <= 9; i++) {
      doc.line(gx, top + i * cell, gx + gridPx, top + i * cell);
      doc.line(gx + i * cell, top, gx + i * cell, top + gridPx);
    }
    // Outer border + box separators.
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(gx, top, gridPx, gridPx);
    for (let i = 3; i < 9; i += 3) {
      doc.line(gx + i * cell, top, gx + i * cell, top + gridPx);
      doc.line(gx, top + i * cell, gx + gridPx, top + i * cell);
    }
    // Cage walls: thick segments where neighbours belong to different cages.
    doc.setLineWidth(1.6);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const x = gx + c * cell;
        const y = top + r * cell;
        if (c < 8 && cageIdx[r][c] !== cageIdx[r][c + 1]) {
          doc.line(x + cell, y, x + cell, y + cell);
        }
        if (r < 8 && cageIdx[r][c] !== cageIdx[r + 1][c]) {
          doc.line(x, y + cell, x + cell, y + cell);
        }
      }
    }
    // Cage sums in the top-left cell of each cage.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(Math.max(7, cell * 0.26));
    for (const [key, sum] of sumAt) {
      const [r, c] = key.split(",").map(Number);
      doc.text(String(sum), gx + c * cell + 3.5, top + r * cell + 10);
    }

    if (answerKey) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(cell * 0.5);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          doc.text(
            String(puzzle.solution[r][c]),
            gx + c * cell + cell / 2,
            top + r * cell + cell * 0.68,
            { align: "center" }
          );
        }
      }
    }
  };

  puzzles.forEach((_, i) => {
    if (i > 0) doc.addPage();
    drawGrid(puzzles[i], false, i);
  });
  puzzles.forEach((_, i) => {
    doc.addPage();
    drawGrid(puzzles[i], true, i);
  });

  savePdf(doc, `${PUZZLE_KEY}-${difficulty}-${puzzles.length}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: puzzles.length,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function KillerPreview({
  puzzle,
  difficulty,
}: {
  puzzle: KillerSudokuPuzzle;
  difficulty: SudokuDifficulty;
}) {
  const px = 360;
  const cell = px / 9;
  const { index, sumAt } = cageMap(puzzle);

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${px} ${px}`}
        className="w-full max-w-[360px] h-auto border-2 border-neutral-900 bg-white"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Killer sudoku preview"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={`l-${i}`}>
            <line x1={i * cell} y1={0} x2={i * cell} y2={px} stroke={i % 3 === 0 ? "#111" : "#d4d4d8"} strokeWidth={i % 3 === 0 ? 2 : 0.7} />
            <line x1={0} y1={i * cell} x2={px} y2={i * cell} stroke={i % 3 === 0 ? "#111" : "#d4d4d8"} strokeWidth={i % 3 === 0 ? 2 : 0.7} />
          </g>
        ))}
        {puzzle.cages.map((cage) =>
          cage.cells.flatMap(([r, c], k) => {
            const walls = [];
            const x = c * cell;
            const y = r * cell;
            if (index[r][Math.min(c + 1, 8)] !== index[r][c] && c < 8)
              walls.push(<line key={`v${k}`} x1={x + cell} y1={y} x2={x + cell} y2={y + cell} stroke="#111" strokeWidth={1.6} />);
            if ((r < 8) && index[Math.min(r + 1, 8)][c] !== index[r][c])
              walls.push(<line key={`h${k}`} x1={x} y1={y + cell} x2={x + cell} y2={y + cell} stroke="#111" strokeWidth={1.6} />);
            return walls;
          })
        )}
        {[...sumAt].map(([key, sum]) => {
          const [r, c] = key.split(",").map(Number);
          return (
            <text
              key={key}
              x={c * cell + 3}
              y={r * cell + 11}
              fontSize={cell * 0.28}
              fill="#374151"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {sum}
            </text>
          );
        })}
      </svg>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {DIFFICULTY_LABELS[difficulty]} · {puzzle.cages.length} cages ·
        every cage sum shown in its top-left corner.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KillerSudokuPage() {
  const pathname = usePathname();
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("medium");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<KillerSudokuPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    setIsGenerating(true);
    const task = requestKillers(difficulty, 1);
    void task.promise
      .then(([puzzle]) => {
        setPreview(puzzle);
        setGenerationError(null);
      })
      .catch(() => setGenerationError("Could not generate a preview."))
      .finally(() => setIsGenerating(false));
    return task.cancel;
  }, [difficulty]);

  const funnelProps = useCallback(
    (count: number) => ({
      template_slug: pathname,
      template_name: "Killer Sudoku Generator",
      device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
      orientation: "portrait" as const,
      source_page: pathname,
      puzzle_key: PUZZLE_KEY,
      difficulty,
      count,
    }),
    [pathname, pageSize, difficulty]
  );

  const handleDownload = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    captureEvent("template_generator_started", funnelProps(numPuzzles));
    try {
      const { promise } = requestKillers(difficulty, numPuzzles);
      const puzzles = await promise;
      await downloadPDF(puzzles, difficulty, pageSize);
      captureEvent("template_generated", funnelProps(numPuzzles));
      setPreview(puzzles[0]);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not generate the killer sudoku PDF. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Killer Sudoku Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Sudoku with sum cages instead of given digits — every printable
          puzzle is verified to have exactly one solution and comes with its
          answer key.
        </p>
        <Link
          href="/games/sudoku"
          className="inline-block mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Prefer classic clues? Try the Sudoku Generator →
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
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as SudokuDifficulty)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DIFFICULTY_LABELS) as SudokuDifficulty[]).map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
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
                max={4}
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
              <Button onClick={handleDownload} disabled={!preview || isGenerating}>
                {isGenerating ? "Solving…" : "Generate & Download PDF"}
              </Button>
            </div>

            {generationError && (
              <p className="text-sm text-destructive">{generationError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Killer grids take a moment to build — uniqueness is verified by
              an exhaustive solver before anything is published.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <KillerPreview puzzle={preview} difficulty={difficulty} />}
        </div>
      </div>
    </div>
  );
}
