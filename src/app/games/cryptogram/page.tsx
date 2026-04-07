"use client";

import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateCryptogram, CryptogramPuzzle } from "@/lib/generators/cryptogram";
import { type SupportedLanguage, LANGUAGE_LABELS } from "@/lib/languages";
import { CRYPTOGRAM_QUOTES } from "@/lib/languages/cryptogram-quotes";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

type FontSizeOption = "small" | "medium" | "large";

const FONT_SIZES: Record<FontSizeOption, { cipher: number; label: number; hint: number }> = {
  small: { cipher: 11, label: 8, hint: 9 },
  medium: { cipher: 14, label: 10, hint: 11 },
  large: { cipher: 17, label: 12, hint: 13 },
};

// ─── PDF Generation ───────────────────────────────────────────────────────────

function wrapText(text: string, maxWidth: number, doc: jsPDF): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (doc.getTextWidth(test) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCryptogramPuzzle(
  doc: jsPDF,
  puzzle: CryptogramPuzzle,
  pageW: number,
  pageH: number,
  index: number,
  total: number,
  fontSize: FontSizeOption
) {
  const sizes = FONT_SIZES[fontSize];
  const margin = pageW * 0.1;
  const usableW = pageW - margin * 2;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Cryptogram", pageW / 2, margin * 0.6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Puzzle ${index + 1} of ${total}`, pageW / 2, margin * 0.6 + 16, {
    align: "center",
  });

  // Ciphertext
  let cursorY = margin + 20;
  doc.setFont("courier", "bold");
  doc.setFontSize(sizes.cipher);
  doc.setTextColor(20, 20, 20);

  const cipherLines = wrapText(puzzle.ciphertext, usableW, doc);
  const lineHeight = sizes.cipher * 1.4;
  const blankLineGap = sizes.cipher * 1.8;

  for (const line of cipherLines) {
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;

    // Blank line for writing the decoded text
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    const charW = doc.getTextWidth("M");
    const charCount = line.length;
    for (let i = 0; i < charCount; i++) {
      const ch = line[i];
      if (/[A-Z]/.test(ch)) {
        const x = margin + i * charW;
        doc.line(x, cursorY, x + charW * 0.8, cursorY);
      }
    }
    cursorY += blankLineGap;
  }

  // Cipher alphabet reference
  cursorY += 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, margin + usableW, cursorY);
  cursorY += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(sizes.label);
  doc.setTextColor(80, 80, 80);
  doc.text("CIPHER ALPHABET", margin, cursorY);
  cursorY += 14;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const cellW = usableW / 26;
  const cellH = sizes.label * 2.2;

  doc.setFont("courier", "normal");
  doc.setFontSize(sizes.label);

  // Cipher letter row
  doc.setTextColor(20, 20, 20);
  for (let i = 0; i < 26; i++) {
    const x = margin + i * cellW + cellW / 2;
    doc.text(alphabet[i], x, cursorY, { align: "center" });
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin + i * cellW, cursorY + 3, cellW, cellH);
  }
  cursorY += cellH + 6;

  // Empty row for decoded letters
  doc.setTextColor(160, 160, 160);
  for (let i = 0; i < 26; i++) {
    const x = margin + i * cellW + cellW / 2;
    doc.text("?", x, cursorY, { align: "center" });
  }
  cursorY += 20;

  // Hint
  doc.setFont("helvetica", "italic");
  doc.setFontSize(sizes.hint);
  doc.setTextColor(100, 100, 100);
  doc.text(`Hint: ${puzzle.hint}`, margin, cursorY);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.text("Decode each letter to reveal the hidden quote.", pageW / 2, pageH - margin * 0.5, {
    align: "center",
  });
}

