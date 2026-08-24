"use client";

import { useCallback, useEffect, useState } from "react";
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
import { generateSlitherlink, type SlitherlinkPuzzle } from "@/lib/generators/slitherlink";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "slitherlink";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

const SIZES = [5, 6, 8, 10] as const;

function edgeKey(r1: number, c1: number, r2: number, c2: number): string {
  const [a, b] = [
    [r1, c1],
    [r2, c2],
  ].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  return `${a[0]},${a[1]}-${b[0]},${b[1]}`;
}

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(puzzle: SlitherlinkPuzzle, pageSizeKey: PageSizeKey) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;
  const n = puzzle.size;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawBoard = (answerKey: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Slitherlink ${n}×${n}${answerKey ? " — Solution" : ""}`,
      ps.w / 2,
      margin + 14,
      { align: "center" }
    );
    if (!answerKey) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Draw one closed loop along the dots; a cell's number counts its loop edges.",
        ps.w / 2,
        margin + 28,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    const top = margin + 40;
    const cell = Math.min(usableW / n, (ps.h - top - margin - 24) / n);
    const gx = margin + (usableW - cell * n) / 2;

    // Lattice dots.
    doc.setFillColor(60, 60, 60);
    for (let r = 0; r <= n; r++) {
      for (let c = 0; c <= n; c++) {
        doc.circle(gx + c * cell, top + r * cell, 1.4, "F");
      }
    }

    // Clues.
    doc.setFont("courier", "bold");
    doc.setFontSize(cell * 0.34);
    doc.setTextColor(30, 30, 30);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.clues[r][c] === 0 && !answerKey) continue;
        doc.text(
          String(puzzle.clues[r][c]),
          gx + (c + 0.5) * cell,
          top + (r + 0.62) * cell,
          { align: "center" }
        );
      }
    }
    doc.setTextColor(0, 0, 0);

    if (answerKey) {
      // Loop edges.
      doc.setDrawColor(20, 20, 160);
      doc.setLineWidth(2.4);
      for (const key of puzzle.solutionEdges) {
        const [a, b] = key.split("-").map((p) => p.split(",").map(Number));
        doc.line(gx + a[1] * cell, top + a[0] * cell, gx + b[1] * cell, top + b[0] * cell);
      }
    } else {
      // Faint border to frame the playing area.
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.6);
      doc.rect(gx, top, cell * n, cell * n);
    }
  };

  drawBoard(false);
  doc.addPage();
  drawBoard(true);

  savePdf(doc, `${PUZZLE_KEY}-${n}x${n}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: 1,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function SlitherlinkPreview({ puzzle }: { puzzle: SlitherlinkPuzzle }) {
  const n = puzzle.size;
  const px = Math.min(360, n * 40);
  const cell = px / n;

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${px} ${px}`}
        className="w-full max-w-[360px] h-auto"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Slitherlink preview"
      >
        {/* Dots */}
        {Array.from({ length: n + 1 }).flatMap((_, r) =>
          Array.from({ length: n + 1 }).map((__, c) => (
            <circle key={`d-${r}-${c}`} cx={c * cell} cy={r * cell} r={1.6} fill="#555" />
          ))
        )}
        {/* Clues */}
        {puzzle.clues.flatMap((row, r) =>
          row.map((clue, c) =>
            clue === 0 ? null : (
              <text
                key={`c-${r}-${c}`}
                x={(c + 0.5) * cell}
                y={(r + 0.66) * cell}
                textAnchor="middle"
                fontSize={cell * 0.36}
                fontWeight={600}
                fill="#262626"
                fontFamily="ui-monospace, monospace"
              >
                {clue}
              </text>
            )
          )
        )}
        {/* Faint frame */}
        <rect x={0} y={0} width={px} height={px} fill="none" stroke="#e5e5e5" strokeWidth={1} />
      </svg>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {n}×{n} · solver-verified unique loop.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlitherlinkPage() {
  const pathname = usePathname();
  const [size, setSize] = useState(6);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<SlitherlinkPuzzle | null>(null);

  const generateOne = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      const p = generateSlitherlink(size);
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
      template_name: "Slitherlink Generator",
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
        <h1 className="text-3xl font-bold tracking-tight">Slitherlink Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Draw a single closed loop along the dotted lattice — each number says
          how many of its cell&rsquo;s edges the loop uses. Every printed puzzle
          is verified to have exactly one solution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Fresh loop every time.</CardDescription>
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
              The answer page traces the full loop in blue.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <SlitherlinkPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}
