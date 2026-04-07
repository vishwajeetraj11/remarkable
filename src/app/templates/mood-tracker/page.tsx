"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const MOODS = ["Great", "Good", "Okay", "Low", "Bad"];

export default function MoodTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Mood Tracker", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      doc.setFontSize(7);
      const [tl, tlg, tlb] = COLORS.textLight;
      doc.setTextColor(tl, tlg, tlb);
      doc.text("Month: ______________", w - m.right - 90, m.top + 16);

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      // Grid: 31 days x mood levels
      const gridTop = m.top + 32;
      const dayColW = 12;
      const moodLabelW = bodyW - 31 * dayColW;
      const rowH = 16;
      const gridH = MOODS.length * rowH;

      // Y-axis labels (moods)
      const [tr, tg, tb] = COLORS.textMedium;
      MOODS.forEach((mood, i) => {
        const ry = gridTop + i * rowH + rowH / 2 + 2;
        doc.setFontSize(6.5);
        doc.setTextColor(tr, tg, tb);
        doc.text(mood, m.left + 2, ry);
      });

      // Grid area
      const gridLeft = m.left + moodLabelW;
      const gridW = 31 * dayColW;

      // Horizontal grid lines
      for (let r = 0; r <= MOODS.length; r++) {
        const ry = gridTop + r * rowH;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(r === 0 ? 0.5 : 0.2);
        doc.line(gridLeft, ry, gridLeft + gridW, ry);
      }

      // Vertical grid lines + day numbers
      for (let d = 0; d <= 31; d++) {
        const dx = gridLeft + d * dayColW;
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(dx, gridTop, dx, gridTop + gridH);

        if (d < 31) {
          doc.setFontSize(5.5);
          doc.setTextColor(tr, tg, tb);
          doc.text(String(d + 1), dx + dayColW / 2, gridTop - 3, { align: "center" });
        }
      }

      // Outer border
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(gridLeft, gridTop, gridW, gridH, "S");

      // Notes section below
      const notesY = gridTop + gridH + 20;
      drawSectionTitle(doc, "Patterns & Notes", m.left + 4, notesY);
      drawHorizontalLines(doc, variants, {
        startY: notesY + 4,
        endY: h - m.bottom,
        spacing: 18,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`mood-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Mood Tracker"
      description="Monthly mood grid (31 days x 5 mood levels) with patterns and notes section."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>31-day grid with 5 mood levels</div>
          <div>Mark daily mood in grid</div>
          <div>Patterns & notes area below</div>
        </div>
      )}
    </TemplateShell>
  );
}
