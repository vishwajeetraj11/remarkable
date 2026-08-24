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
import { generateBingo, type BingoGame } from "@/lib/generators/bingo";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "bingo";

type BingoMode = {
  value: string;
  label: string;
  size: 3 | 4 | 5;
  maxNumber: number;
  maxCards: number;
  hint: string;
};

const MODES: BingoMode[] = [
  {
    value: "classic",
    label: "Classic 75-ball (5×5)",
    size: 5,
    maxNumber: 75,
    maxCards: 12,
    hint: "B 1-15 · I 16-30 · N 31-45 · G 46-60 · O 61-75, free center",
  },
  {
    value: "compact4",
    label: "Compact 4×4 (numbers 1-50)",
    size: 4,
    maxNumber: 50,
    maxCards: 16,
    hint: "Quick games — no free space, one shared pool",
  },
  {
    value: "compact3",
    label: "Compact 3×3 (numbers 1-30)",
    size: 3,
    maxNumber: 30,
    maxCards: 20,
    hint: "Fastest rounds — great for classrooms",
  },
];

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

const LETTERS_BY_SIZE: Record<3 | 4 | 5, string[]> = {
  3: ["A", "B", "C"],
  4: ["A", "B", "C", "D"],
  5: ["B", "I", "N", "G", "O"],
};

// ---------------------------------------------------------------------------
// PDF generation (runs client-side)
// ---------------------------------------------------------------------------

function drawCard(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  game: BingoGame,
  cardIndex: number,
  x: number,
  y: number,
  w: number
) {
  const dim = game.size;
  const headerH = w * 0.16;
  const cell = w / dim;

  // Column letters.
  const letters = LETTERS_BY_SIZE[dim as 3 | 4 | 5];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(Math.max(10, headerH * 0.6));
  doc.setTextColor(0, 0, 0);
  letters.forEach((ch, c) => {
    doc.text(ch, x + c * cell + cell / 2, y + headerH * 0.7, { align: "center" });
  });

  const top = y + headerH;

  // Cell borders.
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.8);
  for (let r = 0; r <= dim; r++) {
    doc.line(x, top + r * cell, x + w, top + r * cell);
  }
  for (let c = 0; c <= dim; c++) {
    doc.line(x + c * cell, top, x + c * cell, top + dim * cell);
  }

  const cells = game.cards[cardIndex].cells;
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      const v = cells[r][c];
      const cx = x + c * cell;
      const cy = top + r * cell;
      if (v === null) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(Math.max(7, cell * 0.22));
        doc.setTextColor(120, 120, 120);
        doc.text("FREE", cx + cell / 2, cy + cell / 2 + 3, { align: "center" });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setFont("courier", "normal");
        doc.setFontSize(Math.max(9, cell * 0.34));
        doc.text(String(v), cx + cell / 2, cy + cell * 0.64, { align: "center" });
      }
    }
  }
}

