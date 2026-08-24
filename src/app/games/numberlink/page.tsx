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
import { generateNumberlink, type NumberlinkPuzzle } from "@/lib/generators/numberlink";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "numberlink";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

const SIZES = [6, 8] as const;

const PALETTE: [number, number, number][] = [
  [200, 30, 30],
  [30, 60, 200],
  [20, 140, 60],
  [200, 120, 20],
  [130, 40, 180],
  [20, 150, 160],
  [190, 50, 120],
  [110, 110, 20],
];

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(puzzle: NumberlinkPuzzle, pageSizeKey: PageSizeKey) {
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
      `Numberlink ${n}×${n}${answerKey ? " — Solution" : ""}`,
      ps.w / 2,
      margin + 14,
      { align: "center" }
    );
    if (!answerKey) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Connect matching numbers with paths that never cross. Flow-style: the paths cover every cell.",
        ps.w / 2,
        margin + 28,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    const top = margin + 40;
    const cell = Math.min(usableW / n, (ps.h - top - margin - 24) / n);
    const gx = margin + (usableW - cell * n) / 2;

    if (answerKey) {
      puzzle.paths.forEach((path, idx) => {
        const [r, g, b] = PALETTE[idx % PALETTE.length];
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(cell * 0.28);
        doc.setLineJoin("round");
        doc.setLineCap("round");
        for (let i = 1; i < path.length; i++) {
          doc.line(
            gx + path[i - 1][1] * cell + cell / 2,
            top + path[i - 1][0] * cell + cell / 2,
            gx + path[i][1] * cell + cell / 2,
            top + path[i][0] * cell + cell / 2
          );
        }
      });
    }

    // Grid lines.
    doc.setDrawColor(answerKey ? 255 : 180, answerKey ? 255 : 180, answerKey ? 255 : 180);
    doc.setLineWidth(0.7);
    for (let i = 0; i <= n; i++) {
      doc.line(gx, top + i * cell, gx + n * cell, top + i * cell);
      doc.line(gx + i * cell, top, gx + i * cell, top + n * cell);
    }
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.4);
    doc.rect(gx, top, cell * n, cell * n);

    // Endpoints.
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const id = puzzle.endpoints[r][c];
        if (!id) continue;
        doc.setFillColor(255, 255, 255);
        doc.circle(gx + c * cell + cell / 2, top + r * cell + cell / 2, cell * 0.3, "F");
        if (answerKey) {
          const [pr, pg, pb] = PALETTE[(id - 1) % PALETTE.length];
          doc.setDrawColor(pr, pg, pb);
          doc.setLineWidth(1.6);
          doc.circle(gx + c * cell + cell / 2, top + r * cell + cell / 2, cell * 0.3, "S");
        }
        doc.setFont("courier", "bold");
        doc.setFontSize(cell * 0.34);
        doc.setTextColor(0, 0, 0);
        doc.text(
          String(id),
          gx + c * cell + cell / 2,
          top + r * cell + cell * 0.62,
          { align: "center" }
        );
        doc.setTextColor(0, 0, 0);
      }
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

function NumberlinkPreview({ puzzle }: { puzzle: NumberlinkPuzzle }) {
  const n = puzzle.size;
  const px = Math.min(360, n * 40);
  const cell = px / n;

  return (
    <div className="space-y-3">
      <svg
        viewBox={`-2 -2 ${px + 4} ${px + 4}`}
        className="w-full max-w-[360px] h-auto"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Numberlink preview"
      >
        <rect x={0} y={0} width={px} height={px} fill="none" stroke="#a3a3a3" strokeWidth={0.8} />
        {Array.from({ length: n - 1 }).map((_, i) => (
          <g key={i} stroke="#e5e5e5" strokeWidth={0.8}>
            <line x1={(i + 1) * cell} y1={0} x2={(i + 1) * cell} y2={px} />
            <line x1={0} y1={(i + 1) * cell} x2={px} y2={(i + 1) * cell} />
          </g>
        ))}
        {puzzle.endpoints.flatMap((row, r) =>
          row.map((id, c) =>
            !id ? null : (
              <g key={`${r}-${c}`}>
                <circle cx={c * cell + cell / 2} cy={r * cell + cell / 2} r={cell * 0.32} fill="white" stroke="#111" strokeWidth={1.2} />
                <text
                  x={c * cell + cell / 2}
                  y={r * cell + cell * 0.62}
                  textAnchor="middle"
                  fontSize={cell * 0.34}
                  fontWeight={700}
                  fill="#111"
                  fontFamily="ui-monospace, monospace"
                >
                  {id}
                </text>
              </g>
            )
          )
        )}
      </svg>
      <p className="text-xs text-muted-foreground">
        Preview of puzzle 1 · {puzzle.paths.length} pairs · solver-verified
        unique full-coverage routing.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NumberlinkPage() {
  const pathname = usePathname();
  const [size, setSize] = useState(6);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<NumberlinkPuzzle | null>(null);

  const generateOne = useCallback(() => {
    // The engine already loops internally; a second draw smooths outliers.
    for (let i = 0; i < 3; i++) {
      const p = generateNumberlink(size);
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
      template_name: "Numberlink Generator",
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
        <h1 className="text-3xl font-bold tracking-tight">Numberlink Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Pair the matching numbers with non-crossing paths. Flow-style boards:
          the solution covers every cell, and uniqueness is solver-checked
          before anything prints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Fresh board every time.</CardDescription>
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
              The answer page draws each pair&rsquo;s path in its own color.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <NumberlinkPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}
