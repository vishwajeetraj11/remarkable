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
import { generateHashi, type HashiPuzzle } from "@/lib/generators/hashi";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "hashi";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

const SIZES = [8, 10, 12] as const;

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(puzzle: HashiPuzzle, pageSizeKey: PageSizeKey) {
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
      `Hashi (Bridges)${answerKey ? " — Solution" : ""}`,
      ps.w / 2,
      margin + 14,
      { align: "center" }
    );
    if (!answerKey) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Connect islands with 1-2 bridges each so every number is met and the whole network is linked.",
        ps.w / 2,
        margin + 28,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    const top = margin + 40;
    const cell = Math.min(usableW / n, (ps.h - top - margin - 24) / n);
    const gx = margin + (usableW - cell * n) / 2;
    const cxOf = (col: number) => gx + col * cell;
    const cyOf = (row: number) => top + row * cell;
    const islandAt = new Map<string, number>();
    puzzle.islands.forEach((isl, i) => islandAt.set(`${isl.row},${isl.col}`, i));

    // Bridges first (under the islands).
    if (answerKey && puzzle.bridges) {
      for (const br of puzzle.bridges) {
        const A = puzzle.islands[br.a];
        const B = puzzle.islands[br.b];
        doc.setDrawColor(20, 20, 160);
        doc.setLineWidth(1.6);
        const r = Math.min(A.row, B.row) === A.row && A.col === B.col ? null : null;
        void r;
        if (A.row === B.row) {
          // Horizontal.
          const x1 = cxOf(Math.min(A.col, B.col)) + cell * 0.35;
          const x2 = cxOf(Math.max(A.col, B.col)) - cell * 0.35;
          const y = cyOf(A.row);
          if (br.count === 1) {
            doc.line(x1, y - 2.5, x2, y - 2.5);
          } else {
            doc.line(x1, y - 5, x2, y - 5);
            doc.line(x1, y, x2, y);
          }
        } else {
          // Vertical.
          const y1 = cyOf(Math.min(A.row, B.row)) + cell * 0.35;
          const y2 = cyOf(Math.max(A.row, B.row)) - cell * 0.35;
          const x = cxOf(A.col);
          if (br.count === 1) {
            doc.line(x - 2.5, y1, x - 2.5, y2);
          } else {
            doc.line(x - 5, y1, x - 5, y2);
            doc.line(x, y1, x, y2);
          }
        }
      }
    }

    // Islands.
    for (const isl of puzzle.islands) {
      const x = cxOf(isl.col);
      const y = cyOf(isl.row);
      const rad = cell * 0.3;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.2);
      doc.circle(x, y, rad, "FD");
      doc.setFont("courier", "bold");
      doc.setFontSize(rad * 1.15);
      doc.text(String(isl.count), x, y + rad * 0.42, { align: "center" });
    }
  };

  drawBoard(false);
  doc.addPage();
  drawBoard(true);

  savePdf(doc, `${PUZZLE_KEY}-${puzzle.size}x${puzzle.size}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: 1,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function HashiPreview({ puzzle }: { puzzle: HashiPuzzle }) {
  const n = puzzle.size;
  const px = Math.min(360, n * 34);
  const cell = px / n;

  return (
    <div className="space-y-3">
      <svg
        viewBox={`-4 -4 ${px + 8} ${px + 8}`}
        className="w-full max-w-[360px] h-auto"
        role="img"
        aria-label="Hashi preview"
      >
        {(() => {
          const at = new Map(puzzle.islands.map((isl, i) => [`${isl.row},${isl.col}`, i]));
          return (
            <>
              {puzzle.bridges?.map((br, k) => {
                const A = puzzle.islands[br.a];
                const B = puzzle.islands[br.b];
                if (A.row === B.row) {
                  const x1 = (Math.min(A.col, B.col) + 0.35) * cell;
                  const x2 = (Math.max(A.col, B.col) - 0.35) * cell;
                  const y = A.row * cell;
                  return br.count === 1 ? (
                    <line key={`b${k}`} x1={x1} y1={y - 2} x2={x2} y2={y - 2} stroke="#2563eb" strokeWidth={1.6} />
                  ) : (
                    <g key={`b${k}`}>
                      <line x1={x1} y1={y - 4.5} x2={x2} y2={y - 4.5} stroke="#2563eb" strokeWidth={1.6} />
                      <line x1={x1} y1={y + 0.5} x2={x2} y2={y + 0.5} stroke="#2563eb" strokeWidth={1.6} />
                    </g>
                  );
                }
                const y1 = (Math.min(A.row, B.row) + 0.35) * cell;
                const y2 = (Math.max(A.row, B.row) - 0.35) * cell;
                const x = A.col * cell;
                return br.count === 1 ? (
                  <line key={`b${k}`} x1={x - 2} y1={y1} x2={x - 2} y2={y2} stroke="#2563eb" strokeWidth={1.6} />
                ) : (
                  <g key={`b${k}`}>
                    <line x1={x - 4.5} y1={y1} x2={x - 4.5} y2={y2} stroke="#2563eb" strokeWidth={1.6} />
                    <line x1={x + 0.5} y1={y1} x2={x + 0.5} y2={y2} stroke="#2563eb" strokeWidth={1.6} />
                  </g>
                );
              })}
              {puzzle.islands.map((isl) => (
                <g key={`i-${at.get(`${isl.row},${isl.col}`)}`}>
                  <circle cx={isl.col * cell} cy={isl.row * cell} r={cell * 0.3} fill="white" stroke="#111" strokeWidth={1.3} />
                  <text
                    x={isl.col * cell}
                    y={isl.row * cell + cell * 0.13}
                    textAnchor="middle"
                    fontSize={cell * 0.34}
                    fontWeight={700}
                    fill="#111"
                    fontFamily="ui-monospace, monospace"
                  >
                    {isl.count}
                  </text>
                </g>
              ))}
            </>
          );
        })()}
      </svg>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {puzzle.islands.length} islands · solver-verified
        unique bridge layout.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HashiPage() {
  const pathname = usePathname();
  const [size, setSize] = useState(10);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<HashiPuzzle | null>(null);

  const generateOne = useCallback(() => {
    // Roughly half of random boards fail the uniqueness gate — redraw.
    for (let i = 0; i < 12; i++) {
      const p = generateHashi(size);
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
      template_name: "Hashi Generator",
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
        <h1 className="text-3xl font-bold tracking-tight">Hashi (Bridges) Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Bridge the islands: single or double connections between neighbours,
          every count satisfied, one connected network — no crossings. Every
          board ships with its unique solution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Fresh archipelago every time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Board size</Label>
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
              The answer page draws the complete bridge network in blue.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <HashiPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}
