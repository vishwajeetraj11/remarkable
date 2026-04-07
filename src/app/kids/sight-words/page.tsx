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

type GradeLevel = "k" | "1st" | "2nd" | "3rd";

const WORD_BANKS: Record<GradeLevel, string[]> = {
  k: [
    "the", "and", "is", "it", "you", "that", "he", "was", "for", "on",
    "are", "but", "not", "what", "all", "were", "can", "had", "her", "one",
    "said", "do", "she", "have", "we", "my", "like", "will", "up", "go",
  ],
  "1st": [
    "after", "again", "any", "ask", "by", "could", "every", "fly", "from", "give",
    "going", "has", "her", "him", "his", "how", "just", "know", "let", "live",
    "may", "old", "once", "open", "over", "put", "round", "some", "stop", "take",
  ],
  "2nd": [
    "always", "around", "because", "been", "before", "best", "both", "buy", "call", "cold",
    "does", "don't", "fast", "first", "five", "found", "gave", "goes", "green", "its",
    "made", "many", "off", "pull", "read", "right", "sing", "sit", "sleep", "tell",
  ],
  "3rd": [
    "about", "better", "bring", "carry", "clean", "cut", "done", "draw", "drink", "eight",
    "fall", "far", "full", "got", "grow", "hold", "hot", "hurt", "keep", "kind",
    "laugh", "light", "long", "much", "myself", "never", "only", "own", "pick", "seven",
  ],
};

const GRADE_LABELS: Record<GradeLevel, string> = {
  k: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
};

export default function SightWordsPage() {
  const [grade, setGrade] = useState<GradeLevel>("k");
  const [wordsPerPage, setWordsPerPage] = useState(5);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  const previewWords = WORD_BANKS[grade].slice(0, 3);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 36;
    const words = WORD_BANKS[grade];
    let wordIdx = 0;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Sight Words – ${GRADE_LABELS[grade]}  ·  Page ${page + 1}`,
        margin,
        margin + 16,
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("Name: ___________________________", w - margin, margin + 16, {
        align: "right",
      });

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, w - margin, margin + 22);

      const contentTop = margin + 38;
      const contentH = h - contentTop - margin;
      const wordBlockH = contentH / wordsPerPage;

      for (let wi = 0; wi < wordsPerPage; wi++) {
        const word = words[wordIdx % words.length];
        wordIdx++;
        const blockY = contentTop + wi * wordBlockH;

        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(word, margin + 4, blockY + 20);

        const rowStartY = blockY + 32;
        const rowH = (wordBlockH - 36) / 3;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text("Trace:", margin + 4, rowStartY + 4);

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(210, 210, 210);
        doc.text(word, margin + 40, rowStartY + 6);

        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([3, 3], 0);
        const traceLineY = rowStartY + 10;
        doc.line(margin + 40, traceLineY, w - margin - 20, traceLineY);
        doc.setLineDashPattern([], 0);

        const writeY = rowStartY + rowH;
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text("Write:", margin + 4, writeY + 4);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        doc.line(margin + 40, writeY + 10, w - margin - 20, writeY + 10);

        const sentenceY = writeY + rowH;
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text("Sentence:", margin + 4, sentenceY + 4);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        doc.line(margin + 4, sentenceY + 18, w - margin - 20, sentenceY + 18);

        if (wi < wordsPerPage - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.3);
          doc.line(
            margin,
            blockY + wordBlockH - 2,
            w - margin,
            blockY + wordBlockH - 2,
          );
        }
      }
    }

    doc.save(
      `sight-words-${grade}-${wordsPerPage}w-${pageCount}p.pdf`,
    );
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Sight Words Worksheets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Practice reading and writing high-frequency sight words with tracing
          and writing exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Grade level</Label>
          <Select
            value={grade}
            onValueChange={(v) => setGrade(v as GradeLevel)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GRADE_LABELS).map(([k, label]) => (
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
            min={4}
            max={8}
            value={[wordsPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setWordsPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>8</span>
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
              Sight Words – {GRADE_LABELS[grade]}
            </span>
            <span className="text-xs text-muted-foreground">
              Name: ____________
            </span>
          </div>
          <div className="space-y-4">
            {previewWords.map((word, i) => (
              <div key={i} className="border border-border/40 rounded p-3">
                <div className="text-lg font-bold mb-2">{word}</div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0">Trace:</span>
                    <span
                      className="text-base font-bold tracking-widest"
                      style={{
                        color: "#d4d4d4",
                        textShadow: "0 0 0 transparent",
                      }}
                    >
                      {word}
                    </span>
                    <span className="flex-1 border-b border-dashed border-muted-foreground/30" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0">Write:</span>
                    <span className="flex-1 border-b border-muted-foreground/20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0">Sentence:</span>
                    <span className="flex-1 border-b border-muted-foreground/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {WORD_BANKS[grade].length} words available for{" "}
            {GRADE_LABELS[grade]}.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating
          ? "Generating…"
          : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
