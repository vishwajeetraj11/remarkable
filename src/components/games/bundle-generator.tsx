"use client";

import { useState, useCallback } from "react";
import { savePdf } from "@/lib/download-tracker";
import jsPDF from "jspdf";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";

import {
  BUNDLE_ADAPTERS,
  generateWithRetry,
  safeDraw,
  safeDrawAnswer,
} from "@/lib/bundles/adapters";

const PAGE_SIZES: Record<string, [number, number]> = {
  "A4 (595 × 842)": [595.28, 841.89],
  "Letter (612 × 792)": [612, 792],
  "reMarkable 2 / Paper Pure / Supernote / BOOX (1404 × 1872)": [495.72, 661.68],
  "reMarkable Paper Pro (1620 × 2160)": [571.68, 762.48],
  "Kindle Scribe (1860 × 2480)": [656.16, 874.88],
};

const MARGIN = 40;

function pageTitle(
  doc: jsPDF,
  title: string,
  pw: number,
  subtitle?: string,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, pw / 2, 60, { align: "center" });
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(subtitle, pw / 2, 80, { align: "center" });
  }
}

function sectionHeader(doc: jsPDF, title: string, pw: number) {
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, pw / 2, 60, { align: "center" });
  doc.setDrawColor(180);
  doc.line(MARGIN, 70, pw - MARGIN, 70);
}

export default function BundleGenerator() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(BUNDLE_ADAPTERS.map((a) => a.id)),
  );
  const [perType, setPerType] = useState(2);
  const [pageSize, setPageSize] = useState("A4 (595 × 842)");
  const [generating, setGenerating] = useState(false);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selected.size === 0) return;
    setGenerating(true);

    // Yield to let the UI show the loading state
    await new Promise((r) => setTimeout(r, 50));

    try {
      const [pw, ph] = PAGE_SIZES[pageSize];
      const ctx = { pw, ph };
      const doc = new jsPDF({ unit: "pt", format: [pw, ph] });

      const adapters = BUNDLE_ADAPTERS.filter((a) => selected.has(a.id));

      // Generate every puzzle up front; the same instances feed both the
      // puzzle pages and their matching answer keys.
      const generated = adapters.map((adapter) => ({
        adapter,
        puzzles: Array.from({ length: perType }, () =>
          generateWithRetry(adapter),
        ).filter((p) => p !== null),
      }));

      // Title page
      pageTitle(
        doc,
        "Puzzle Bundle",
        pw,
        `${adapters.length} puzzle types · ${perType} each`,
      );
      let cy = 100;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const a of adapters) {
        doc.text(`• ${a.label}`, pw / 2 - 60, cy);
        cy += 16;
      }

      // Render each type. A failing renderer error is isolated on a fresh
      // page so later puzzles stay intact.
      for (const { adapter, puzzles } of generated) {
        sectionHeader(doc, `${adapter.label} Puzzles`, pw);
        puzzles.forEach((puzzle, i) => safeDraw(doc, adapter, puzzle, ctx, i));
      }

      // Answer keys
      doc.addPage();
      pageTitle(doc, "Answer Keys", pw);
      let acy = 100;

      for (const { adapter, puzzles } of generated) {
        puzzles.forEach((puzzle, i) => {
          acy = safeDrawAnswer(doc, adapter, puzzle, ctx, acy, i);
        });
      }

      savePdf(doc, "puzzle-bundle.pdf");
    } finally {
      setGenerating(false);
    }
  }, [selected, perType, pageSize]);

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>Puzzle Bundle</CardTitle>
        <CardDescription>
          Generate a mixed puzzle book with multiple puzzle types in one PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Puzzle type checkboxes */}
        <div>
          <Label className="mb-3">Puzzle types to include</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {BUNDLE_ADAPTERS.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent/40 transition-colors has-checked:bg-accent/60"
              >
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggle(a.id)}
                  className="accent-primary size-4"
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        {/* Puzzles per type */}
        <div className="space-y-2">
          <Label>
            Puzzles per type: <span className="font-mono">{perType}</span>
          </Label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[perType]}
            onValueChange={(v) => setPerType(Array.isArray(v) ? v[0] : v)}
          />
        </div>

        {/* Page size */}
        <div className="space-y-2">
          <Label>Page size</Label>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PAGE_SIZES).map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate button */}
        <Button
          size="lg"
          disabled={generating || selected.size === 0}
          onClick={handleGenerate}
          className="w-full sm:w-auto"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <FileDown />
              Generate & Download Puzzle Bundle PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
