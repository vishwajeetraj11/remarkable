"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawCheckbox,
  drawHorizontalLines,
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

export default function DailyFocusPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Daily Focus" });

      let y = m.top + 44;

      // Date and theme line
      drawLabeledLine(doc, "Date:", m.left + 4, y, m.left + bodyW * 0.4);
      drawLabeledLine(doc, "Theme:", m.left + bodyW * 0.45, y, w - m.right - 4);

      // Top 3 priorities
      y += 22;
      drawSectionTitle(doc, "Top 3 Priorities", m.left + 4, y);
      y += 12;
      for (let i = 0; i < 3; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 24, 9);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 20, y + i * 24 + 9, w - m.right - 4, y + i * 24 + 9);
      }

      // Tasks
      y += 84;
      drawSectionTitle(doc, "Tasks", m.left + 4, y);
      y += 12;
      const taskCount = 8;
      for (let i = 0; i < taskCount; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 20, 7);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * 20 + 7, w - m.right - 4, y + i * 20 + 7);
      }

      // Schedule block (right column concept — use bottom area in portrait)
      y += taskCount * 20 + 12;
      const remainingH = h - m.bottom - y;

      if (remainingH > 80) {
        const halfW = (bodyW - 12) / 2;

        drawSectionTitle(doc, "Schedule", m.left + 4, y);
        const scheduleTop = y + 8;
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        const slotH = Math.min(16, (remainingH - 20) / hours.length);
        hours.forEach((hr, idx) => {
          const sy = scheduleTop + idx * slotH;
          doc.setFontSize(5.5);
          const [tr, tg, tb] = COLORS.textLight;
          doc.setTextColor(tr, tg, tb);
          const label = hr < 12 ? `${hr}am` : hr === 12 ? "12pm" : `${hr - 12}pm`;
          doc.text(label, m.left + 6, sy + 6);
          const [lr, lg, lb] = COLORS.lineLight;
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.2);
          doc.line(m.left + 24, sy, m.left + halfW, sy);
        });

        drawSectionTitle(doc, "Notes", m.left + halfW + 16, y);
        drawHorizontalLines(doc, variants, {
          startY: y + 8,
          endY: h - m.bottom,
          spacing: 16,
        });
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`daily-focus-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Daily Focus Page"
      description="Structured daily page with top 3 priorities, task checklist, time schedule, and notes."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Date & theme header</div>
          <div>Top 3 priorities with checkboxes</div>
          <div>8-item task checklist</div>
          <div>Time schedule (8am–5pm)</div>
          <div>Notes section</div>
        </div>
      )}
    </TemplateShell>
  );
}
