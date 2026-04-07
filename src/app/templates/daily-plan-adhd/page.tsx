"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawCheckbox,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function DailyPlanAdhdPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      // Large, simple header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Today's Plan", m.left + 4, m.top + 18);
      doc.setFont("helvetica", "normal");
      drawLabeledLine(doc, "Date:", m.left + bodyW * 0.55, m.top + 18, w - m.right - 4);

      let y = m.top + 32;

      // Energy check — simple
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, y, w - m.right, y);
      y += 14;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.text("Energy level:   Low  ○   ○   ○   ○   ○  High", m.left + 4, y);
      doc.setFont("helvetica", "normal");

      y += 18;
      doc.setDrawColor(lr, lg, lb);
      doc.line(m.left, y, w - m.right, y);

      // THE ONE THING — large and prominent
      y += 16;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      doc.text("THE ONE THING", m.left + 4, y);
      y += 6;
      const [llr, llg, llb] = COLORS.lineLight;
      doc.setDrawColor(llr, llg, llb);
      doc.setLineWidth(0.4);
      doc.line(m.left + 4, y + 16, w - m.right - 4, y + 16);
      doc.line(m.left + 4, y + 34, w - m.right - 4, y + 34);

      // Must Do (3 items max)
      y += 48;
      drawSectionTitle(doc, "Must Do (max 3)", m.left + 4, y);
      y += 12;
      for (let i = 0; i < 3; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 26, 10);
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 22, y + i * 26 + 10, w - m.right - 4, y + i * 26 + 10);
      }

      // Could Do
      y += 88;
      drawSectionTitle(doc, "Could Do", m.left + 4, y);
      y += 12;
      for (let i = 0; i < 4; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 22, 8);
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 20, y + i * 22 + 8, w - m.right - 4, y + i * 22 + 8);
      }

      // Parking lot
      y += 100;
      if (y < h - m.bottom - 40) {
        drawSectionTitle(doc, "Parking Lot (not today)", m.left + 4, y);
        y += 10;
        while (y + 18 < h - m.bottom) {
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.2);
          doc.line(m.left + 4, y + 10, w - m.right - 4, y + 10);
          y += 18;
        }
      }

      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`daily-plan-adhd-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Low-Friction Daily Plan"
      description="ADHD-friendly daily page: energy check, one big thing, max 3 must-dos, and a parking lot for later."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Energy level check</div>
          <div>THE ONE THING (large, prominent)</div>
          <div>Max 3 must-do tasks</div>
          <div>Could-do list</div>
          <div>Parking lot for deferred items</div>
        </div>
      )}
    </TemplateShell>
  );
}
