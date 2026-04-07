"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  drawPageNumber,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState(10);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Habit Tracker", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      doc.setFontSize(7);
      const [tr, tg, tb] = COLORS.textLight;
      doc.setTextColor(tr, tg, tb);
      doc.text("Month: ______________", w - m.right - 90, m.top + 16);

      const gridTop = m.top + 28;
      const habitColW = bodyW * 0.28;
      const dayColW = (bodyW - habitColW) / 31;
      const rowH = Math.min(22, (h - m.bottom - gridTop - 10) / (habits + 1));

      // Header with day numbers
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, gridTop, bodyW, rowH, "F");

      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      const [tmr, tmg, tmb] = COLORS.textMedium;
      doc.setTextColor(tmr, tmg, tmb);
      doc.text("Habit", m.left + 4, gridTop + rowH / 2 + 2);

      for (let d = 1; d <= 31; d++) {
        const dx = m.left + habitColW + (d - 1) * dayColW;
        doc.text(String(d), dx + dayColW / 2, gridTop + rowH / 2 + 2, {
          align: "center",
        });
      }
      doc.setFont("helvetica", "normal");

      // Grid
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, gridTop, bodyW, rowH * (habits + 1), "S");
      doc.line(m.left + habitColW, gridTop, m.left + habitColW, gridTop + rowH * (habits + 1));

      // Day column lines
      for (let d = 1; d < 31; d++) {
        const x = m.left + habitColW + d * dayColW;
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(x, gridTop, x, gridTop + rowH * (habits + 1));
      }

      // Row lines + checkboxes
      const [llr, llg, llb] = COLORS.lineLight;
      for (let r = 1; r <= habits; r++) {
        const ry = gridTop + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);

        for (let d = 0; d < 31; d++) {
          const cx = m.left + habitColW + d * dayColW;
          const boxSize = Math.min(dayColW - 2, rowH - 6);
          drawCheckbox(
            doc,
            cx + (dayColW - boxSize) / 2,
            ry + (rowH - boxSize) / 2,
            boxSize
          );
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`habit-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Habit Tracker"
      description="Monthly grid with 31 day columns and customizable habit rows with checkboxes."
      onGenerate={generate}
      defaultPageCount={3}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Number of habits: {habits}</Label>
          <Slider
            min={3}
            max={20}
            value={[habits]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setHabits(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span><span>20</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>{habits} habits x 31 days</div>
          <div>Checkbox grid per day</div>
          <div>Blank habit name column</div>
        </div>
      )}
    </TemplateShell>
  );
}
