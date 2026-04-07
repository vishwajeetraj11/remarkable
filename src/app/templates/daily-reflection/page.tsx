"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
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

export default function DailyReflectionPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Reflection", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");
      drawLabeledLine(doc, "Date:", m.left + bodyW * 0.55, m.top + 16, w - m.right - 4);

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      const sections = [
        { title: "Morning Intention", lines: 3 },
        { title: "What Went Well Today", lines: 4 },
        { title: "What I Learned", lines: 3 },
        { title: "What Could Be Better", lines: 3 },
        { title: "Free Journaling", lines: 0 },
      ];

      let y = m.top + 32;
      const totalFixedLines = sections.reduce((a, s) => a + s.lines, 0);
      const fixedH = totalFixedLines * 18 + sections.length * 20;
      const freeH = h - m.bottom - y - fixedH;

      sections.forEach((section) => {
        drawSectionTitle(doc, section.title, m.left + 4, y);
        const endY = section.lines > 0 ? y + section.lines * 18 + 4 : y + freeH;
        drawHorizontalLines(doc, variants, {
          startY: y + 2,
          endY,
          spacing: 18,
        });
        y = endY + 8;
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`daily-reflection-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Daily Reflection"
      description="Guided daily journal with morning intention, wins, learnings, improvements, and free journaling."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Morning intention</div>
          <div>What went well</div>
          <div>What I learned</div>
          <div>What could be better</div>
          <div>Free journaling space</div>
        </div>
      )}
    </TemplateShell>
  );
}
