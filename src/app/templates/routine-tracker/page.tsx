"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function RoutineTrackerPage() {
  const [habits, setHabits] = useState(8);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const dayLabels =
      variants.weekStart === "sunday"
        ? ["S", "M", "T", "W", "T", "F", "S"]
        : ["M", "T", "W", "T", "F", "S", "S"];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Routine Tracker", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      let y = m.top + 28;
      drawSectionTitle(doc, `Week of: _______________`, m.left + 4, y);

      y += 18;
      const habitColW = bodyW * 0.4;
      const dayColW = (bodyW - habitColW) / 7;
      const rowH = Math.min(24, (h - m.bottom - y - 20) / (habits + 1));

      // Header row
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, y, bodyW, rowH, "F");

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.text("Habit / Routine", m.left + 4, y + rowH / 2 + 2);

      dayLabels.forEach((day, i) => {
        const dx = m.left + habitColW + i * dayColW;
        doc.text(day, dx + dayColW / 2, y + rowH / 2 + 2, { align: "center" });
      });

      doc.setFont("helvetica", "normal");

      // Grid
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, y, bodyW, rowH * (habits + 1), "S");

      // Column lines
      doc.line(m.left + habitColW, y, m.left + habitColW, y + rowH * (habits + 1));
      for (let i = 1; i < 7; i++) {
        const x = m.left + habitColW + i * dayColW;
        doc.line(x, y, x, y + rowH * (habits + 1));
      }

      // Row lines + checkboxes
      const [llr, llg, llb] = COLORS.lineLight;
      for (let r = 1; r <= habits; r++) {
        const ry = y + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);

        // Checkboxes in day columns
        for (let d = 0; d < 7; d++) {
          const cx = m.left + habitColW + d * dayColW + (dayColW - 7) / 2;
          drawCheckbox(doc, cx, ry + (rowH - 7) / 2, 7);
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`routine-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Routine Tracker"
      description="Weekly habit/routine tracker grid with checkboxes for each day."
      showWeekStart
      onGenerate={generate}
      defaultPageCount={4}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Number of habits: {habits}</Label>
          <Slider
            min={3}
            max={15}
            value={[habits]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setHabits(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span><span>15</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>{habits} habit rows x 7 days</div>
          <div>Checkbox grid for daily tracking</div>
          <div>Blank habit name column</div>
        </div>
      )}
    </TemplateShell>
  );
}
