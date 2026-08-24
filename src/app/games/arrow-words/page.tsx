"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { savePdf } from "@/lib/download-tracker";
import { captureEvent, normalizeTemplateDevice } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateArrowWords, type ArrowWordPuzzle } from "@/lib/generators/arrow-words";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "arrow-words";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

const SIZES = [11, 13, 15] as const;

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(puzzle: ArrowWordPuzzle, pageSizeKey: PageSizeKey) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;
  const n = puzzle.size;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawGrid = (answers: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Arrow Words", ps.w / 2, margin + 14, { align: "center" });
    if (!answers) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Clues are printed inside the grid with an arrow pointing at the answer. Fill every white cell.",
        ps.w / 2,
        margin + 28,
        { align: "center" }
      );
    }
    doc.setTextColor(0, 0, 0);

    const top = margin + 40;
    const cell = Math.min(usableW / n, (ps.h - top - margin - 24) / n);
    const gx = margin + (usableW - cell * n) / 2;

    // Build lookup for entries.
    const letterAt = new Map<string, string>();
    const entryAt = new Map<string, (typeof puzzle.entries)[number]>();
    for (const e of puzzle.entries) {
      const dr = e.direction === "down" ? 1 : 0;
      const dc = e.direction === "across" ? 1 : 0;
      entryAt.set(`${e.clueRow},${e.clueCol}`, e);
      for (let i = 0; i < e.word.length; i++) {
        letterAt.set(`${e.row + dr * i},${e.col + dc * i}`, e.word[i]);
      }
    }

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    for (let r = 0; r <= n; r++) {
      doc.line(gx, top + r * cell, gx + n * cell, top + r * cell);
    }
    for (let c = 0; c <= n; c++) {
      doc.line(gx + c * cell, top, gx + c * cell, top + n * cell);
    }

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const x = gx + c * cell;
        const y = top + r * cell;
        const entry = entryAt.get(`${r},${c}`);
        if (entry) {
          // Clue cell: shaded, tiny text, arrow glyph.
          doc.setFillColor(232, 232, 232);
          doc.rect(x, y, cell, cell, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(Math.max(4, cell * 0.16));
          doc.setTextColor(60, 60, 60);
          const words = entry.clue.split(" ");
          let line = "";
          let ly = y + cell * 0.3;
          for (const w of words) {
            if ((line + " " + w).length > 10) {
              doc.text(line, x + 2, ly);
              line = w;
              ly += cell * 0.2;
              if (ly > y + cell * 0.78) break;
            } else {
              line = line ? `${line} ${w}` : w;
            }
          }
          if (ly <= y + cell * 0.78 && line) doc.text(line, x + 2, ly);
          doc.setFontSize(cell * 0.3);
          doc.text(entry.direction === "across" ? ">" : "v", x + cell - cell * 0.24, y + cell * 0.9);
          doc.setTextColor(0, 0, 0);
        } else if (!letterAt.has(`${r},${c}`)) {
          // Block cell.
          doc.setFillColor(30, 30, 30);
          doc.rect(x, y, cell, cell, "F");
        } else if (answers) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(cell * 0.5);
          doc.setTextColor(40, 40, 180);
          doc.text(
            letterAt.get(`${r},${c}`)!,
            x + cell / 2,
            y + cell * 0.7,
            { align: "center" }
          );
          doc.setTextColor(0, 0, 0);
        }
      }
    }
  };

  drawGrid(false);
  doc.addPage();
  drawGrid(true);

  savePdf(doc, `${PUZZLE_KEY}-${n}x${n}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: 1,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function ArrowWordsPreview({ puzzle }: { puzzle: ArrowWordPuzzle }) {
  const n = puzzle.size;
  const cellPx = Math.max(14, Math.floor(420 / n));

  const letterAt = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of puzzle.entries) {
      const dr = e.direction === "down" ? 1 : 0;
      const dc = e.direction === "across" ? 1 : 0;
      for (let i = 0; i < e.word.length; i++) {
        m.set(`${e.row + dr * i},${e.col + dc * i}`, e.word[i]);
      }
    }
    return m;
  }, [puzzle]);
  const clueCells = useMemo(() => {
    const s = new Set(puzzle.entries.map((e) => `${e.clueRow},${e.clueCol}`));
    return s;
  }, [puzzle]);

  return (
    <div className="space-y-3">
      <div className="overflow-auto">
        <div
          className="inline-grid border-2 border-neutral-900 bg-white"
          style={{ gridTemplateColumns: `repeat(${n}, ${cellPx}px)` }}
        >
          {Array.from({ length: n * n }).map((_, idx) => {
            const r = Math.floor(idx / n);
            const c = idx % n;
            const key = `${r},${c}`;
            const isClue = clueCells.has(key);
            const isBlock = !isClue && !letterAt.has(key);
            return (
              <div
                key={idx}
                className={
                  isClue
                    ? "bg-neutral-200"
                    : isBlock
                      ? "bg-neutral-900"
                      : "bg-white border-b border-r border-neutral-400"
                }
                style={{ width: cellPx, height: cellPx }}
                title={isClue ? puzzle.entries.find((e) => e.clueRow === r && e.clueCol === c)?.clue : undefined}
              />
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {puzzle.entries.length} clues · hover a grey
        clue cell to read it.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArrowWordsPage() {
  const pathname = usePathname();
  const [size, setSize] = useState(11);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<ArrowWordPuzzle | null>(null);

  const generateOne = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      const p = generateArrowWords(size);
      if (p) return p;
    }
    return null;
  }, [size]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setPreview(generateOne());
    });
    return () => {
      cancelled = true;
    };
  }, [generateOne]);

  const funnelProps = useCallback(
    () => ({
      template_slug: pathname,
      template_name: "Arrow Words Generator",
      device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
      orientation: "portrait" as const,
      source_page: pathname,
      puzzle_key: PUZZLE_KEY,
      count: 1,
    }),
    [pathname, pageSize]
  );

  const handleDownload = async () => {
    if (!preview) return;
    captureEvent("template_generator_started", funnelProps());
    await downloadPDF(preview, pageSize);
    captureEvent("template_generated", funnelProps());
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Arrow Words Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Mots fléchés — France&rsquo;s favorite crossword style. Clues sit
          inside the grid with arrows; answers interlock across and down.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Every grid is generated fresh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Grid size</Label>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s} × {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button variant="outline" onClick={() => setPreview(generateOne())}>
                Create new preview
              </Button>
              <Button onClick={handleDownload} disabled={!preview}>
                Generate & Download PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The download includes the blank puzzle plus a filled answer page.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <ArrowWordsPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}
