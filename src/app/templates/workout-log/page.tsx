"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

// Number of weighted "set" columns in the main exercise grid. Each set cell is
// sized to write a "weight × reps" entry.
const SET_COLS = 4;

export default function WorkoutLogPage() {
  const [exerciseRows, setExerciseRows] = useState(9);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Each page is ONE gym session (vs fitness-planner's whole-week grid).
    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Workout Log",
        subtitle: `Session ${page + 1}`,
        dark: true,
      });

      const [lmR, lmG, lmB] = COLORS.lineMedium;
      const [llR, llG, llB] = COLORS.lineLight;
      const [hbR, hbG, hbB] = COLORS.headerBg;
      const [tmR, tmG, tmB] = COLORS.textMedium;
      const [tlR, tlG, tlB] = COLORS.textLight;
      const [blR, blG, blB] = COLORS.black;

      let y = m.top + 44;

      // ── Session header fields: Date / Focus / time / bodyweight ──────────
      const fieldGap = 12;
      const colA = m.left + 4;
      const colB = m.left + bodyW * 0.5 + 4;
      const half = m.left + bodyW * 0.5;

      drawLabeledLine(doc, "Date:", colA, y, half - 8);
      drawLabeledLine(doc, "Day / Focus:", colB, y, w - m.right - 4);
      y += fieldGap + 4;

      drawLabeledLine(doc, "Start:", colA, y, m.left + bodyW * 0.25 - 4);
      drawLabeledLine(doc, "End:", m.left + bodyW * 0.25 + 4, y, half - 8);
      drawLabeledLine(doc, "Bodyweight:", colB, y, m.left + bodyW * 0.78);
      drawLabeledLine(doc, "Energy:", m.left + bodyW * 0.8, y, w - m.right - 4);
      y += fieldGap + 6;

      // ── Warm-up line ─────────────────────────────────────────────────────
      drawSectionTitle(doc, "Warm-up", m.left, y);
      y += 4;
      drawLabeledLine(doc, "", colA, y, w - m.right - 4);
      y += fieldGap + 4;

      // ── Main exercise grid ───────────────────────────────────────────────
      drawSectionTitle(doc, "Workout", m.left, y);
      y += 6;

      // Reserve space at the bottom for cardio/finisher + notes.
      const bottomReserve = 96;
      const gridTop = y;
      const headerH = 16;
      const gridAvail = h - m.bottom - gridTop - headerH - bottomReserve - 12;
      const rowH = Math.min(
        Math.max(gridAvail / exerciseRows, 18),
        30
      );
      const gridH = headerH + exerciseRows * rowH;

      // Column layout: Exercise | Set 1..4 (weight × reps) | Notes
      const exerciseW = bodyW * 0.26;
      const notesW = bodyW * 0.18;
      const setsW = bodyW - exerciseW - notesW;
      const setColW = setsW / SET_COLS;

      // Header band
      doc.setFillColor(hbR, hbG, hbB);
      doc.rect(m.left, gridTop, bodyW, headerH, "F");
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(tmR, tmG, tmB);
      doc.text("Exercise", m.left + 4, gridTop + 11);
      for (let s = 0; s < SET_COLS; s++) {
        const cx = m.left + exerciseW + s * setColW + setColW / 2;
        doc.text(`Set ${s + 1}`, cx, gridTop + 7, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4.5);
        doc.setTextColor(tlR, tlG, tlB);
        doc.text("wt × reps", cx, gridTop + 13, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(tmR, tmG, tmB);
      }
      doc.text("Notes", m.left + exerciseW + setsW + 4, gridTop + 11);
      doc.setFont("helvetica", "normal");

      // Outer border
      doc.setDrawColor(lmR, lmG, lmB);
      doc.setLineWidth(0.4);
      doc.rect(m.left, gridTop, bodyW, gridH, "S");

      // Vertical separators (exercise edge, each set edge, notes edge)
      doc.setDrawColor(lmR, lmG, lmB);
      doc.setLineWidth(0.4);
      doc.line(m.left + exerciseW, gridTop, m.left + exerciseW, gridTop + gridH);
      doc.line(
        m.left + exerciseW + setsW,
        gridTop,
        m.left + exerciseW + setsW,
        gridTop + gridH
      );
      doc.setDrawColor(llR, llG, llB);
      doc.setLineWidth(0.3);
      for (let s = 1; s < SET_COLS; s++) {
        const cx = m.left + exerciseW + s * setColW;
        doc.line(cx, gridTop + headerH, cx, gridTop + gridH);
      }

      // Row separators
      for (let r = 0; r < exerciseRows; r++) {
        const ry = gridTop + headerH + (r + 1) * rowH;
        if (r < exerciseRows - 1) {
          doc.setDrawColor(llR, llG, llB);
          doc.setLineWidth(0.3);
          doc.line(m.left, ry, w - m.right, ry);
        }
      }

      // ── Cardio / finisher ────────────────────────────────────────────────
      let by = gridTop + gridH + 12;
      drawSectionTitle(doc, "Cardio / Finisher", m.left, by);
      by += 4;
      drawLabeledLine(doc, "", colA, by, m.left + bodyW * 0.62);
      drawLabeledLine(doc, "Time / Dist:", m.left + bodyW * 0.64, by, w - m.right - 4);
      by += 14;

      // ── Notes / How it felt ──────────────────────────────────────────────
      drawSectionTitle(doc, "Notes / How it felt", m.left, by);
      by += 6;
      const notesBoxBottom = h - m.bottom - 8;
      doc.setDrawColor(lmR, lmG, lmB);
      doc.setLineWidth(0.4);
      doc.rect(m.left, by, bodyW, notesBoxBottom - by, "S");
      // ruled lines inside the notes box
      doc.setDrawColor(llR, llG, llB);
      doc.setLineWidth(0.25);
      for (let ly = by + 16; ly < notesBoxBottom - 4; ly += 16) {
        doc.line(m.left + 4, ly, w - m.right - 4, ly);
      }

      doc.setTextColor(blR, blG, blB);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`workout-log-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Workout Log"
      description="Per-session gym log: one workout per page with session header, warm-up, a sets/reps/weight grid, and a cardio + notes area."
      onGenerate={generate}
      defaultPageCount={4}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Exercise rows: {exerciseRows}</Label>
          <Slider
            min={6}
            max={12}
            value={[exerciseRows]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setExerciseRows(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>6</span>
            <span>12</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>One gym session per page</div>
          <div>Date / Focus / time / bodyweight header</div>
          <div>Warm-up + {exerciseRows}-row exercise grid (4 sets, wt × reps)</div>
          <div>Cardio / finisher + notes area</div>
        </div>
      )}
    </TemplateShell>
  );
}
