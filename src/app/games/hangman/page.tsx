"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  generateHangmanSheet,
  type HangmanSheet,
} from "@/lib/generators/hangman";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "hangman";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─── PDF generation ───────────────────────────────────────────────────────────

async function downloadPDF(sheet: HangmanSheet, pageSizeKey: PageSizeKey) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 40;
  const usableW = ps.w - margin * 2;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });
  const roundsPerPage = 2;
  const rounds = sheet.rounds;

  rounds.forEach((round, idx) => {
    const slot = idx % roundsPerPage;
    if (idx > 0 && slot === 0) doc.addPage();

    const sectionTop = margin + slot * ((ps.h - margin * 2) / roundsPerPage);
    const sectionH = (ps.h - margin * 2) / roundsPerPage;

    // Round header.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Round ${idx + 1}`, margin, sectionTop + 12);

    // Gallows drawing box (left).
    const boxSize = Math.min(sectionH - 70, 130);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(1);
    doc.rect(margin, sectionTop + 26, boxSize, boxSize);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("draw here", margin + boxSize / 2, sectionTop + 26 + boxSize / 2 + 3, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);

    // Word slots + category (right of gallows box).
    const slotsX = margin + boxSize + 24;
    const slotsW = usableW - boxSize - 24;
    const wordLen = round.word.length;
    const blankW = Math.min(26, slotsW / (wordLen + 1));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(`Category: ${round.category}`, slotsX, sectionTop + 40);
    doc.setTextColor(0, 0, 0);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.2);
    for (let i = 0; i < wordLen; i++) {
      doc.line(
        slotsX + i * (blankW + 6),
        sectionTop + 78,
        slotsX + i * (blankW + 6) + blankW,
        sectionTop + 78
      );
    }

    // Alphabet tracker under the slots.
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    const trackerY = sectionTop + 108;
    ALPHABET.forEach((ch, i) => {
      const col = i % 9;
      const row = Math.floor(i / 9);
      doc.text(ch, slotsX + col * 22, trackerY + row * 18);
    });

    if (slot === roundsPerPage - 1 || idx === rounds.length - 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Hangman sheets · remarkable-skills — cross off letters as they are guessed.`,
        ps.w / 2,
        ps.h - margin + 16,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }
  });

  // Answer page.
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Answer Key", ps.w / 2, margin, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = margin + 28;
  rounds.forEach((round, idx) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}.`, margin, y);
    doc.setFont("courier", "bold");
    doc.setTextColor(40, 40, 180);
    doc.text(round.word, margin + 22, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`(${round.category})`, margin + 22 + round.word.length * 8.5 + 8, y);
    doc.setFontSize(11);
    y += 20;
  });

  savePdf(doc, `${PUZZLE_KEY}-${rounds.length}rounds.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: rounds.length,
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function HangmanPreview({ sheet }: { sheet: HangmanSheet }) {
  return (
    <div className="space-y-3">
      <ol className="space-y-2" data-testid="hangman-rounds">
        {sheet.rounds.map((round, i) => (
          <li key={`${round.word}-${i}`} className="flex items-baseline gap-3 text-sm" data-testid="hangman-round">
            <span className="font-medium w-5 shrink-0">{i + 1}.</span>
            <span className="flex gap-1">
              {round.word.split("").map((_, j) => (
                <span key={j} className="inline-block w-3.5 border-b-2 border-foreground" />
              ))}
            </span>
            <span className="text-xs text-muted-foreground">{round.category}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        Words are hidden in the PDF; the answer key is the final page.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HangmanPage() {
  const pathname = usePathname();
  const [category, setCategory] = useState("all");
  const [roundCount, setRoundCount] = useState(8);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<HangmanSheet | null>(null);

  const generateOne = useCallback(
    () =>
      generateHangmanSheet(
        roundCount,
        category === "all" ? undefined : [category]
      ),
    [roundCount, category]
  );

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setPreview(generateOne());
    });
    return () => {
      cancelled = true;
    };
  }, [generateOne]);

  const categories = useMemo(
    () => ["all", "Animals", "Food", "Places", "Sports", "Jobs"],
    []
  );

  const funnelProps = useCallback(
    () => ({
      template_slug: pathname,
      template_name: "Hangman Generator",
      device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
      orientation: "portrait" as const,
      source_page: pathname,
      puzzle_key: PUZZLE_KEY,
      count: roundCount,
      category,
    }),
    [pathname, pageSize, roundCount, category]
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
        <h1 className="text-3xl font-bold tracking-tight">Hangman Sheet Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Printable hangman rounds with themed secret words, a drawing box per
          round, and an alphabet tracker — plus a full answer key.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your sheet before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Word categories</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.slice(1).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Rounds</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{roundCount}</span>
              </div>
              <Slider
                min={1}
                max={20}
                step={1}
                value={[roundCount]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setRoundCount(val);
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
              <Button variant="outline" onClick={() => setPreview(generateOne())}>
                Create new preview
              </Button>
              <Button onClick={handleDownload} disabled={!preview}>
                Generate & Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {preview && <HangmanPreview sheet={preview} />}
        </div>
      </div>
    </div>
  );
}
