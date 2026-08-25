"use client";

import { useState, useCallback } from "react";
import { savePdf } from "@/lib/download-tracker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateWordScramble, WordScramblePuzzle } from "@/lib/generators/word-scramble";
import { type SupportedLanguage, LANGUAGE_LABELS } from "@/lib/languages";
import { WORD_SCRAMBLE_BANKS } from "@/lib/languages/word-scramble-words";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

function AnswerBlanks({ word }: { word: string }) {
  return (
    <span className="inline-flex gap-1 ml-2">
      {word.split("").map((_, i) => (
        <span
          key={i}
          className="inline-block border-b-2 border-foreground"
          style={{ width: 16, height: 20 }}
        />
      ))}
    </span>
  );
}

function WordScramblePreview({ puzzle }: { puzzle: WordScramblePuzzle }) {
  const { scrambles } = puzzle;
  return (
    <ol className="space-y-4">
      {scrambles.map((entry, i) => (
        <li key={i} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-6 shrink-0">{i + 1}.</span>
            <span className="font-mono text-lg font-bold tracking-widest">
              {entry.scrambled}
            </span>
            <AnswerBlanks word={entry.answer} />
          </div>
          <p className="text-xs text-muted-foreground ml-9">Hint: {entry.hint}</p>
        </li>
      ))}
    </ol>
  );
}

async function downloadPDF(
  puzzle: WordScramblePuzzle,
  pageSizeKey: PageSizeKey,
  difficulty: string,
  category: string
) {
  const { jsPDF } = await import("jspdf");
  const ps = PAGE_SIZES[pageSizeKey];
  const doc = new jsPDF({ unit: "pt", format: [ps.w, ps.h] });
  const margin = 40;

  const drawPage = (answerKey: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Word Scramble", ps.w / 2, margin, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Difficulty: ${difficulty}  |  Category: ${category}`,
      ps.w / 2,
      margin + 16,
      { align: "center" }
    );

    if (answerKey) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("— Answer Key —", ps.w / 2, margin + 30, { align: "center" });
    }

    doc.setTextColor(0, 0, 0);

    let y = margin + (answerKey ? 50 : 40);

    for (let i = 0; i < puzzle.scrambles.length; i++) {
      const entry = puzzle.scrambles[i];

      if (y > ps.h - margin - 30) {
        doc.addPage();
        y = margin;
      }

      // Number
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${i + 1}.`, margin, y);

      // Scrambled word
      doc.setFont("courier", "bold");
      doc.setFontSize(13);
      doc.text(entry.scrambled, margin + 18, y);

      if (answerKey) {
        // Show answer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 180);
        doc.text(`→ ${entry.answer}`, margin + 18 + entry.scrambled.length * 8.5 + 8, y);
        doc.setTextColor(0, 0, 0);
      } else {
        // Draw blank lines for each letter
        const blankStart = margin + 18 + entry.scrambled.length * 8.5 + 16;
        const blankW = 12;
        const blankGap = 4;
        for (let j = 0; j < entry.answer.length; j++) {
          const bx = blankStart + j * (blankW + blankGap);
          doc.setDrawColor(60, 60, 60);
          doc.setLineWidth(0.8);
          doc.line(bx, y + 2, bx + blankW, y + 2);
        }
      }

      // Hint
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`Hint: ${entry.hint}`, margin + 18, y + 11);
      doc.setTextColor(0, 0, 0);

      y += 30;
    }
  };

  // Page 1: puzzle
  drawPage(false);

  // Page 2: answer key
  doc.addPage();
  drawPage(true);

  savePdf(doc, "word-scramble.pdf");
}

const COUNT_OPTIONS = [10, 15, 20, 25, 30];

export default function WordScramblePage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("everyday");
  const [count, setCount] = useState(15);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [puzzle, setPuzzle] = useState<WordScramblePuzzle | null>(null);
  const [generating, setGenerating] = useState(false);

  const createPuzzle = useCallback(() => {
    if (language === "en") {
      return generateWordScramble(difficulty, category, count);
    }

    const bank = WORD_SCRAMBLE_BANKS[language];
    const filtered =
      category === "everyday"
        ? bank
        : bank.filter((word) => word.category === category);
    const pool = (filtered.length > 0 ? filtered : bank).map((word) => ({
      word: word.word,
      hint: word.hint,
    }));
    return generateWordScramble(difficulty, category, count, pool);
  }, [difficulty, category, count, language]);

  const handleGeneratePreview = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      setPuzzle(createPuzzle());
      setGenerating(false);
    }, 0);
  }, [createPuzzle]);

  const handleGenerateAndDownload = useCallback(async () => {
    setGenerating(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const nextPuzzle = createPuzzle();
      setPuzzle(nextPuzzle);
      await downloadPDF(nextPuzzle, pageSize, difficulty, category);
    } finally {
      setGenerating(false);
    }
  }, [createPuzzle, pageSize, difficulty, category]);

  const handleDownloadCurrent = useCallback(async () => {
    if (!puzzle) return;
    await downloadPDF(puzzle, pageSize, difficulty, category);
  }, [puzzle, pageSize, difficulty, category]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Word Scramble</h1>
        <p className="mt-2 text-muted-foreground">
          Unscramble jumbled letters to find the hidden words.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Language</label>
          <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (4-5 letters)</SelectItem>
              <SelectItem value="medium">Medium (6-7 letters)</SelectItem>
              <SelectItem value="hard">Hard (8+ letters)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyday">Everyday</SelectItem>
              <SelectItem value="animals">Animals</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="science">Science</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Count</label>
          <Select
            value={String(count)}
            onValueChange={(v) => setCount(Number(v))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNT_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} words
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Page Size</label>
          <Select
            value={pageSize}
            onValueChange={(v) => setPageSize(v as PageSizeKey)}
          >
            <SelectTrigger className="w-36">
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

        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleGeneratePreview}
              disabled={generating}
            >
              {puzzle ? "Create new preview" : "Create preview"}
            </Button>
            <Button onClick={handleGenerateAndDownload} disabled={generating}>
              {generating ? "Generating PDF…" : "Generate & Download PDF"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free PDF · No signup · Works with reMarkable, Supernote, BOOX,
            and standard printers.
          </p>
        </div>
      </div>

      {puzzle && (
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Preview
          </h2>
          <WordScramblePreview puzzle={puzzle} />
        </div>
      )}

      {puzzle && (
        <div className="sticky bottom-4 z-20 flex justify-end">
          <div className="flex flex-wrap items-center justify-end gap-3 border border-border bg-background p-2 shadow-md">
            <span className="pl-2 text-sm text-muted-foreground">Preview ready</span>
            <Button onClick={handleDownloadCurrent}>Download this preview PDF</Button>
          </div>
        </div>
      )}

      {!puzzle && (
        <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground text-sm">
          Create a preview, or generate and download the finished PDF immediately.
        </div>
      )}
    </div>
  );
}