function drawAnswerKey(
  doc: jsPDF,
  puzzles: CryptogramPuzzle[],
  startIdx: number,
  endIdx: number,
  pageW: number
) {
  const margin = pageW * 0.1;
  const usableW = pageW - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Answer Keys", pageW / 2, margin * 0.55, { align: "center" });

  let cursorY = margin + 10;

  for (let i = startIdx; i < endIdx; i++) {
    const puzzle = puzzles[i];

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, margin + usableW, cursorY);
    cursorY += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Puzzle ${i + 1}`, margin, cursorY);
    cursorY += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const quoteLines = wrapText(`"${puzzle.plaintext}"`, usableW, doc);
    for (const line of quoteLines) {
      doc.text(line, margin, cursorY);
      cursorY += 14;
    }
    cursorY += 6;

    // Key mapping
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const mappingLine = alphabet
      .split("")
      .map((ch) => `${puzzle.key[ch]}→${ch}`)
      .join(" ");
    const mappingLines = wrapText(mappingLine, usableW, doc);
    for (const line of mappingLines) {
      doc.text(line, margin, cursorY);
      cursorY += 11;
    }
    cursorY += 14;
  }
}

function generatePDF(
  puzzles: CryptogramPuzzle[],
  pageSize: PageSizeKey,
  fontSize: FontSizeOption
) {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  // Puzzle pages
  puzzles.forEach((puzzle, idx) => {
    if (idx > 0) doc.addPage([pageW, pageH]);
    drawCryptogramPuzzle(doc, puzzle, pageW, pageH, idx, puzzles.length, fontSize);
  });

  // Answer key pages (up to 3 answers per page)
  const answersPerPage = 3;
  const totalAnswerPages = Math.ceil(puzzles.length / answersPerPage);

  for (let p = 0; p < totalAnswerPages; p++) {
    doc.addPage([pageW, pageH]);
    const start = p * answersPerPage;
    const end = Math.min(start + answersPerPage, puzzles.length);
    drawAnswerKey(doc, puzzles, start, end, pageW);
  }

  doc.save(`cryptogram-${puzzles.length}puzzles.pdf`);
}

// ─── Preview Component ────────────────────────────────────────────────────────

function CryptogramPreview({ puzzle }: { puzzle: CryptogramPuzzle }) {
  const width = 360;
  const height = 260;
  const charW = 10;
  const lineY = 40;
  const maxCharsPerLine = Math.floor((width - 20) / charW);

  const lines: string[] = [];
  const words = puzzle.ciphertext.split(" ");
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const displayLines = lines.slice(0, 4);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-[360px] h-auto border-2 border-foreground bg-white"
      role="img"
      aria-label="Cryptogram puzzle preview"
    >
      <rect x="0" y="0" width={width} height={height} fill="white" />

      {displayLines.map((line, lineIdx) => {
        const y = lineY + lineIdx * 50;
        return (
          <g key={lineIdx}>
            {line.split("").map((ch, ci) => {
              const x = 10 + ci * charW;
              const isLetter = /[A-Z]/.test(ch);
              return (
                <g key={ci}>
                  <text
                    x={x + charW / 2}
                    y={y}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="#111"
                    fontFamily="ui-monospace, monospace"
                  >
                    {ch}
                  </text>
                  {isLetter && (
                    <line
                      x1={x + 1}
                      y1={y + 14}
                      x2={x + charW - 1}
                      y2={y + 14}
                      stroke="#d4d4d8"
                      strokeWidth={1}
                    />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {displayLines.length < lines.length && (
        <text
          x={width / 2}
          y={height - 16}
          textAnchor="middle"
          fontSize={11}
          fill="#a1a1aa"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          … continued on PDF
        </text>
      )}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function pickRandomQuote(lang: SupportedLanguage): string | undefined {
  const quotes = CRYPTOGRAM_QUOTES[lang];
  if (!quotes || quotes.length === 0) return undefined;
  return quotes[Math.floor(Math.random() * quotes.length)].text;
}

export default function CryptogramPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [numPuzzles, setNumPuzzles] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [fontSize, setFontSize] = useState<FontSizeOption>("medium");
  const [previewPuzzle, setPreviewPuzzle] = useState<CryptogramPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    setPreviewPuzzle(generateCryptogram(pickRandomQuote(language)));
  }, [language]);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzles: CryptogramPuzzle[] = Array.from(
          { length: numPuzzles },
          () => generateCryptogram(pickRandomQuote(language))
        );
        generatePDF(puzzles, pageSize, fontSize);
        setPreviewPuzzle(puzzles[0]);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cryptogram Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Decode encrypted quotes by cracking the letter substitution cipher. Each
          PDF includes hints and answer keys on the final pages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your puzzle before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language */}
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of puzzles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Puzzles</Label>
                <span className="text-sm font-semibold tabular-nums">{numPuzzles}</span>
              </div>
              <Slider
                min={1}
                max={6}
                value={[numPuzzles]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setNumPuzzles(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>6</span>
              </div>
            </div>

            {/* Page size */}
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select
                value={pageSize}
                onValueChange={(v) => setPageSize(v as PageSizeKey)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">{PAGE_SIZES.A4.label}</SelectItem>
                  <SelectItem value="Letter">{PAGE_SIZES.Letter.label}</SelectItem>
                  <SelectItem value="eInk">{PAGE_SIZES.eInk.label}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font size */}
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={fontSize}
                onValueChange={(v) => setFontSize(v as FontSizeOption)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating…" : "Generate & Download PDF"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="h-fit">
          <CardHeader className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Preview</CardTitle>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={regeneratePreview}>
                Regenerate
              </Button>
            </div>
            <CardDescription>Sample encrypted quote</CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center pt-0 pb-6">
            {previewPuzzle ? (
              <CryptogramPreview puzzle={previewPuzzle} />
            ) : (
              <div className="flex aspect-video w-full max-w-[360px] items-center justify-center border-2 border-dashed border-border text-muted-foreground text-sm">
                Generating…
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
