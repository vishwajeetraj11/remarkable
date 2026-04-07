"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

type Difficulty = "easy" | "medium" | "hard";

const WORD_LISTS: Record<Difficulty, string[]> = {
  easy: [
    "cat", "dog", "run", "big", "sun", "hat", "bed", "pig", "cup", "sit",
    "hop", "red", "pen", "map", "top", "bug", "fan", "log", "net", "zip",
    "jam", "mud", "van", "wet", "box",
  ],
  medium: [
    "house", "plant", "river", "cloud", "happy", "tiger", "water", "paper",
    "candy", "robot", "music", "lemon", "table", "green", "sleep", "train",
    "beach", "stone", "light", "dream", "smile", "brave", "climb", "flame",
    "ocean",
  ],
  hard: [
    "rainbow", "kitchen", "blanket", "explore", "exciting", "mountain",
    "discover", "elephant", "together", "birthday", "tomorrow", "friendly",
    "practice", "remember", "complete", "surprise", "treasure", "actually",
    "dinosaur", "building", "sandwich", "umbrella", "pumpkin", "champion",
    "notebook",
  ],
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy (3–4 letters)",
  medium: "Medium (5–6 letters)",
  hard: "Hard (7+ letters)",
};

export default function SpellingPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [wordsPerPage, setWordsPerPage] = useState(10);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  const previewWords = WORD_LISTS[difficulty].slice(0, 4);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 36;
    const words = WORD_LISTS[difficulty];
    let wordIdx = 0;

    const allPageWords: string[][] = [];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const pageWords: string[] = [];

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Spelling Practice – ${DIFFICULTY_LABELS[difficulty]}  ·  Page ${page + 1}`,
        margin,
        margin + 16,
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Name: ___________________________   Score: ______ / " + wordsPerPage,
        w - margin,
        margin + 16,
        { align: "right" },
      );

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, w - margin, margin + 22);

      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(140, 140, 140);
      doc.text(
        "Look at the word · Cover it · Write in the boxes · Check your spelling",
        margin,
        margin + 34,
      );

      const contentTop = margin + 44;
      const contentH = h - contentTop - margin;
      const rowH = contentH / wordsPerPage;
      const boxSize = Math.min(18, rowH * 0.5);
      const boxGap = 2;

      for (let wi = 0; wi < wordsPerPage; wi++) {
        const word = words[wordIdx % words.length];
        pageWords.push(word);
        wordIdx++;
        const rowY = contentTop + wi * rowH;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 140, 140);
        doc.text(`${wi + 1}.`, margin + 2, rowY + boxSize * 0.7);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(word, margin + 18, rowY + boxSize * 0.7);

        const wordWidth = doc.getTextWidth(word);
        const boxStartX = margin + 24 + wordWidth + 16;

        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(0.6);
        for (let li = 0; li < word.length; li++) {
          const bx = boxStartX + li * (boxSize + boxGap);
          if (bx + boxSize > w - margin) break;
          doc.rect(bx, rowY + 2, boxSize, boxSize, "S");
        }

        const practiceLineY = rowY + boxSize + 8;
        const lineAvailable = rowH - boxSize - 12;
        if (lineAvailable > 4) {
          doc.setDrawColor(210, 210, 210);
          doc.setLineWidth(0.3);
          doc.line(
            margin + 18,
            practiceLineY,
            w - margin - 10,
            practiceLineY,
          );
          doc.setFontSize(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(190, 190, 190);
          doc.text("write the word:", margin + 18, practiceLineY - 2);
        }

        if (wi < wordsPerPage - 1) {
          doc.setDrawColor(240, 240, 240);
          doc.setLineWidth(0.2);
          doc.line(margin, rowY + rowH - 1, w - margin, rowY + rowH - 1);
        }
      }

      allPageWords.push(pageWords);
    }

    doc.addPage();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Key", margin, margin + 16);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 22, w - margin, margin + 22);

    const ansColW = (w - margin * 2) / 4;

    allPageWords.forEach((pageWords, pageIdx) => {
      const blockStartY =
        margin + 40 + pageIdx * (Math.ceil(wordsPerPage / 4) * 16 + 20);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pageIdx + 1}:`, margin, blockStartY);

      pageWords.forEach((word, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = margin + col * ansColW;
        const y = blockStartY + 12 + row * 16;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(
          `${i + 1}. ${word.split("").join(" ")}`,
          x,
          y,
        );
      });
    });

    doc.save(`spelling-${difficulty}-${wordsPerPage}w-${pageCount}p.pdf`);
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Spelling Practice Sheets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Structured spelling practice with letter boxes and writing lines for
          various difficulty levels.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTY_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Words per page: {wordsPerPage}</Label>
          <Slider
            min={8}
            max={15}
            value={[wordsPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setWordsPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>8</span>
            <span>15</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Worksheet pages: {pageCount}</Label>
          <Slider
            min={1}
            max={10}
            value={[pageCount]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setPageCount(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select
            value={pageSize}
            onValueChange={(v) => setPageSize(v as PageSizeKey)}
          >
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
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
          Preview
        </h2>
        <div className="border border-border rounded-xl bg-white p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-sm font-semibold">
              Spelling – {DIFFICULTY_LABELS[difficulty]}
            </span>
            <span className="text-xs text-muted-foreground">
              Name: ____________ Score: __ / {wordsPerPage}
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic mb-3">
            Look at the word · Cover it · Write in the boxes · Check your
            spelling
          </p>
          <div className="space-y-3">
            {previewWords.map((word, i) => (
              <div
                key={i}
                className="border border-border/40 rounded p-3 flex items-center gap-4"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0">
                  {i + 1}.
                </span>
                <span className="font-bold text-sm w-20 shrink-0">{word}</span>
                <div className="flex gap-0.5">
                  {word.split("").map((_, li) => (
                    <div
                      key={li}
                      className="w-6 h-6 border border-muted-foreground/40 rounded-sm"
                    />
                  ))}
                </div>
                <span className="flex-1 border-b border-muted-foreground/15 ml-2" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Answer key included on the last page.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating
          ? "Generating…"
          : `Generate & Download PDF (${pageCount} sheet${pageCount > 1 ? "s" : ""} + answer key)`}
      </Button>
    </div>
  );
}
