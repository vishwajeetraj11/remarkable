"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
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

export default function WeeklyReviewPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Weekly Review", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");
      drawLabeledLine(doc, "Week of:", m.left + bodyW * 0.5, m.top + 16, w - m.right - 4);

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      let y = m.top + 32;

      // Wins
      drawSectionTitle(doc, "Wins This Week", m.left + 4, y);
      y += 10;
      for (let i = 0; i < 3; i++) {
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 4, y + i * 18 + 8, w - m.right - 4, y + i * 18 + 8);
      }

      y += 62;
      drawSectionTitle(doc, "Challenges / Lessons", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 54,
        spacing: 18,
      });

      y += 66;
      drawSectionTitle(doc, "Incomplete — Carry Forward", m.left + 4, y);
      y += 10;
      for (let i = 0; i < 4; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 20, 7);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * 20 + 7, w - m.right - 4, y + i * 20 + 7);
      }

      y += 90;
      const halfW = (bodyW - 12) / 2;

      drawSectionTitle(doc, "Energy / Mood", m.left + 4, y);
      doc.setFontSize(7);
      const [tr, tg, tb] = COLORS.textLight;
      doc.setTextColor(tr, tg, tb);
      doc.text("1  ○   2  ○   3  ○   4  ○   5", m.left + 4, y + 14);

      drawSectionTitle(doc, "Productivity", m.left + halfW + 16, y);
      doc.setFontSize(7);
      doc.setTextColor(tr, tg, tb);
      doc.text("1  ○   2  ○   3  ○   4  ○   5", m.left + halfW + 16, y + 14);

      y += 30;
      doc.setDrawColor(lr, lg, lb);
      doc.line(m.left, y, w - m.right, y);
      y += 10;

      drawSectionTitle(doc, "Next Week's Focus", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: h - m.bottom,
        spacing: 18,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`weekly-review-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Weekly Review"
      description="End-of-week review with wins, lessons, carry-forward tasks, and next week's focus."
      showWeekStart
      onGenerate={generate}
      defaultPageCount={4}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Wins this week</div>
          <div>Challenges & lessons</div>
          <div>Carry-forward checkboxes</div>
          <div>Energy & productivity ratings</div>
          <div>Next week&apos;s focus</div>
        </div>
      )}
    </TemplateShell>
  );
}
