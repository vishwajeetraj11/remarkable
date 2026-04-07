"use client";

import {
  createDoc,
  drawHeader,
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

export default function ClientCallPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Client Call Sheet", dark: true });

      let y = m.top + 44;
      drawLabeledLine(doc, "Client:", m.left + 4, y, m.left + 200);
      drawLabeledLine(doc, "Date:", m.left + 210, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Contact:", m.left + 4, y, m.left + 200);
      drawLabeledLine(doc, "Project:", m.left + 210, y, w - m.right - 4);

      y += 22;
      drawSectionTitle(doc, "Prep / Context", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 54,
        spacing: 18,
      });

      y += 66;
      drawSectionTitle(doc, "Talking Points", m.left + 4, y);
      y += 10;
      for (let i = 0; i < 5; i++) {
        const bullet = `${i + 1}.`;
        doc.setFontSize(7);
        const [tr, tg, tb] = COLORS.textLight;
        doc.setTextColor(tr, tg, tb);
        doc.text(bullet, m.left + 6, y + i * 20 + 7);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * 20 + 8, w - m.right - 4, y + i * 20 + 8);
      }

      y += 108;
      drawSectionTitle(doc, "Client Notes / Feedback", m.left + 4, y);
      const notesEnd = h - m.bottom - 90;
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: notesEnd,
        spacing: 18,
      });

      y = notesEnd + 10;
      drawSectionTitle(doc, "Follow-Up Actions", m.left + 4, y);
      y += 10;
      const remaining = Math.floor((h - m.bottom - y) / 20);
      for (let i = 0; i < remaining; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 20, 7);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * 20 + 7, w - m.right - 4, y + i * 20 + 7);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`client-call-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Client Call Sheet"
      description="Prep, talking points, client feedback, and follow-up actions for client calls."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Client & contact header</div>
          <div>Prep / context section</div>
          <div>Numbered talking points</div>
          <div>Client feedback notes</div>
          <div>Follow-up action checkboxes</div>
        </div>
      )}
    </TemplateShell>
  );
}
