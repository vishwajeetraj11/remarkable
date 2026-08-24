"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { savePdf } from "@/lib/download-tracker";
import { captureEvent, normalizeTemplateDevice } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateArrowWords } from "@/lib/generators/arrow-words";
import { ARROW_WORDS_DE } from "@/lib/languages/arrow-words-de";
import { drawClueIcon, getClueIcon, iconToSvg } from "@/lib/i18n/clue-icons";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const PUZZLE_KEY = "schwedenraetsel";

const PAGE_SIZE_DEVICE: Record<PageSizeKey, string> = {
  A4: "a4",
  Letter: "letter",
  eInk: "remarkable2",
  paperPro: "paperPro",
  kindleScribe: "kindleScribe",
};

type Puzzle = NonNullable<ReturnType<typeof generateArrowWords>>;

async function downloadPDF(puzzle: Puzzle, pageSizeKey: PageSizeKey) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const margin = 36;
  const usableW = ps.w - margin * 2;
  const n = puzzle.size;

  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h], orientation: "portrait" });

  const drawGridPage = (answers: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Schwedenrätsel", ps.w / 2, margin + 14, { align: "center" });
    if (!answers) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(
        "Bildrätsel: die Pfeile zeigen zu den Antworten — lösen, bis das Gitter voll ist.",
        ps.w / 2,
        margin + 28,
        { align: "center" },
      );
      doc.setTextColor(0, 0, 0);
    }

    const top = margin + 40;
    const cell = Math.min(usableW / n, (ps.h - top - margin - 24) / n);
    const gx = margin + (usableW - cell * n) / 2;

    const letterAt = new Map<string, string>();
    const clueAt = new Map<string, { icon: string; dir: string }>();
    for (const e of puzzle.entries) {
      const dr = e.direction === "down" ? 1 : 0;
      const dc = e.direction === "across" ? 1 : 0;
      clueAt.set(`${e.clueRow},${e.clueCol}`, { icon: e.clue, dir: e.direction });
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
        const clue = clueAt.get(`${r},${c}`);
        if (clue) {
          doc.setFillColor(240, 240, 240);
          doc.rect(x, y, cell, cell, "F");
          // Icon fills upper part; arrow glyph sits bottom-right.
          const iconPad = cell * 0.16;
          drawClueIcon(doc, clue.icon, x + iconPad, y + iconPad, cell - iconPad * 2);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(cell * 0.22);
          doc.setTextColor(90, 90, 90);
          doc.text(clue.dir === "across" ? ">" : "v", x + cell - cell * 0.2, y + cell * 0.95);
          doc.setTextColor(0, 0, 0);
        } else if (!letterAt.has(`${r},${c}`)) {
          doc.setFillColor(30, 30, 30);
          doc.rect(x, y, cell, cell, "F");
        } else if (answers) {
          doc.setFont("courier", "bold");
          doc.setFontSize(cell * 0.5);
          doc.setTextColor(40, 40, 180);
          doc.text(letterAt.get(`${r},${c}`)!, x + cell / 2, y + cell * 0.7, {
            align: "center",
          });
          doc.setTextColor(0, 0, 0);
        }
      }
    }
  };

  drawGridPage(false);
  doc.addPage();
  drawGridPage(true);

  savePdf(doc, `${PUZZLE_KEY}-${n}x${n}.pdf`, {
    puzzle_key: PUZZLE_KEY,
    page_size: pageSizeKey,
    count: 1,
  });
}

function Preview({ puzzle }: { puzzle: Puzzle }) {
  const n = puzzle.size;
  const cellPx = Math.max(16, Math.floor(420 / n));
  const clueAt = new Map(puzzle.entries.map((e) => [`${e.clueRow},${e.clueCol}`, e]));
  const letterAt = new Map<string, string>();
  for (const e of puzzle.entries) {
    const dr = e.direction === "down" ? 1 : 0;
    const dc = e.direction === "across" ? 1 : 0;
    for (let i = 0; i < e.word.length; i++) {
      letterAt.set(`${e.row + dr * i},${e.col + dc * i}`, e.word[i]);
    }
  }

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
            const clue = clueAt.get(key);
            if (clue) {
              return (
                <div
                  key={idx}
                  className="bg-neutral-100 flex items-center justify-center"
                  style={{ width: cellPx, height: cellPx }}
                  title={clue.clue}
                  dangerouslySetInnerHTML={{
                    __html:
                      getClueIcon(clue.clue)
                        ? iconToSvg(clue.clue, cellPx * 0.62) ?? ""
                        : "",
                  }}
                />
              );
            }
            const isBlock = !letterAt.has(key);
            return (
              <div
                key={idx}
                className={isBlock ? "bg-neutral-900" : "bg-white border-b border-r border-neutral-300"}
                style={{ width: cellPx, height: cellPx }}
              />
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Vorschau · {puzzle.entries.length} Begriffe · eindeutig lösbar.
      </p>
    </div>
  );
}

export default function SchwedenraetselGenerator() {
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<Puzzle | null>(null);

  const generateOne = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      const p = generateArrowWords(13, undefined, ARROW_WORDS_DE);
      if (p) return p;
    }
    return null;
  }, []);

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
      template_name: "Schwedenrätsel Generator",
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
        <h1 className="text-3xl font-bold tracking-tight">Schwedenrätsel Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Das klassische Bildkreuzworträtsel: Pfeile und Bilder im Gitter
          zeigen zu den Antworten — komplett auf Deutsch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Einstellungen</CardTitle>
            <CardDescription>Jedes Rätsel ist ein Unikat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Papierformat</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSizeKey)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.entries(PAGE_SIZES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setPreview(generateOne())}>
                Neues Rätsel
              </Button>
              <Button onClick={handleDownload} disabled={!preview}>
                PDF erzeugen & herunterladen
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Die Lösung wird als letzte Seite mitgedruckt.
            </p>
          </CardContent>
        </Card>

        <div className="xl:order-first">{preview && <Preview puzzle={preview} />}</div>
      </div>
    </div>
  );
}