async function downloadPDF(
  game: BingoGame,
  mode: BingoMode,
  pageSizeKey: PageSizeKey
) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 32;
  const usableW = ps.w - margin * 2;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  // ── Card pages: two cards per row for 5×5, three otherwise.
  const perRow = game.size === 5 ? 2 : 3;
  const gap = 18;
  const cardW = (usableW - gap * (perRow - 1)) / perRow;
  const cardBlockH =
    cardW / game.size * game.size + cardW * 0.16; // grid + letter header
  const perPageRows = Math.max(1, Math.floor((ps.h - margin * 2 - 30) / (cardBlockH + gap)));
  const perPage = perRow * perPageRows;

  let card = 0;
  while (card < game.cards.length) {
    if (card > 0) doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Bingo Cards`, ps.w / 2, margin + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(mode.label, ps.w / 2, margin + 22, { align: "center" });
    doc.setTextColor(0, 0, 0);

    const pageTop = margin + 34;
    for (let slot = 0; slot < perPage && card < game.cards.length; slot++, card++) {
      const row = Math.floor(slot / perRow);
      const col = slot % perRow;
      drawCard(
        doc,
        game,
        card,
        margin + col * (cardW + gap),
        pageTop + row * (cardBlockH + gap),
        cardW
      );
    }
  }

  // ── Call sheet: every number in call order, numbered positions in 5 columns.
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Call Sheet", ps.w / 2, margin + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Call the numbers left to right, top to bottom. ${game.calls.length} balls.`, ps.w / 2, margin + 24, {
    align: "center",
  });
  doc.setTextColor(0, 0, 0);

  const cols = 5;
  const colW = usableW / cols;
  const startY = margin + 48;
  const rowH = 18;
  game.calls.forEach((num, i) => {
    const col = Math.floor(i / Math.ceil(game.calls.length / cols));
    const row = i % Math.ceil(game.calls.length / cols);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${i + 1}.`, margin + col * colW, startY + row * rowH);
    doc.setFont("courier", "bold");
    doc.text(String(num), margin + col * colW + 26, startY + row * rowH);
  });

  savePdf(doc, `bingo-${mode.value}-${game.cards.length}cards.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: game.cards.length,
    mode: mode.value,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BingoPage() {
  const pathname = usePathname();
  const [modeValue, setModeValue] = useState("classic");
  const [cardCount, setCardCount] = useState(4);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [game, setGame] = useState<BingoGame | null>(null);

  const mode = useMemo(
    () => MODES.find((m) => m.value === modeValue) ?? MODES[0],
    [modeValue]
  );

  const generate = useCallback(() => {
    setGame(generateBingo(Math.min(cardCount, mode.maxCards), mode.size, mode.maxNumber));
    return Math.min(cardCount, mode.maxCards);
  }, [cardCount, mode]);

  // Regenerate away from the synchronous effect body so setting changes
  // never cascade renders.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) generate();
    });
    return () => {
      cancelled = true;
    };
  }, [generate]);

  const handleDownload = async () => {
    if (!game) return;
    captureEvent("template_generator_started", funnelProps());
    await downloadPDF(game, mode, pageSize);
    captureEvent("template_generated", funnelProps());
  };

  const funnelProps = () => ({
    template_slug: pathname,
    template_name: "Bingo Cards Generator",
    device: normalizeTemplateDevice(PAGE_SIZE_DEVICE[pageSize]),
    orientation: "portrait" as const,
    source_page: pathname,
    puzzle_key: PUZZLE_KEY,
    mode: mode.value,
    count: cardCount,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bingo Card Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Printable bingo cards with true 75-ball column ranges and a call
          sheet — built for parties, classrooms, and e-ink tablets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>{mode.hint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Game mode</Label>
              <Select value={modeValue} onValueChange={setModeValue}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cards</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{cardCount}</span>
              </div>
              <Slider
                min={1}
                max={mode.maxCards}
                step={1}
                value={[Math.min(cardCount, mode.maxCards)]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setCardCount(val);
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
              <Button variant="outline" onClick={() => generate()}>
                Create new preview
              </Button>
              <Button onClick={handleDownload} disabled={!game}>
                Generate & Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="xl:order-first">
          {game && <BingoPreview game={game} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview component
// ---------------------------------------------------------------------------

function BingoPreview({ game }: { game: BingoGame }) {
  const dim = game.size;
  const cellPx = Math.min(34, Math.floor(320 / dim));
  const letters = LETTERS_BY_SIZE[dim as 3 | 4 | 5];
  const nextCalls = game.calls.slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="inline-block border border-border rounded-lg overflow-hidden bg-border">
          <div
            className="grid font-bold bg-background"
            style={{ gridTemplateColumns: `repeat(${dim}, ${cellPx}px)` }}
          >
            {letters.map((ch) => (
              <div
                key={ch}
                className="flex items-center justify-center py-1 text-primary"
                style={{ fontSize: Math.max(11, cellPx * 0.42) }}
              >
                {ch}
              </div>
            ))}
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${dim}, ${cellPx}px)` }}
          >
            {game.cards[0].cells.flat().map((v, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center bg-background font-mono text-foreground"
                style={{ width: cellPx, height: cellPx, fontSize: Math.max(11, cellPx * 0.36) }}
              >
                {v === null ? (
                  <span className="font-sans text-[10px] font-semibold text-muted-foreground">
                    FREE
                  </span>
                ) : (
                  v
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          First calls ({nextCalls.join(", ")}…)
        </h2>
        <p className="text-xs text-muted-foreground">
          Card 1 of {game.cards.length} shown. The PDF includes all{" "}
          {game.cards.length} cards plus the full call sheet in call order.
        </p>
      </div>
    </div>
  );
}
