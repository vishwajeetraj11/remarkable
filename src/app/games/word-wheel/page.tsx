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
import { generateWordWheel, type WordWheelPuzzle } from "@/lib/generators/word-wheel";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "word-wheel";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(puzzle: WordWheelPuzzle, pageSizeKey: PageSizeKey) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const cx = ps.w / 2;
  const cy = ps.h * 0.38;
  const radius = Math.min(ps.w, ps.h) * 0.26;
  const titleY = ps.h * 0.07 + 14;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  // ── Page 1: the wheel + writing lines.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Word Wheel", cx, titleY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(
    "Make as many words as you can from the nine letters. Every word must use the center letter.",
    cx,
    titleY + 16,
    { align: "center" }
  );
  doc.setTextColor(0, 0, 0);

  puzzle.letters.forEach((ch, i) => {
    if (i === puzzle.centerIndex) return;
    const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(1);
    doc.circle(x, y, radius * 0.22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(radius * 0.3);
    doc.text(ch.toUpperCase(), x, y + radius * 0.1, { align: "center" });
  });

  // Center hub on top.
  doc.setFillColor(30, 30, 30);
  doc.circle(cx, cy, radius * 0.26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(radius * 0.34);
  doc.setTextColor(255, 255, 255);
  doc.text(
    puzzle.letters[puzzle.centerIndex].toUpperCase(),
    cx,
    cy + radius * 0.12,
    { align: "center" }
  );
  doc.setTextColor(0, 0, 0);

  // Writing lines.
  const linesTop = cy + radius + 34;
  const lineH = 24;
  const maxLines = Math.floor((ps.h - 40 - linesTop) / lineH);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.6);
  for (let i = 0; i < maxLines; i++) {
    doc.line(72, linesTop + i * lineH, ps.w - 72, linesTop + i * lineH);
  }

  // ── Page 2: answer key.
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`Word Wheel — Answers (${puzzle.solutions.length} words)`, cx, titleY, {
    align: "center",
  });

  const cols = 4;
  const colW = (ps.w - 96) / cols;
  const startY = titleY + 40;
  const rowH = 20;
  const rowsPerCol = Math.ceil(puzzle.solutions.length / cols);
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text(
    `Center letter: ${puzzle.letters[puzzle.centerIndex].toUpperCase()}`,
    cx,
    titleY + 22,
    { align: "center" }
  );
  puzzle.solutions.forEach((w, idx) => {
    const col = Math.floor(idx / rowsPerCol);
    const row = idx % rowsPerCol;
    doc.text(w, 48 + col * colW, startY + row * rowH);
  });

  savePdf(doc, `${PUZZLE_KEY}-${puzzle.solutions.length}words.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: 1,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function WheelPreview({ puzzle }: { puzzle: WordWheelPuzzle }) {
  return (
    <div className="space-y-3">
      <svg
        viewBox={`-130 -130 260 260`}
        className="w-full max-w-[280px] h-auto"
        role="img"
        aria-label="Word wheel preview"
      >
        {puzzle.letters.map((ch, i) => {
          if (i === puzzle.centerIndex) return null;
          const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * 92;
          const y = Math.sin(angle) * 92;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={21} fill="white" stroke="#374151" strokeWidth={1.5} />
              <text
                x={x}
                y={y + 7}
                textAnchor="middle"
                fontSize={22}
                fontWeight={700}
                fill="#111827"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {ch.toUpperCase()}
              </text>
            </g>
          );
        })}
        <circle cx={0} cy={0} r={27} fill="#111827" />
        <text
          x={0}
          y={9}
          textAnchor="middle"
          fontSize={28}
          fontWeight={700}
          fill="white"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {puzzle.letters[puzzle.centerIndex].toUpperCase()}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">
        {puzzle.solutions.length} possible words · center letter required in
        every word.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WordWheelPage() {
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<WordWheelPuzzle | null>(null);

  const generateOne = useCallback(() => generateWordWheel(10), []);

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
      template_name: "Word Wheel Generator",
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
        <h1 className="text-3xl font-bold tracking-tight">Word Wheel Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Nine letters around a hub — how many words can your class find?
          Every wheel is a fresh nine-letter seed with a full answer key.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Wheels are generated fresh every time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              The download includes the printable wheel with writing lines plus
              the complete word list as the answer key.
            </p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <WheelPreview puzzle={preview} />}
        </div>
      </div>
    </div>
  );
}
